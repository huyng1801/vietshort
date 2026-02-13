import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

// ─── Google OAuth Strategy ────────────────────────────
@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(GoogleStrategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('security.oauth.google.clientId'),
      clientSecret: configService.get('security.oauth.google.clientSecret'),
      callbackURL: configService.get('security.oauth.google.callbackUrl') || '/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      const result = await this.authService.oauthLogin('google', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value,
      });
      done(null, result);
    } catch (error) {
      done(error, false);
    }
  }
}

// ─── Facebook OAuth Strategy ──────────────────────────
@Injectable()
export class FacebookOAuthStrategy extends PassportStrategy(FacebookStrategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('security.oauth.facebook.clientId'),
      clientSecret: configService.get('security.oauth.facebook.clientSecret'),
      callbackURL: configService.get('security.oauth.facebook.callbackUrl') || '/api/v1/auth/facebook/callback',
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
    done: VerifyCallback,
  ) {
    try {
      const result = await this.authService.oauthLogin('facebook', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
        avatar: profile.photos?.[0]?.value,
      });
      done(null, result);
    } catch (error) {
      done(error, false);
    }
  }
}

// ─── Apple OAuth Strategy ─────────────────────────────
@Injectable()
export class AppleOAuthStrategy extends PassportStrategy(AppleStrategy, 'apple') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('security.oauth.apple.clientId'), // Service ID
      teamID: configService.get('security.oauth.apple.teamId'),
      keyID: configService.get('security.oauth.apple.keyId'),
      privateKeyString: configService.get('security.oauth.apple.privateKey'),
      callbackURL: configService.get('security.oauth.apple.callbackUrl') || '/api/v1/auth/apple/callback',
      scope: ['email', 'name'],
      passReqToCallback: false,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      const result = await this.authService.oauthLogin('apple', {
        id: profile.id,
        email: profile.email,
        name: profile.name ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim() : undefined,
        avatar: undefined, // Apple không cung cấp avatar
      });
      done(null, result);
    } catch (error) {
      done(error, false);
    }
  }
}

// ─── TikTok OAuth Strategy (Custom Implementation) ────
@Injectable()
export class TikTokOAuthService {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  /**
   * TikTok OAuth Flow:
   * 1. Generate authorization URL
   * 2. User authorizes on TikTok
   * 3. Handle callback with code
   * 4. Exchange code for access token
   * 5. Get user info
   */

  getAuthorizationUrl(state: string): string {
    const clientKey = this.configService.get('security.oauth.tiktok.clientKey');
    const redirectUri = this.configService.get('security.oauth.tiktok.callbackUrl') || '/api/v1/auth/tiktok/callback';
    const scope = 'user.info.basic,user.info.profile';

    return `https://www.tiktok.com/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
  }

  async handleCallback(code: string) {
    const clientKey = this.configService.get('security.oauth.tiktok.clientKey');
    const clientSecret = this.configService.get('security.oauth.tiktok.clientSecret');
    const redirectUri = this.configService.get('security.oauth.tiktok.callbackUrl');

    // Exchange code for access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenResponse.json()) as { data?: { access_token?: string } };
    if (!tokenData.data?.access_token) {
      throw new Error('Failed to get TikTok access token');
    }

    // Get user info
    const userResponse = await fetch('https://open-api.tiktok.com/user/info/', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenData.data.access_token}` },
    });

    const userData = (await userResponse.json()) as { data?: { user?: { open_id: string; display_name: string; avatar_url?: string } } };
    if (!userData.data?.user) {
      throw new Error('Failed to get TikTok user info');
    }

    const user = userData.data.user;
    return this.authService.oauthLogin('tiktok', {
      id: user.open_id,
      email: undefined, // TikTok doesn't provide email by default
      name: user.display_name,
      avatar: user.avatar_url,
    });
  }
}
