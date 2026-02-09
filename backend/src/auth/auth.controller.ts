import { Controller, Post, Body, Get, Req, HttpCode, HttpStatus, UseGuards, Ip, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  GuestLoginDto,
  LinkAccountDto,
  UpgradeGuestDto,
  SubmitReferralCodeDto,
} from './dto/auth.dto';
import { Public, CurrentUser } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { TikTokOAuthService } from './oauth.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tiktokOAuthService: TikTokOAuthService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Email/nickname đã tồn tại' })
  async register(@Body() dto: RegisterDto, @Ip() ip: string, @Req() req: Request) {
    return this.authService.register(dto, ip, req.headers['user-agent']);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập bằng email/nickname + mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không chính xác' })
  @ApiResponse({ status: 403, description: 'Tài khoản bị khóa hoặc rate limited' })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới access token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(@CurrentUser('id') userId: string, @Body() body: { refreshToken?: string }) {
    return this.authService.logout(userId, body.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng reset token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Thay đổi mật khẩu' })
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  async getProfile(@CurrentUser() user: any) {
    return { user };
  }

  // ─── Guest Mode Endpoints ─────────────────────────────

  @Public()
  @Post('guest/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập chế độ khách (Guest Mode)' })
  @ApiResponse({ status: 200, description: 'Đăng nhập guest thành công' })
  async guestLogin(@Body() dto: GuestLoginDto, @Ip() ip: string, @Req() req: Request) {
    return this.authService.guestLogin(dto, ip, req.headers['user-agent']);
  }

  @Public()
  @Post('guest/link-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liên kết tài khoản khách với email/password' })
  @ApiResponse({ status: 200, description: 'Liên kết thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản guest' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  async linkAccount(@Body() dto: LinkAccountDto) {
    return this.authService.linkAccount(dto);
  }

  @Public()
  @Post('guest/upgrade')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nâng cấp tài khoản guest thành tài khoản chính thức' })
  @ApiResponse({ status: 200, description: 'Nâng cấp thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản guest' })
  @ApiResponse({ status: 409, description: 'Email/nickname đã tồn tại' })
  async upgradeGuest(@Body() dto: UpgradeGuestDto) {
    return this.authService.upgradeGuest(dto);
  }

  // ─── Referral Code Endpoints ──────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post('referral/submit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Nhập mã giới thiệu CTV sau khi đăng ký' })
  @ApiResponse({ status: 200, description: 'Mã giới thiệu đã được áp dụng' })
  @ApiResponse({ status: 400, description: 'Mã không hợp lệ hoặc đã nhập trước đó' })
  async submitReferralCode(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitReferralCodeDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    return this.authService.submitReferralCode(userId, dto, ip, req.headers['user-agent']);
  }

  // ─── OAuth Endpoints ──────────────────────────────────

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth - Initiate' })
  async googleAuth() {
    // Redirect to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth - Callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = req.user as any;
    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  }

  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth - Initiate' })
  async facebookAuth() {
    // Redirect to Facebook
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth - Callback' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = req.user as any;
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  }

  @Public()
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple OAuth - Initiate' })
  async appleAuth() {
    // Redirect to Apple
  }

  @Public()
  @Post('apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple OAuth - Callback (Apple uses POST)' })
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = req.user as any;
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  }

  @Public()
  @Get('tiktok')
  @ApiOperation({ summary: 'TikTok OAuth - Initiate' })
  async tiktokAuth(@Res() res: Response) {
    const state = Math.random().toString(36).substring(7);
    const authUrl = this.tiktokOAuthService.getAuthorizationUrl(state);
    return res.redirect(authUrl);
  }

  @Public()
  @Get('tiktok/callback')
  @ApiOperation({ summary: 'TikTok OAuth - Callback' })
  async tiktokAuthCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const result = await this.tiktokOAuthService.handleCallback(code);
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=${message}`);
    }
  }
}
