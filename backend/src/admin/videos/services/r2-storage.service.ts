import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cdnBaseUrl: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get('storage.r2.endpoint');
    const accessKey = this.configService.get('storage.r2.accessKey');
    const secretKey = this.configService.get('storage.r2.secretKey');
    this.bucket = this.configService.get('storage.r2.bucket') || 'vietshort-media';
    this.cdnBaseUrl = this.configService.get('storage.cdnBaseUrl') || '';

    // Log configuration for debugging
    this.logger.log('Initializing R2StorageService with config:');
    this.logger.log(`Endpoint: ${endpoint ? endpoint.substring(0, 30) + '...' : 'NOT SET'}`);
    this.logger.log(`Bucket: ${this.bucket}`);
    this.logger.log(`CDN Base URL: ${this.cdnBaseUrl || 'NOT SET'}`);

    if (!endpoint || !accessKey || !secretKey) {
      this.logger.error('Missing required R2 configuration. Please check environment variables.');
      throw new Error('R2 Storage configuration is incomplete');
    }

    // Create HTTPS agent with proper TLS configuration for R2
    const httpsAgent = new https.Agent({
      keepAlive: true,
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
    });

    const httpAgent = new http.Agent({
      keepAlive: true,
    });

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      httpAgent: httpAgent,
      httpsAgent: httpsAgent,
      tls: true,
    });

    this.logger.log('R2StorageService initialized successfully');
  }

  /**
   * Generate presigned PUT URL for poster upload
   * Poster path: cdn/posters/{videoId}/poster.{ext}
   */
  async generatePosterUploadUrl(
    videoId: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{ uploadUrl: string; posterKey: string; publicUrl: string }> {
    try {
      this.logger.log(`Generating poster upload URL for video ${videoId}, type: ${contentType}`);
      
      // Validate input parameters
      if (!videoId?.trim()) {
        throw new Error('Video ID is required');
      }
      if (!contentType?.trim()) {
        throw new Error('Content type is required');
      }

      const ext = this.getExtFromContentType(contentType);
      const posterKey = `cdn/posters/${videoId}/poster.${ext}`;

      this.logger.log(`Creating presigned URL with bucket: ${this.bucket}, key: ${posterKey}`);
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: posterKey,
        ContentType: contentType,
      });

      this.logger.log(`Requesting presigned URL from S3 client...`);
      
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      const publicUrl = this.getCdnUrl(posterKey);

      this.logger.log(`Successfully generated presigned poster upload URL for ${posterKey}`);
      this.logger.log(`Upload URL length: ${uploadUrl.length}`);
      this.logger.log(`Public URL: ${publicUrl}`);
      
      return { uploadUrl, posterKey, publicUrl };
    } catch (error) {
      this.logger.error(`Failed to generate poster upload URL for video ${videoId}:`);
      this.logger.error(`Error name: ${(error as any)?.name}`);
      this.logger.error(`Error message: ${(error as any)?.message || error}`);
      this.logger.error(`Error stack: ${(error as Error)?.stack}`);
      
      if ((error as any)?.name === 'CredentialsProviderError') {
        this.logger.error('R2 credentials are invalid. Please check your access keys.');
      } else if ((error as any)?.name === 'NetworkError') {
        this.logger.error('Network error occurred. Please check R2 endpoint configuration.');
      }
      
      throw error;
    }
  }

  /**
   * Generate presigned PUT URL for direct upload from CMS to R2
   * Raw bucket path: raw/videos/{videoId}/ep-{episodeNumber}/source.{ext}
   */
  async generateUploadUrl(
    videoId: string,
    episodeNumber: number,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{ uploadUrl: string; sourceKey: string }> {
    try {
      this.logger.log(`Generating upload URL for video ${videoId}, episode ${episodeNumber}, type: ${contentType}`);
      
      // Validate input parameters
      if (!videoId?.trim()) {
        throw new Error('Video ID is required');
      }
      if (!episodeNumber || episodeNumber < 1) {
        throw new Error('Valid episode number is required');
      }
      if (!contentType?.trim()) {
        throw new Error('Content type is required');
      }

      const ext = this.getExtFromContentType(contentType);
      const sourceKey = `raw/videos/${videoId}/ep-${episodeNumber}/source.${ext}`;

      this.logger.log(`Creating presigned URL with bucket: ${this.bucket}, key: ${sourceKey}`);
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: sourceKey,
        ContentType: contentType,
      });

      this.logger.log(`Requesting presigned URL from S3 client...`);
      
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Successfully generated presigned upload URL for ${sourceKey}`);
      this.logger.log(`Upload URL length: ${uploadUrl.length}`);
      this.logger.log(`Upload URL domain: ${new URL(uploadUrl).hostname}`);
      this.logger.debug(`Upload URL: ${uploadUrl.split('?')[0]}?[REDACTED]`);
      
      return { uploadUrl, sourceKey };
    } catch (error) {
      this.logger.error(`Failed to generate upload URL for video ${videoId}, episode ${episodeNumber}:`);
      this.logger.error(`Error name: ${(error as any)?.name}`);
      this.logger.error(`Error message: ${(error as any)?.message || error}`);
      this.logger.error(`Error stack: ${(error as Error)?.stack}`);
      
      if ((error as any)?.name === 'CredentialsProviderError') {
        this.logger.error('R2 credentials are invalid. Please check your access keys.');
      } else if ((error as any)?.name === 'NetworkError') {
        this.logger.error('Network error occurred. Please check R2 endpoint configuration.');
      }
      
      throw error;
    }
  }

  /**
   * Generate presigned GET URL for downloading raw source file (for encode worker)
   */
  async generateDownloadUrl(sourceKey: string, expiresIn = 7200): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: sourceKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  /**
   * Download an object from R2 as Buffer (for subtitle worker, etc.)
   */
  async getObject(key: string): Promise<Buffer> {
    this.logger.log(`Downloading object from R2: ${key}`);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const stream = response.Body as NodeJS.ReadableStream;

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    this.logger.log(`Downloaded ${buffer.length} bytes from R2: ${key}`);
    return buffer;
  }

  /**
   * Upload HLS segments to CDN bucket
   * CDN path: cdn/videos/{videoId}/ep-{episodeNumber}/{quality}/
   */
  async uploadBuffer(key: string, body: Buffer, contentType: string): Promise<string> {
    try {
      this.logger.log(`Uploading buffer to R2: key=${key}, size=${body.length} bytes, contentType=${contentType}`);
      
      if (!key?.trim()) {
        throw new Error('Object key is required');
      }
      if (!body || body.length === 0) {
        throw new Error('Buffer is empty or invalid');
      }
      if (!contentType?.trim()) {
        throw new Error('Content type is required');
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      this.logger.log(`Sending upload command to R2...`);
      const result = await this.s3Client.send(command);
      
      const cdnUrl = `${this.cdnBaseUrl}/${key}`;
      
      this.logger.log(`Successfully uploaded to R2. ETag: ${result.ETag}`);
      this.logger.log(`CDN URL: ${cdnUrl}`);
      
      return cdnUrl;
    } catch (error) {
      this.logger.error(`Failed to upload buffer to R2:`);
      this.logger.error(`Key: ${key}`);
      this.logger.error(`Buffer size: ${body?.length} bytes`);
      this.logger.error(`Error name: ${(error as any)?.name}`);
      this.logger.error(`Error message: ${(error as any)?.message || error}`);
      this.logger.error(`Error stack: ${(error as Error)?.stack}`);
      
      if ((error as any)?.name === 'NoSuchBucket') {
        this.logger.error(`Bucket '${this.bucket}' does not exist. Please create the bucket first.`);
      } else if ((error as any)?.name === 'AccessDenied') {
        this.logger.error('Access denied. Please check your R2 credentials and permissions.');
      }
      
      throw error;
    }
  }

  /**
   * Test R2 connection and bucket access
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log('Testing R2 connection...');
      
      // Try to list objects in bucket (just check if bucket exists and we have access)
      const testKey = `test-connection-${Date.now()}.txt`;
      const testBuffer = Buffer.from('test connection');
      
      // Try to upload a small test file
      await this.uploadBuffer(testKey, testBuffer, 'text/plain');
      this.logger.log('Test upload successful');
      
      // Try to check if the file exists
      const exists = await this.checkObjectExists(testKey);
      this.logger.log(`Test file exists: ${exists.exists}`);
      
      // Clean up test file
      await this.deleteObject(testKey);
      this.logger.log('Test file cleaned up');
      
      return {
        success: true,
        message: 'R2 connection test successful'
      };
    } catch (error) {
      this.logger.error(`R2 connection test failed: ${(error as any)?.message || error}`);
      return {
        success: false,
        message: `R2 connection test failed: ${(error as any)?.message || error}`
      };
    }
  }

  /**
   * Check if an object exists in R2
   */
  async checkObjectExists(key: string): Promise<{ exists: boolean; contentLength?: number; lastModified?: Date }> {
    try {
      this.logger.log(`Checking if object exists: ${key}`);
      
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(headCommand);
      
      this.logger.log(`Object exists: ${key}, size: ${response.ContentLength} bytes`);
      
      return {
        exists: true,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
      };
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        this.logger.warn(`Object not found: ${key}`);
        return { exists: false };
      }
      this.logger.error(`Error checking object existence for ${key}: ${(error as any)?.message || error}`);
      throw error;
    }
  }

  /**
   * Delete an object from R2
   */
  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  /**
   * Build the R2 key for HLS output
   */
  getHlsOutputPath(videoId: string, episodeNumber: number): string {
    return `cdn/videos/${videoId}/ep-${episodeNumber}`;
  }

  /**
   * Build master manifest CDN URL
   */
  getMasterManifestUrl(videoId: string, episodeNumber: number): string {
    return `${this.cdnBaseUrl}/cdn/videos/${videoId}/ep-${episodeNumber}/master.m3u8`;
  }

  /**
   * Get full CDN URL for a given key
   */
  getCdnUrl(key: string): string {
    return `${this.cdnBaseUrl}/${key}`;
  }

  private getExtFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/x-matroska': 'mkv',
      'video/webm': 'webm',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return map[contentType] || 'jpg';
  }
}
