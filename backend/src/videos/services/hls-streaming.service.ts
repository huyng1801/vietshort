import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class HlsStreamingService {
  private readonly cdnBaseUrl: string;
  private readonly r2SecretKey: string;

  constructor(private configService: ConfigService) {
    this.cdnBaseUrl = this.configService.get('storage.cdnBaseUrl') || '';
    this.r2SecretKey = this.configService.get('storage.r2.secretKey') || '';
  }

  /**
   * Generate a signed HLS manifest URL with expiration
   */
  generateSignedUrl(path: string, expiresInSeconds = 3600): string {
    const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const stringToSign = `${path}${expiry}`;
    const signature = crypto
      .createHmac('sha256', this.r2SecretKey)
      .update(stringToSign)
      .digest('hex');

    return `${this.cdnBaseUrl}/${path}?expires=${expiry}&sig=${signature}`;
  }

  /**
   * Validate a signed URL
   */
  validateSignedUrl(path: string, expires: string, signature: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    if (parseInt(expires) < now) return false;

    const expectedSig = crypto
      .createHmac('sha256', this.r2SecretKey)
      .update(`${path}${expires}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  }

  /**
   * Generate manifest with signed segment URLs
   */
  generateSignedManifest(episodeId: string, qualities: string[] = ['360p', '480p', '720p', '1080p']): string {
    const masterPlaylist = ['#EXTM3U', '#EXT-X-VERSION:3'];

    const bandwidths: Record<string, number> = {
      '360p': 800000, '480p': 1400000, '720p': 2800000, '1080p': 5000000,
    };
    const resolutions: Record<string, string> = {
      '360p': '640x360', '480p': '854x480', '720p': '1280x720', '1080p': '1920x1080',
    };

    for (const quality of qualities) {
      const url = this.generateSignedUrl(`videos/${episodeId}/${quality}/playlist.m3u8`);
      masterPlaylist.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidths[quality]},RESOLUTION=${resolutions[quality]}`,
        url,
      );
    }

    return masterPlaylist.join('\n');
  }
}
