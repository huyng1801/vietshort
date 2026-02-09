import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../config/database.config';
import { RedisService } from '../config/redis.config';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  GuestLoginDto,
  LinkAccountDto,
  UpgradeGuestDto,
  SubmitReferralCodeDto,
  LinkOAuthDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly bcryptRounds: number;
  private readonly maxLoginAttempts = 5;
  private readonly lockDuration = 900; // 15 min

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    this.bcryptRounds = this.configService.get('security.bcryptRounds') || 12;
  }

  // ─── Register ─────────────────────────────────────────
  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    // Generate nickname if not provided
    const nickname = dto.nickname || `user_${crypto.randomBytes(4).toString('hex')}`;
    
    const [existingEmail, existingNick] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findUnique({ where: { nickname } }),
    ]);
    if (existingEmail) throw new ConflictException('Email đã được sử dụng');
    if (existingNick) throw new ConflictException('Nickname đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        nickname,
        passwordHash,
        firstName: dto.firstName || undefined,
        lastName: dto.lastName || undefined,
        phone: dto.phone || undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        isEmailVerified: false,
      },
    });

    // Xử lý referral code nếu có
    if (dto.referralCode) {
      await this.trackReferral(user.id, dto.referralCode, ipAddress, userAgent);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ─── Login ────────────────────────────────────────────
  async login(dto: LoginDto, ip?: string) {
    const rateLimitKey = `login_attempts:${ip || dto.login}`;
    const attempts = await this.redisService.getRateLimit(rateLimitKey);
    if (attempts >= this.maxLoginAttempts) {
      throw new ForbiddenException('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.');
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.login }, { nickname: dto.login }] },
    });

    if (!user || !user.passwordHash) {
      await this.redisService.incrementRateLimit(rateLimitKey, this.lockDuration);
      throw new UnauthorizedException('Email/nickname hoặc mật khẩu không chính xác');
    }

    if (user.isLocked) throw new ForbiddenException('Tài khoản đã bị khóa: ' + (user.lockReason || 'Vi phạm'));
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị vô hiệu hóa');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      await this.redisService.incrementRateLimit(rateLimitKey, this.lockDuration);
      throw new UnauthorizedException('Email/nickname hoặc mật khẩu không chính xác');
    }

    await this.redisService.del(rateLimitKey);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ─── OAuth ────────────────────────────────────────────
  async oauthLogin(provider: string, profile: { id: string; email?: string; name?: string; avatar?: string }) {
    const providerField = `${provider}Id`;
    let user = await this.prisma.user.findFirst({ where: { [providerField]: profile.id } as any });

    if (!user && profile.email) {
      user = await this.prisma.user.findUnique({ where: { email: profile.email } });
      if (user) {
        await this.prisma.user.update({ where: { id: user.id }, data: { [providerField]: profile.id } as any });
      }
    }

    if (!user) {
      const nickname = await this.generateUniqueNickname(profile.name || profile.email?.split('@')[0] || 'user');
      user = await this.prisma.user.create({
        data: {
          email: profile.email || `${provider}_${profile.id}@oauth.local`,
          nickname,
          firstName: profile.name?.split(' ')[0],
          lastName: profile.name?.split(' ').slice(1).join(' '),
          avatar: profile.avatar,
          [providerField]: profile.id,
          isEmailVerified: !!profile.email,
        } as any,
      });
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.generateTokens(user.id, user.email);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  // ─── Refresh ──────────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await this.generateTokens(stored.userId, stored.user.email);
    return { user: this.sanitizeUser(stored.user), ...tokens };
  }

  // ─── Logout ───────────────────────────────────────────
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    await this.redisService.set(`blacklist:${userId}`, true, 86400);
  }

  // ─── Forgot Password ─────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    await this.redisService.set(`password_reset:${hashed}`, user.id, 3600);

    // TODO: Send email via Resend
    return { message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' };
  }

  // ─── Reset Password ──────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const hashed = crypto.createHash('sha256').update(dto.token).digest('hex');
    const userId = await this.redisService.get<string>(`password_reset:${hashed}`);
    if (!userId) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.redisService.del(`password_reset:${hashed}`);
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }

  // ─── Change Password ─────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) throw new BadRequestException('Không thể thay đổi mật khẩu');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');

    const passwordHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Mật khẩu đã được thay đổi thành công' };
  }

  // ─── Validate user (for JWT strategy) ─────────────────
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive || user.isLocked) return null;
    const isBlacklisted = await this.redisService.exists(`blacklist:${userId}`);
    if (isBlacklisted) return null;
    return this.sanitizeUser(user);
  }

  // ─── Helpers ──────────────────────────────────────────
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private async generateUniqueNickname(base: string): Promise<string> {
    const clean = base.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'user';
    let nickname = clean;
    let counter = 1;
    while (await this.prisma.user.findUnique({ where: { nickname } })) {
      nickname = `${clean}${counter++}`;
    }
    return nickname;
  }

  // ─── Guest Mode ───────────────────────────────────────
  async guestLogin(dto: GuestLoginDto, ipAddress?: string, userAgent?: string) {
    // Kiểm tra xem deviceId đã có tài khoản guest chưa
    let user = await this.prisma.user.findFirst({
      where: { deviceId: dto.deviceId },
    });

    if (!user) {
      // Tạo tài khoản guest mới
      const nickname = await this.generateUniqueNickname(`guest_${dto.deviceId.substring(0, 8)}`);
      const email = `${dto.deviceId}@guest.local`;

      user = await this.prisma.user.create({
        data: {
          email,
          nickname,
          deviceId: dto.deviceId,
          passwordHash: null, // Guest không có password
          isEmailVerified: false,
        },
      });

      // Xử lý referral code nếu có
      if (dto.referralCode) {
        await this.trackReferral(user.id, dto.referralCode, ipAddress, userAgent, true);
      }
    } else {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: this.sanitizeUser(user),
      isGuest: true,
      ...tokens,
    };
  }

  // ─── Link Guest Account to Email ──────────────────────
  async linkAccount(dto: LinkAccountDto) {
    // Tìm tài khoản guest
    const guestUser = await this.prisma.user.findFirst({
      where: { deviceId: dto.deviceId },
    });

    if (!guestUser) {
      throw new NotFoundException('Không tìm thấy tài khoản guest với device ID này');
    }

    if (guestUser.passwordHash) {
      throw new BadRequestException('Tài khoản này đã được liên kết');
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Kiểm tra nickname nếu có
    if (dto.nickname) {
      const existingNick = await this.prisma.user.findUnique({
        where: { nickname: dto.nickname },
      });
      if (existingNick) {
        throw new ConflictException('Nickname đã được sử dụng');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    // Update tài khoản guest thành tài khoản chính thức
    const updatedUser = await this.prisma.user.update({
      where: { id: guestUser.id },
      data: {
        email: dto.email,
        nickname: dto.nickname || guestUser.nickname,
        passwordHash,
        isEmailVerified: false,
      },
    });

    // Xóa tất cả refresh tokens cũ
    await this.prisma.refreshToken.deleteMany({ where: { userId: guestUser.id } });

    const tokens = await this.generateTokens(updatedUser.id, updatedUser.email);
    return { user: this.sanitizeUser(updatedUser), ...tokens };
  }

  // ─── Upgrade Guest to Full Account ───────────────────
  async upgradeGuest(dto: UpgradeGuestDto) {
    const guestUser = await this.prisma.user.findFirst({
      where: { deviceId: dto.deviceId },
    });

    if (!guestUser) {
      throw new NotFoundException('Không tìm thấy tài khoản guest');
    }

    if (guestUser.passwordHash) {
      throw new BadRequestException('Tài khoản này đã được nâng cấp');
    }

    // Kiểm tra email và nickname
    const [existingEmail, existingNick] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findUnique({ where: { nickname: dto.nickname } }),
    ]);

    if (existingEmail) throw new ConflictException('Email đã được sử dụng');
    if (existingNick) throw new ConflictException('Nickname đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    const upgradedUser = await this.prisma.user.update({
      where: { id: guestUser.id },
      data: {
        email: dto.email,
        nickname: dto.nickname,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isEmailVerified: false,
        // Giữ nguyên deviceId để theo dõi
      },
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId: guestUser.id } });

    const tokens = await this.generateTokens(upgradedUser.id, upgradedUser.email);
    return {
      user: this.sanitizeUser(upgradedUser),
      message: 'Nâng cấp tài khoản thành công',
      ...tokens,
    };
  }

  // ─── Submit Referral Code ─────────────────────────────
  async submitReferralCode(userId: string, dto: SubmitReferralCodeDto, ipAddress?: string, userAgent?: string) {
    // Kiểm tra xem user đã có referral chưa
    const existingReferral = await this.prisma.ctvReferral.findFirst({
      where: { userId },
    });

    if (existingReferral) {
      throw new BadRequestException('Bạn đã nhập mã giới thiệu trước đó');
    }

    const result = await this.trackReferral(userId, dto.referralCode, ipAddress, userAgent);
    return result;
  }

  // ─── Link OAuth to Guest Account ──────────────────────
  async linkOAuthToGuest(dto: LinkOAuthDto, oauthProfile: { id: string; email?: string; name?: string; avatar?: string }) {
    const guestUser = await this.prisma.user.findFirst({
      where: { deviceId: dto.deviceId },
    });

    if (!guestUser) {
      throw new NotFoundException('Không tìm thấy tài khoản guest');
    }

    const providerField = `${dto.provider}Id`;

    // Kiểm tra xem OAuth ID đã được dùng chưa
    const existingOAuth = await this.prisma.user.findFirst({
      where: { [providerField]: oauthProfile.id } as any,
    });

    if (existingOAuth) {
      throw new ConflictException('Tài khoản OAuth này đã được liên kết với tài khoản khác');
    }

    // Update guest user với OAuth info
    const updatedUser = await this.prisma.user.update({
      where: { id: guestUser.id },
      data: {
        email: oauthProfile.email || guestUser.email,
        [providerField]: oauthProfile.id,
        avatar: oauthProfile.avatar || guestUser.avatar,
        firstName: oauthProfile.name?.split(' ')[0] || guestUser.firstName,
        lastName: oauthProfile.name?.split(' ').slice(1).join(' ') || guestUser.lastName,
        isEmailVerified: !!oauthProfile.email,
      } as any,
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId: guestUser.id } });

    const tokens = await this.generateTokens(updatedUser.id, updatedUser.email);
    return { user: this.sanitizeUser(updatedUser), ...tokens };
  }

  // ─── Track Referral Helper ────────────────────────────
  private async trackReferral(
    userId: string,
    referralCode: string,
    ipAddress?: string,
    userAgent?: string,
    isClick: boolean = false,
  ) {
    // Tìm affiliate theo referral code
    const affiliate = await this.prisma.ctvAffiliate.findUnique({
      where: { referralCode },
    });

    if (!affiliate) {
      throw new BadRequestException('Mã giới thiệu không hợp lệ');
    }

    if (!affiliate.isActive) {
      throw new BadRequestException('Mã giới thiệu đã bị vô hiệu hóa');
    }

    // Kiểm tra xem user đã có referral từ CTV này chưa
    const existingReferral = await this.prisma.ctvReferral.findUnique({
      where: {
        affiliateId_userId: {
          affiliateId: affiliate.id,
          userId,
        },
      },
    });

    if (existingReferral) {
      return {
        success: true,
        message: 'Mã giới thiệu đã được ghi nhận trước đó',
        affiliate: {
          companyName: affiliate.companyName,
          referralCode: affiliate.referralCode,
        },
      };
    }

    // Tạo referral mới
    await this.prisma.ctvReferral.create({
      data: {
        affiliateId: affiliate.id,
        userId,
        clickedAt: isClick ? new Date() : null,
        registeredAt: !isClick ? new Date() : null,
        ipAddress,
        userAgent,
      },
    });

    return {
      success: true,
      message: 'Mã giới thiệu đã được áp dụng thành công',
      affiliate: {
        companyName: affiliate.companyName,
        referralCode: affiliate.referralCode,
      },
    };
  }
}
