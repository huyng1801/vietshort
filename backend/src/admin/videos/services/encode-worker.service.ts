import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../config/database.config';
import { RedisService } from '../../../config/redis.config';
import { R2StorageService } from './r2-storage.service';
import { EncodingStatus } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

interface EncodingJob {
  episodeId: string;
  sourceUrl: string;
  qualities: string[];
}

interface QualityConfig {
  name: string;
  resolution: string;
  width: number;
  height: number;
  bitrate: string;
  audioBitrate: string;
  bandwidth: number;
}

const QUALITY_PRESETS: QualityConfig[] = [
  { name: '540p', resolution: '960x540', width: 960, height: 540, bitrate: '1200k', audioBitrate: '96k', bandwidth: 1200000 },
  { name: '720p', resolution: '1280x720', width: 1280, height: 720, bitrate: '2500k', audioBitrate: '128k', bandwidth: 2500000 },
  { name: '1080p', resolution: '1920x1080', width: 1920, height: 1080, bitrate: '5000k', audioBitrate: '192k', bandwidth: 5000000 },
];

@Injectable()
export class EncodeWorkerService implements OnModuleInit {
  private readonly logger = new Logger(EncodeWorkerService.name);
  private isProcessing = false;
  private readonly ffmpegPath: string;
  private readonly tmpDir: string;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private r2StorageService: R2StorageService,
    private configService: ConfigService,
  ) {
    this.ffmpegPath = this.configService.get('FFMPEG_PATH') || 'ffmpeg';
    this.tmpDir = path.join(os.tmpdir(), 'vietshort-encode');
  }

  async onModuleInit() {
    // Ensure temp directory exists
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }

    // Check FFmpeg availability
    await this.checkFFmpegAvailability();

    // Start polling the encoding queue
    this.startWorker();
  }

  /**
   * Check if FFmpeg is available in the system
   */
  private async checkFFmpegAvailability(): Promise<void> {
    try {
      const { stdout } = await execAsync(`${this.ffmpegPath} -version`);
      const version = stdout.split('\n')[0];
      this.logger.log(`✅ FFmpeg found: ${version}`);
    } catch (error) {
      this.logger.error(`❌ FFmpeg not found at: ${this.ffmpegPath}`);
      this.logger.error(`Please ensure FFmpeg is installed and in your PATH`);
      this.logger.error(`Download from: https://www.gyan.dev/ffmpeg/builds/`);
    }
  }

  /**
   * Main worker loop — polls Redis queue for encoding jobs
   */
  private async startWorker() {
    this.logger.log('🎬 Encode Worker started, polling for jobs...');

    // Poll every 5 seconds
    setInterval(async () => {
      if (this.isProcessing) return;

      try {
        const job = await this.redisService.getFromQueue('video-encoding');
        if (job) {
          this.isProcessing = true;
          await this.processJob(job.data as EncodingJob);
          this.isProcessing = false;
        }
      } catch (error) {
        this.logger.error('Worker error:', error);
        this.isProcessing = false;
      }
    }, 5000);
  }

  /**
   * Process a single encoding job
   */
  async processJob(job: EncodingJob) {
    const { episodeId, sourceUrl } = job;
    const logPrefix = `[Episode ${episodeId}]`;

    this.logger.log(`${logPrefix} Starting encoding...`);

    try {
      // 1. Update status to PROCESSING
      const episode = await this.prisma.episode.update({
        where: { id: episodeId },
        data: { encodingStatus: EncodingStatus.PROCESSING, encodingProgress: 0, encodingError: null },
        include: { video: { select: { id: true } } },
      });

      const videoId = episode.video.id;
      const epNum = episode.episodeNumber;
      const workDir = path.join(this.tmpDir, `ep-${episodeId}`);

      // Create work directory
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true });
      }
      fs.mkdirSync(workDir, { recursive: true });
      this.logger.log(`${logPrefix} Work directory: ${workDir}`);

      // 2. Download source file
      this.logger.log(`${logPrefix} Downloading source file from: ${sourceUrl}`);
      await this.updateProgress(episodeId, 5);

      const sourceFile = path.join(workDir, 'source.mp4');
      await this.downloadFile(sourceUrl, sourceFile);
      
      // Verify source file exists and has size
      if (!fs.existsSync(sourceFile)) {
        throw new Error(`Source file not found after download: ${sourceFile}`);
      }
      const fileStats = fs.statSync(sourceFile);
      this.logger.log(`${logPrefix} Source file downloaded: ${fileStats.size} bytes`);
      await this.updateProgress(episodeId, 10);

      // 3. Probe video info
      this.logger.log(`${logPrefix} Probing video information...`);
      const videoInfo = await this.probeVideo(sourceFile);
      this.logger.log(`${logPrefix} Source video: ${videoInfo.width}x${videoInfo.height}, codec: ${videoInfo.codec}, duration: ${videoInfo.duration}s`);
      this.logger.log(`${logPrefix} ⚙️ Always re-encoding video (copy mode disabled for stability)`);

      // 4. Determine which qualities to encode (skip if source is smaller)
      const qualitiesToEncode = QUALITY_PRESETS.filter(
        (q) => q.height <= videoInfo.height,
      );
      if (qualitiesToEncode.length === 0) {
        // Source is very small, encode to smallest quality anyway
        qualitiesToEncode.push(QUALITY_PRESETS[0]);
      }
      this.logger.log(`${logPrefix} Qualities to encode: ${qualitiesToEncode.map(q => q.name).join(', ')}`);

      // 5. Encode each quality
      const progressPerQuality = 70 / qualitiesToEncode.length;
      let currentProgress = 15;

      for (const quality of qualitiesToEncode) {
        this.logger.log(`${logPrefix} Encoding ${quality.name}...`);

        const qualityDir = path.join(workDir, quality.name);
        fs.mkdirSync(qualityDir, { recursive: true });

        try {
          // Always re-encode video for stability
          await this.encodeQuality(sourceFile, qualityDir, quality, videoInfo, false);
        } catch (encodeError) {
          this.logger.error(`${logPrefix} ❌ Failed to encode ${quality.name}`);
          throw new Error(`Encoding ${quality.name} failed: ${(encodeError as any)?.message || encodeError}`);
        }

        currentProgress += progressPerQuality;
        await this.updateProgress(episodeId, Math.round(currentProgress));
      }

      // 6. Generate master manifest
      this.logger.log(`${logPrefix} Generating master manifest...`);
      const masterManifest = this.generateMasterManifest(qualitiesToEncode);
      const masterPath = path.join(workDir, 'master.m3u8');
      fs.writeFileSync(masterPath, masterManifest);
      this.logger.log(`${logPrefix} Master manifest created: ${masterPath}`);
      await this.updateProgress(episodeId, 90);

      // 7. Upload HLS files to R2 CDN
      this.logger.log(`${logPrefix} Uploading to CDN...`);
      const cdnBasePath = this.r2StorageService.getHlsOutputPath(videoId, epNum);

      // Upload master manifest
      this.logger.log(`${logPrefix} Uploading master manifest...`);
      await this.r2StorageService.uploadBuffer(
        `${cdnBasePath}/master.m3u8`,
        fs.readFileSync(masterPath),
        'application/vnd.apple.mpegurl',
      );

      // Upload each quality's files
      for (const quality of qualitiesToEncode) {
        const qualityDir = path.join(workDir, quality.name);
        
        if (!fs.existsSync(qualityDir)) {
          this.logger.warn(`${logPrefix} Quality directory not found: ${qualityDir}`);
          continue;
        }

        const files = fs.readdirSync(qualityDir);
        this.logger.log(`${logPrefix} Uploading ${quality.name}: ${files.length} files`);

        for (const file of files) {
          const filePath = path.join(qualityDir, file);
          const contentType = file.endsWith('.m3u8')
            ? 'application/vnd.apple.mpegurl'
            : 'video/MP2T';

          try {
            await this.r2StorageService.uploadBuffer(
              `${cdnBasePath}/${quality.name}/${file}`,
              fs.readFileSync(filePath),
              contentType,
            );
          } catch (uploadError) {
            this.logger.error(`${logPrefix} Failed to upload ${file}: ${(uploadError as any)?.message}`);
            throw uploadError;
          }
        }
      }
      await this.updateProgress(episodeId, 95);

      // 8. Update DB — mark as COMPLETED
      const hlsManifestUrl = this.r2StorageService.getMasterManifestUrl(videoId, epNum);

      this.logger.log(`${logPrefix} Updating database with completion status...`);
      await this.prisma.episode.update({
        where: { id: episodeId },
        data: {
          encodingStatus: EncodingStatus.COMPLETED,
          encodingProgress: 100,
          hlsManifest: hlsManifestUrl,
          duration: videoInfo.duration,
          encodingError: null,
        },
      });

      // 9. Publish encoding-complete event
      await this.redisService.publish('encoding-complete', {
        episodeId,
        videoId,
        hlsManifest: hlsManifestUrl,
        duration: videoInfo.duration,
      });

      // 10. Cleanup temp files
      fs.rmSync(workDir, { recursive: true, force: true });

      this.logger.log(`${logPrefix} ✅ Encoding completed! Duration: ${videoInfo.duration}s, HLS: ${hlsManifestUrl}`);
    } catch (error: any) {
      this.logger.error(`${logPrefix} ❌ Encoding failed:`);
      this.logger.error(`Error type: ${error?.name || typeof error}`);
      this.logger.error(`Error message: ${error?.message || error}`);
      this.logger.error(`Error stack: ${error?.stack}`);

      // Get detailed error info
      const errorMsg = error?.message || String(error);
      const shortError = errorMsg.length > 950 ? errorMsg.substring(0, 950) + '...' : errorMsg;

      await this.prisma.episode.update({
        where: { id: episodeId },
        data: {
          encodingStatus: EncodingStatus.FAILED,
          encodingError: shortError,
        },
      });

      await this.redisService.publish('encoding-error', {
        episodeId,
        error: shortError,
      });

      // Cleanup on failure
      const workDir = path.join(this.tmpDir, `ep-${episodeId}`);
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    }
  }

  // ─── FFmpeg Operations ────────────────────────────────

  /**
   * Validate and repair audio stream if necessary
   */
  private async validateAndRepairAudio(sourceFile: string): Promise<{ hasAudio: boolean; isCorrupted: boolean; repairNeeded: boolean }> {
    const ffprobe = this.ffmpegPath.replace('ffmpeg', 'ffprobe');
    const cmd = `"${ffprobe}" -v error -select_streams a:0 -count_packets -show_entries stream=codec_name,channels,sample_rate -of json "${sourceFile}"`;

    try {
      const { stdout, stderr } = await execAsync(cmd);
      
      // Check for audio errors in stderr
      const hasErrors = !!(stderr && (
        stderr.includes('Invalid data found') ||
        stderr.includes('Error submitting packet') ||
        stderr.includes('channel element') ||
        stderr.includes('Reserved bit set') ||
        stderr.includes('exceeds limit') ||
        stderr.includes('Input buffer exhausted')
      ));

      const info = JSON.parse(stdout || '{}');
      const hasAudio = info.streams && info.streams.length > 0;

      this.logger.log(`Audio validation: hasAudio=${hasAudio}, hasErrors=${hasErrors}`);
      
      return {
        hasAudio,
        isCorrupted: hasErrors,
        repairNeeded: hasErrors && hasAudio
      };
    } catch (error) {
      this.logger.warn(`Audio validation failed: ${(error as any)?.message}`);
      return { hasAudio: false, isCorrupted: true, repairNeeded: false };
    }
  }

  /**
   * Encode with multiple fallback strategies for corrupted audio
   */
  private async encodeQuality(
    sourceFile: string, 
    outputDir: string, 
    quality: QualityConfig,
    videoInfo: { width: number; height: number; duration: number; codec?: string },
    canCopy: boolean = false
  ): Promise<void> {
    const outputPlaylist = path.join(outputDir, 'index.m3u8');
    const segmentPattern = path.join(outputDir, 'seg_%03d.ts');

    this.logger.log(`Building FFmpeg command for ${quality.name}${canCopy ? ' (copy mode)' : ''}...`);

    // Validate audio before encoding
    const audioStatus = await this.validateAndRepairAudio(sourceFile);
    
    if (audioStatus.hasAudio) {
      if (audioStatus.isCorrupted) {
        this.logger.warn(`⚠️ Audio detected with some errors - will try standard encoding first, then fallback strategies if needed`);
      } else {
        this.logger.log(`✅ Clean audio detected - using standard encoding`);
      }
    } else {
      this.logger.warn(`⚠️ No audio stream detected in source file`);
    }

    // Try encoding with multiple strategies (always re-encode video, never copy)
    const strategies = this.getEncodingStrategies(sourceFile, outputPlaylist, segmentPattern, quality, false, audioStatus);
    
    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      this.logger.log(`Attempt ${i + 1}/${strategies.length}: ${strategy.name}`);
      
      try {
        await this.executeFFmpegCommand(strategy.args, quality.name);
        
        // Verify output
        if (!fs.existsSync(outputPlaylist)) {
          throw new Error(`Output playlist not created`);
        }
        
        const files = fs.readdirSync(outputDir);
        if (files.length < 2) {
          throw new Error(`Insufficient output files: ${files.length}`);
        }
        
        // Log which strategy succeeded
        const hasAudioInOutput = !strategy.name.includes('silent');
        this.logger.log(`✅ ${quality.name} encoded successfully using: ${strategy.name}`);
        if (!hasAudioInOutput) {
          this.logger.warn(`⚠️ Video encoded WITHOUT AUDIO (silent output)`);
        }
        return;
        
      } catch (error) {
        this.logger.warn(`Strategy "${strategy.name}" failed: ${(error as any)?.message}`);
        
        // Clean up failed attempt
        if (fs.existsSync(outputDir)) {
          fs.readdirSync(outputDir).forEach(file => {
            fs.unlinkSync(path.join(outputDir, file));
          });
        }
        
        // If this was the last strategy, throw
        if (i === strategies.length - 1) {
          this.logger.error(`All encoding strategies failed for ${quality.name}`);
          throw error;
        }
      }
    }
  }

  /**
   * Get encoding strategies with progressive fallbacks
   */
  private getEncodingStrategies(
    sourceFile: string,
    outputPlaylist: string,
    segmentPattern: string,
    quality: QualityConfig,
    canCopy: boolean,
    audioStatus: { hasAudio: boolean; isCorrupted: boolean; repairNeeded: boolean }
  ): Array<{ name: string; args: string[] }> {
    const strategies: Array<{ name: string; args: string[] }> = [];

    // Strategy 1: Always try standard encoding first (preserve audio when possible)
    strategies.push({
      name: 'Standard encoding with audio',
      args: this.buildStandardArgs(sourceFile, outputPlaylist, segmentPattern, quality, canCopy, false)
    });

    // Strategy 2: Aggressive audio error recovery (if audio detected)
    if (audioStatus.hasAudio) {
      strategies.push({
        name: 'Aggressive error recovery',
        args: this.buildStandardArgs(sourceFile, outputPlaylist, segmentPattern, quality, canCopy, true)
      });
    }

    // Strategy 3: Extract and reconstruct audio (if corruption detected)
    if (audioStatus.isCorrupted && audioStatus.hasAudio) {
      strategies.push({
        name: 'Audio reconstruction',
        args: this.buildAudioReconstructionArgs(sourceFile, outputPlaylist, segmentPattern, quality, canCopy)
      });
    }

    // Strategy 4: Video-only as last resort (only if no audio or all above failed)
    strategies.push({
      name: 'Video-only (silent fallback)',
      args: this.buildVideoOnlyArgs(sourceFile, outputPlaylist, segmentPattern, quality, canCopy)
    });

    return strategies;
  }

  /**
   * Build standard FFmpeg arguments
   */
  private buildStandardArgs(
    sourceFile: string,
    outputPlaylist: string,
    segmentPattern: string,
    quality: QualityConfig,
    canCopy: boolean,
    aggressiveMode: boolean
  ): string[] {
    const baseInputArgs = aggressiveMode ? [
      '-fflags', '+discardcorrupt+genpts+igndts+ignidx', // Aggressive corruption handling
      '-err_detect', 'ignore_err',                       // Ignore all errors
      '-xerror',                                          // Don't exit on error
      '-max_error_rate', '1.0',                          // Allow 100% error rate
      '-thread_queue_size', '4096',                      // Large thread queue
      '-guess_layout_max', '0',                          // Don't guess audio layout
    ] : [
      '-fflags', '+genpts+igndts',
      '-err_detect', 'ignore_err',
      '-guess_layout_max', '2',
    ];

    const audioFilter = aggressiveMode
      ? 'pan=stereo|FL=FL|FR=FR,aresample=async=1000:min_hard_comp=0.01:first_pts=0,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=1.0,apad=pad_dur=0.1'
      : 'pan=stereo|FL=FL|FR=FR,aresample=async=1:min_hard_comp=0.100000,aformat=channel_layouts=stereo';

    if (canCopy) {
      return [
        ...baseInputArgs,
        '-i', sourceFile,
        '-c:v', 'copy',
        '-af', audioFilter,
        '-c:a', 'aac',
        '-b:a', quality.audioBitrate,
        '-ar', '44100',
        '-ac', '2',
        '-max_muxing_queue_size', '9999',
        '-f', 'hls',
        '-hls_time', '6',
        '-hls_list_size', '0',
        '-hls_segment_filename', segmentPattern,
        '-hls_flags', 'independent_segments',
        '-hide_banner',
        '-loglevel', aggressiveMode ? 'fatal' : 'warning',
        outputPlaylist,
      ];
    } else {
      return [
        ...baseInputArgs,
        '-i', sourceFile,
        '-vf', `scale=${quality.width}:${quality.height}:force_original_aspect_ratio=decrease,pad=${quality.width}:${quality.height}:(ow-iw)/2:(oh-ih)/2`,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-b:v', quality.bitrate,
        '-maxrate', quality.bitrate,
        '-bufsize', `${parseInt(quality.bitrate) * 2}k`,
        '-af', audioFilter,
        '-c:a', 'aac',
        '-b:a', quality.audioBitrate,
        '-ar', '44100',
        '-ac', '2',
        '-max_muxing_queue_size', '9999',
        '-f', 'hls',
        '-hls_time', '6',
        '-hls_list_size', '0',
        '-hls_segment_filename', segmentPattern,
        '-hls_flags', 'independent_segments',
        '-hide_banner',
        '-loglevel', aggressiveMode ? 'fatal' : 'warning',
        outputPlaylist,
      ];
    }
  }

  /**
   * Build audio reconstruction arguments (decode and re-encode audio separately)
   */
  private buildAudioReconstructionArgs(
    sourceFile: string,
    outputPlaylist: string,
    segmentPattern: string,
    quality: QualityConfig,
    canCopy: boolean
  ): string[] {
    // Use multiple input passes and map streams carefully
    const videoCodec = canCopy ? 'copy' : 'libx264';
    
    return [
      '-fflags', '+discardcorrupt+genpts+igndts',
      '-err_detect', 'ignore_err',
      '-max_error_rate', '1.0',
      '-i', sourceFile,
      '-map', '0:v:0',                    // Map video stream
      '-map', '0:a:0?',                   // Map audio stream (optional)
      canCopy ? '-c:v' : '-vf', canCopy ? 'copy' : `scale=${quality.width}:${quality.height}:force_original_aspect_ratio=decrease,pad=${quality.width}:${quality.height}:(ow-iw)/2:(oh-ih)/2`,
      ...(canCopy ? [] : ['-c:v', 'libx264', '-preset', 'medium', '-crf', '23']),
      ...(canCopy ? [] : ['-b:v', quality.bitrate, '-maxrate', quality.bitrate, '-bufsize', `${parseInt(quality.bitrate) * 2}k`]),
      '-af', 'pan=stereo|FL=FL|FR=FR,asetpts=PTS-STARTPTS,aresample=async=1000:first_pts=0,aformat=sample_fmts=s16:channel_layouts=stereo,volume=1.0',
      '-c:a', 'aac',
      '-b:a', quality.audioBitrate,
      '-ar', '44100',
      '-ac', '2',
      '-strict', 'experimental',
      '-max_muxing_queue_size', '9999',
      '-f', 'hls',
      '-hls_time', '6',
      '-hls_list_size', '0',
      '-hls_segment_filename', segmentPattern,
      '-hls_flags', 'independent_segments',
      '-hide_banner',
      '-loglevel', 'fatal',
      outputPlaylist,
    ];
  }

  /**
   * Build video-only arguments (no audio)
   */
  private buildVideoOnlyArgs(
    sourceFile: string,
    outputPlaylist: string,
    segmentPattern: string,
    quality: QualityConfig,
    canCopy: boolean
  ): string[] {
    if (canCopy) {
      return [
        '-i', sourceFile,
        '-an',                            // No audio
        '-c:v', 'copy',
        '-f', 'hls',
        '-hls_time', '6',
        '-hls_list_size', '0',
        '-hls_segment_filename', segmentPattern,
        '-hls_flags', 'independent_segments',
        '-hide_banner',
        '-loglevel', 'warning',
        outputPlaylist,
      ];
    } else {
      return [
        '-i', sourceFile,
        '-an',                            // No audio
        '-vf', `scale=${quality.width}:${quality.height}:force_original_aspect_ratio=decrease,pad=${quality.width}:${quality.height}:(ow-iw)/2:(oh-ih)/2`,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-b:v', quality.bitrate,
        '-maxrate', quality.bitrate,
        '-bufsize', `${parseInt(quality.bitrate) * 2}k`,
        '-f', 'hls',
        '-hls_time', '6',
        '-hls_list_size', '0',
        '-hls_segment_filename', segmentPattern,
        '-hls_flags', 'independent_segments',
        '-hide_banner',
        '-loglevel', 'warning',
        outputPlaylist,
      ];
    }
  }

  /**
   * Execute FFmpeg command
   */
  private async executeFFmpegCommand(args: string[], qualityName: string): Promise<void> {
    const cmd = [this.ffmpegPath, ...args.map(arg => `"${arg}"`)].join(' ');
    
    this.logger.debug(`Executing: ${cmd.substring(0, 300)}...`);

    const { stdout, stderr } = await execAsync(cmd, { 
      maxBuffer: 1024 * 1024 * 10,
      timeout: 600000, // 10 minutes timeout
    });
    
    if (stderr && stderr.length > 0) {
      // Count error occurrences
      const errorCount = (stderr.match(/Error submitting packet/g) || []).length;
      if (errorCount > 0) {
        this.logger.warn(`${qualityName}: Recovered from ${errorCount} audio errors`);
      }
      
      // Log sample of errors (not all)
      const errorLines = stderr.split('\n').filter(line => 
        line.includes('Error') || line.includes('error')
      );
      if (errorLines.length > 0 && errorLines.length <= 5) {
        this.logger.debug(`Sample errors: ${errorLines.slice(0, 5).join('; ')}`);
      }
    }
  }

  private async probeVideo(filePath: string): Promise<{ width: number; height: number; duration: number; codec?: string }> {
    this.logger.log(`Probing video file: ${filePath}`);
    
    const ffprobe = this.ffmpegPath.replace('ffmpeg', 'ffprobe');
    const cmd = `"${ffprobe}" -v quiet -print_format json -show_format -show_streams "${filePath}"`;

    try {
      const { stdout } = await execAsync(cmd);
      const info = JSON.parse(stdout);

      const videoStream = info.streams?.find((s: any) => s.codec_type === 'video');
      
      if (!videoStream) {
        this.logger.warn(`No video stream found in ${filePath}, using defaults`);
        return { width: 1920, height: 1080, duration: 0, codec: 'unknown' };
      }

      const result = {
        width: videoStream.width || 1920,
        height: videoStream.height || 1080,
        duration: Math.round(parseFloat(info.format?.duration || '0')),
        codec: videoStream.codec_name || 'unknown',
      };

      this.logger.log(`Video probe result: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.warn(`FFprobe failed (${(error as any)?.message}), using defaults`);
      return { width: 1920, height: 1080, duration: 0, codec: 'unknown' };
    }
  }

  private generateMasterManifest(qualities: QualityConfig[]): string {
    const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];

    for (const q of qualities) {
      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${q.bandwidth},RESOLUTION=${q.resolution}`,
        `${q.name}/index.m3u8`,
      );
    }

    return lines.join('\n') + '\n';
  }

  private async downloadFile(url: string, destination: string): Promise<void> {
    this.logger.log(`Downloading from: ${url}`);
    this.logger.log(`Saving to: ${destination}`);

    try {
      // Use fetch (Node 18+) or fallback to https
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(destination, buffer);
      
      const stats = fs.statSync(destination);
      this.logger.log(`File downloaded successfully: ${stats.size} bytes`);
    } catch (error) {
      this.logger.error(`Failed to download file: ${(error as any)?.message}`);
      throw error;
    }
  }

  private async updateProgress(episodeId: string, progress: number): Promise<void> {
    try {
      await this.prisma.episode.update({
        where: { id: episodeId },
        data: { encodingProgress: progress },
      });

      await this.redisService.publish('encoding-progress', { episodeId, progress });
    } catch (error) {
      this.logger.error(`Failed to update progress for ${episodeId}: ${(error as any)?.message}`);
    }
  }
}
