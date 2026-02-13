import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../config/database.config';
import { RedisService } from '../../../config/redis.config';
import { R2StorageService } from './r2-storage.service';
import { SubtitleService } from './subtitle.service';
import { SubtitleStatus } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import Groq from 'groq-sdk';

const execAsync = promisify(exec);

interface SubtitleJob {
  subtitleId: string;
  episodeId: string;
  videoId: string;
  episodeNumber: number;
  sourceUrl: string;
  sourceLanguage: string;
  targetLanguage: string;
}

@Injectable()
export class SubtitleWorkerService implements OnModuleInit {
  private readonly logger = new Logger(SubtitleWorkerService.name);
  private isProcessing = false;
  private readonly tmpDir: string;
  private readonly whisperPath: string;
  private readonly ffmpegPath: string;
  private readonly groqClient: Groq;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private r2StorageService: R2StorageService,
    private subtitleService: SubtitleService,
    private configService: ConfigService,
  ) {
    this.tmpDir = path.join(os.tmpdir(), 'vietshort-subtitle');
    this.whisperPath = this.configService.get('WHISPER_PATH') || 'whisper';
    this.ffmpegPath = this.configService.get('FFMPEG_PATH') || 'ffmpeg';
    const groqApiKey = this.configService.get('GROQ_API_KEY');
    this.groqClient = new Groq({ apiKey: groqApiKey });
  }

  async onModuleInit() {
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }

    await this.checkDependencies();
    this.startWorker();
  }

  private async checkDependencies() {
    // Check FFmpeg
    try {
      const { stdout } = await execAsync(`${this.ffmpegPath} -version`);
      this.logger.log(`✅ FFmpeg available: ${stdout.split('\n')[0]}`);
    } catch {
      this.logger.warn('⚠️ FFmpeg not found — audio extraction will fail');
    }

    // Check Whisper
    try {
      const { stdout } = await execAsync(`${this.whisperPath} --help`);
      this.logger.log('✅ Whisper CLI available');
    } catch {
      this.logger.warn('⚠️ Whisper CLI not found — AI subtitle generation will be unavailable');
      this.logger.warn('   Install: pip install openai-whisper   OR   use faster-whisper / whisper.cpp');
    }
  }

  /**
   * Main worker loop — polls Redis queue for subtitle generation jobs
   */
  private startWorker() {
    this.logger.log('📝 Subtitle Worker started, polling for jobs...');

    setInterval(async () => {
      if (this.isProcessing) return;

      try {
        const job = await this.redisService.getFromQueue('subtitle-generation');
        if (job) {
          this.isProcessing = true;
          await this.processJob(job.data as SubtitleJob);
          this.isProcessing = false;
        }
      } catch (error) {
        this.logger.error('Subtitle worker error:', error);
        this.isProcessing = false;
      }
    }, 5000);
  }

  /**
   * Process a single subtitle generation job
   * 
   * Steps:
   * 1. Download source video
   * 2. Extract audio with FFmpeg
   * 3. Transcribe with Whisper
   * 4. (Optional) Translate to target language
   * 5. Upload SRT to R2
   * 6. Update DB with COMPLETED
   */
  private async processJob(job: SubtitleJob) {
    const { subtitleId, episodeId, videoId, episodeNumber, sourceUrl, sourceLanguage, targetLanguage } = job;
    const jobDir = path.join(this.tmpDir, `sub-${subtitleId}`);

    this.logger.log(`🎬 Processing subtitle job: ${subtitleId} (${targetLanguage})`);

    try {
      // Create job directory
      fs.mkdirSync(jobDir, { recursive: true });

      // ─── Step 1: Download source ───
      await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.EXTRACTING, 5);

      const sourceFile = path.join(jobDir, 'source.mp4');
      await this.downloadFile(sourceUrl, sourceFile);
      this.logger.log(`📥 Source downloaded: ${sourceFile}`);

      // ─── Step 2: Extract audio ───
      await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.EXTRACTING, 15);

      const audioFile = path.join(jobDir, 'audio.wav');
      await this.extractAudio(sourceFile, audioFile);
      this.logger.log(`🔊 Audio extracted: ${audioFile}`);

      await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.EXTRACTING, 25);

      // ─── Step 3: Transcribe with Whisper ───
      await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.TRANSCRIBING, 30);

      const whisperLang = sourceLanguage === 'auto' ? '' : `--language ${this.mapLanguageForWhisper(sourceLanguage)}`;
      const srtOutputDir = jobDir;

      // Use tiny model with speed optimizations
      const whisperCmd = `${this.whisperPath} "${audioFile}" ${whisperLang} --output_format srt --output_dir "${srtOutputDir}" --model tiny --beam_size 1 --best_of 1 --temperature 0`;
      this.logger.log(`🤖 Running Whisper: ${whisperCmd}`);

      // Shorter timeout with faster-whisper + optimizations
      await execAsync(whisperCmd, { timeout: 300000 }); // 5 min timeout

      await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.TRANSCRIBING, 60);

      // Read the generated SRT file
      const srtFile = path.join(srtOutputDir, 'audio.srt');
      if (!fs.existsSync(srtFile)) {
        throw new Error('Whisper did not produce an SRT file');
      }

      let srtContent = fs.readFileSync(srtFile, 'utf-8');
      this.logger.log(`📄 SRT generated: ${srtContent.length} characters`);
      
      // Log first 1000 chars to debug structure
      const preview = srtContent.substring(0, 1000);
      this.logger.log(`📋 SRT STRUCTURE DEBUG (first 1000 chars):\n${preview}\n... [truncated]`);

      // ─── Step 4: Translate if needed ───
      // If sourceLanguage is 'auto', Whisper detected the language automatically
      // We need to translate to targetLanguage if it's not the same
      // For now, we assume Whisper detected correctly and always translate when sourceLanguage='auto'
      const needsTranslation = sourceLanguage === 'auto' || sourceLanguage !== targetLanguage;
      
      if (needsTranslation && targetLanguage !== 'auto') {
        await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.TRANSLATING, 70);
        
        // If sourceLanguage is 'auto', detect from transcribed text
        const detectedSource = sourceLanguage === 'auto' ? this.detectLanguage(srtContent) : sourceLanguage;
        
        // Only translate if detected source differs from target
        if (detectedSource !== targetLanguage) {
          this.logger.log(`🌐 Translating ${detectedSource} → ${targetLanguage} using Groq AI`);
          srtContent = await this.translateSrt(srtContent, detectedSource, targetLanguage);
        } else {
          this.logger.log(`✓ No translation needed: detected language matches target (${targetLanguage})`);
        }
        
        await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.TRANSLATING, 85);
      }

      // ─── Step 5: Upload SRT to R2 ───
      await this.subtitleService.updateSubtitleProgress(subtitleId, SubtitleStatus.UPLOADING, 90);

      const srtKey = `cdn/subtitles/${videoId}/ep-${episodeNumber}/${targetLanguage}.srt`;
      await this.r2StorageService.uploadBuffer(
        srtKey,
        Buffer.from(srtContent, 'utf-8'),
        'text/plain; charset=utf-8',
      );
      const srtUrl = this.r2StorageService.getCdnUrl(srtKey);

      this.logger.log(`☁️ SRT uploaded to R2: ${srtKey}`);

      // ─── Step 6: Complete ───
      await this.subtitleService.completeSubtitleGeneration(subtitleId, srtContent, srtUrl);
      this.logger.log(`✅ Subtitle generation completed: ${subtitleId}`);

    } catch (error) {
      const errorMsg = (error as any)?.message || 'Unknown error';
      this.logger.error(`❌ Subtitle generation failed for ${subtitleId}: ${errorMsg}`);
      await this.subtitleService.failSubtitleGeneration(subtitleId, errorMsg);
    } finally {
      // Cleanup temp files
      this.cleanup(jobDir);
    }
  }

  /**
   * Download a file from URL to local path
   */
  private async downloadFile(url: string, destination: string): Promise<void> {
    // If the URL is an R2 internal path, download via S3 client
    if (url.startsWith('r2://') || url.startsWith('cdn/') || url.startsWith('raw/')) {
      const key = url.replace('r2://', '');
      this.logger.log(`Downloading from R2: ${key}`);
      const buffer = await this.r2StorageService.getObject(key);
      fs.writeFileSync(destination, buffer);
      return;
    }

    // Otherwise download from HTTP using native fetch (Node 18+)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error(`Invalid URL format: ${url} (must be http(s)://, r2://, cdn/, or raw/)`);
    }

    this.logger.log(`Downloading from HTTP: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(destination, buffer);
  }

  /**
   * Extract audio from video using FFmpeg with fallback strategies
   */
  private async extractAudio(videoPath: string, audioPath: string): Promise<void> {
    const strategies = [
      {
        name: 'Standard extraction',
        cmd: `${this.ffmpegPath} -err_detect ignore_err -fflags +genpts+igndts -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 -ss 0 -t 600 "${audioPath}" -y -loglevel warning`,
      },
      {
        name: 'Aggressive error recovery',
        cmd: `${this.ffmpegPath} -fflags +discardcorrupt+genpts+igndts+ignidx -err_detect ignore_err -xerror -max_error_rate 1.0 -guess_layout_max 0 -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -af "pan=mono|c0=c0,aformat=sample_fmts=s16:channel_layouts=mono,aresample=async=1000" -ss 0 -t 600 "${audioPath}" -y -loglevel fatal`,
      },
      {
        name: 'Channel normalization',
        cmd: `${this.ffmpegPath} -fflags +discardcorrupt+genpts+igndts -err_detect ignore_err -i "${videoPath}" -vn -af "pan=mono|c0=c0,aresample=async=1000:first_pts=0,aformat=sample_fmts=s16:sample_rates=16000" -acodec pcm_s16le -ar 16000 -ss 0 -t 600 "${audioPath}" -y -loglevel fatal`,
      },
      {
        name: 'Silent fallback',
        cmd: `${this.ffmpegPath} -f lavfi -i "anullsrc=r=16000:cl=mono" -t 600 -q:a 9 -acodec pcm_s16le "${audioPath}" -y -loglevel warning`,
      },
    ];

    let lastError: any;

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      this.logger.log(`📊 Audio extraction attempt ${i + 1}/${strategies.length}: ${strategy.name}`);

      try {
        await execAsync(strategy.cmd, { timeout: 300000, maxBuffer: 1024 * 1024 * 10 });

        // Verify the audio file was created
        if (!fs.existsSync(audioPath)) {
          throw new Error(`Audio file not created: ${audioPath}`);
        }

        const fileSize = fs.statSync(audioPath).size;
        if (fileSize < 1000) {
          // File too small, likely invalid
          throw new Error(`Audio file too small: ${fileSize} bytes`);
        }

        this.logger.log(`✅ Audio extracted successfully using: ${strategy.name} (${fileSize} bytes)`);
        return;
      } catch (error) {
        lastError = error;
        this.logger.warn(`⚠️ Strategy "${strategy.name}" failed: ${(error as any)?.message}`);

        // Clean up failed attempt
        if (fs.existsSync(audioPath)) {
          try {
            fs.unlinkSync(audioPath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }

        // If this was the last strategy, throw
        if (i === strategies.length - 1) {
          this.logger.error(`❌ All audio extraction strategies failed`);
          throw lastError;
        }
      }
    }
  }

  /**
   * Map our language codes to Whisper-compatible language names
   */
  private mapLanguageForWhisper(lang: string): string {
    const map: Record<string, string> = {
      vi: 'Vietnamese',
      en: 'English',
    };
    return map[lang] || lang;
  }

  /**
   * Simple language detection from SRT content
   */
  private detectLanguage(srtContent: string): string {
    const text = srtContent.toLowerCase();
    
    // Vietnamese detection: check for Vietnamese diacritics
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/;
    if (vietnameseChars.test(text)) {
      return 'vi';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Translate SRT content using Groq AI
   */
  private async translateSrt(srtContent: string, sourceLang: string, targetLang: string): Promise<string> {
    try {
      // Parse SRT into segments
      const segments = this.parseSrt(srtContent);
      if (segments.length === 0) {
        this.logger.warn('⚠️ No segments found in SRT, returning original');
        return srtContent;
      }

      this.logger.log(`📝 Translating ${segments.length} subtitle segments...`);

      const langMap: Record<string, string> = {
        vi: 'Vietnamese',
        en: 'English',
        zh: 'Chinese',
        ja: 'Japanese',
        ko: 'Korean',
      };

      const sourceLanguage = langMap[sourceLang] || sourceLang;
      const targetLanguage = langMap[targetLang] || targetLang;

      // Translate in batches to avoid token limits and improve accuracy
      const BATCH_SIZE = 50; // Translate 50 segments at a time
      const translatedSegments: string[] = [];

      for (let i = 0; i < segments.length; i += BATCH_SIZE) {
        const batch = segments.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(segments.length / BATCH_SIZE);

        this.logger.log(`🔄 Translating batch ${batchNum}/${totalBatches} (${batch.length} segments)...`);

        // Create clean SRT-formatted input for the batch
        const srtInput = batch.map((seg, idx) => {
          const num = i + idx + 1;
          return `${num}\n${seg.timestamp}\n${seg.text}`;
        }).join('\n\n');
        
        // DEBUG: Log sample input to Groq
        if (batchNum === 1) {
          const sampleLines = srtInput.split('\n').slice(0, 6);
          this.logger.log(`📤 Sample INPUT to Groq (first 6 lines - 2 SRT segments):\n${sampleLines.join('\n')}`);
        }

        const completion = await this.groqClient.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are a professional subtitle translator. Translate from ${sourceLanguage} to ${targetLanguage}.

🔴 INPUT FORMAT: Standard SRT (SubRip) subtitle format
🔴 OUTPUT FORMAT: SAME SRT format with translated text

RULES:
✓ Keep segment numbers unchanged (1, 2, 3...)
✓ Keep timestamps unchanged (00:00:01,000 --> 00:00:03,000)  
✓ ONLY translate the subtitle text (lines after timestamp)
✓ Keep blank lines between segments
✓ Start output immediately with "1" (no preamble)
✓ No extra comments or explanations

EXAMPLE:
INPUT:
1
00:00:00,900 --> 00:00:02,340
你好世界

2
00:00:03,220 --> 00:00:05,680
这是测试

OUTPUT:
1
00:00:00,900 --> 00:00:02,340
Hello world

2
00:00:03,220 --> 00:00:05,680
This is a test`,
            },
            {
              role: 'user',
              content: srtInput,
            },
          ],
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          temperature: 0.1,
          max_tokens: 32768,
        });

        const translatedSrt = completion.choices[0]?.message?.content?.trim();
        if (!translatedSrt) {
          throw new Error(`Empty translation response for batch ${batchNum}`);
        }
        
        // DEBUG: Log sample output from Groq  
        if (batchNum === 1) {
          const sampleOutput = translatedSrt.split('\n').slice(0, 6);
          this.logger.log(`📥 Sample OUTPUT from Groq (first 6 lines):\n${sampleOutput.join('\n')}`);
        }

        // Parse the translated SRT back into segments
        const translatedBatch = this.parseSrt(translatedSrt);
        
        if (translatedBatch.length !== batch.length) {
          this.logger.error(
            `❌ Batch ${batchNum} parsing failed: expected ${batch.length} segments, got ${translatedBatch.length}`
          );
          throw new Error(`Translation batch ${batchNum} returned incorrect segment count`);
        }

        // Extract just the text from translated segments
        const batchTranslations = translatedBatch.map(seg => seg.text);
        this.logger.log(`✓ Batch ${batchNum}: translated ${batchTranslations.length} segments successfully`);

        // Add to overall results
        translatedSegments.push(...batchTranslations);
      }

      // Validate segment count
      if (translatedSegments.length !== segments.length) {
        this.logger.error(`❌ Segment count mismatch: expected ${segments.length}, got ${translatedSegments.length}`);
        
        // Pad or trim to match
        while (translatedSegments.length < segments.length) {
          const idx = translatedSegments.length;
          this.logger.warn(`⚠️ Missing translation for segment ${idx + 1}, using original`);
          translatedSegments.push(segments[idx].text);
        }
        if (translatedSegments.length > segments.length) {
          translatedSegments.splice(segments.length);
        }
      }

      // Rebuild SRT with translated text
      const translatedSrt = segments.map((seg, idx) => {
        return `${seg.index}\n${seg.timestamp}\n${translatedSegments[idx]}\n`;
      }).join('\n');

      this.logger.log(`✅ Translation completed: ${segments.length} segments`);
      return translatedSrt;

    } catch (error) {
      const errMsg = typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error);
      this.logger.error(`Translation failed: ${errMsg}`);
      throw new Error(`Groq translation failed: ${errMsg}`);
    }
  }

  /**
   * Parse SRT content into structured segments
   */
  private parseSrt(srtContent: string): Array<{ index: number; timestamp: string; text: string }> {
    const segments: Array<{ index: number; timestamp: string; text: string }> = [];
    
    // Normalize line endings (Windows \r\n → Unix \n) before parsing
    const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.trim().split('\n\n');

    this.logger.debug(`parseSrt: found ${blocks.length} blocks in SRT`);

    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length < 3) {
        this.logger.debug(`⏭️ Skipping block with ${lines.length} lines (need >= 3)`);
        continue;
      }

      const index = parseInt(lines[0], 10);
      const timestamp = lines[1];
      const text = lines.slice(2).join('\n');

      if (!isNaN(index) && timestamp.includes('-->')) {
        this.logger.debug(`✓ Parsed segment ${index}: "${text.substring(0, 50)}..."`);
        segments.push({ index, timestamp, text });
      }
    }

    this.logger.log(`📊 parseSrt: Found ${segments.length} segments (${segments.reduce((a, s) => a + s.text.length, 0)} chars total)`);
    
    // Validate parsing - if only 1 segment but content is huge, parsing failed
    if (segments.length === 1 && segments[0].text.length > 500) {
      this.logger.error(`❌ Parser detected only 1 mega-segment (${segments[0].text.length} chars) - likely line ending issue!`);
      this.logger.debug(`First 200 chars: ${srtContent.substring(0, 200)}`);
      throw new Error('SRT parsing failed: file has wrong line endings or invalid format');
    }
    
    // If segments parsed correctly, use them as-is
    if (segments.length > 0) {
      this.logger.log(`✅ Using ${segments.length} segments from Whisper (no auto-split needed)`);
      return segments;
    }

    // Only if parsing completely failed (0 segments), log error
    this.logger.error(`❌ Failed to parse any SRT segments! Check Whisper output format.`);
    return segments;
  }

  /**
   * Split a very large segment (with multiline text) into smaller segments
   * Used when Whisper creates a single mega-segment with embedded newlines
   */
  private splitLargeSegment(segment: { index: number; timestamp: string; text: string }): Array<{ index: number; timestamp: string; text: string }> {
    const lines = segment.text.split('\n').filter(l => l.trim());
    const subSegments: Array<{ index: number; timestamp: string; text: string }> = [];
    
    // Parse original timestamp to calculate duration per line
    const [start, end] = segment.timestamp.split(' --> ');
    const startMs = this.timeToMs(start);
    const endMs = this.timeToMs(end);
    const totalDuration = endMs - startMs;
    const durationPerLine = Math.floor(totalDuration / Math.max(lines.length, 1));

    let currentIndex = segment.index;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim()) {
        const segStart = startMs + i * durationPerLine;
        const segEnd = Math.min(segStart + durationPerLine, endMs);
        const timestamp = `${this.msToTime(segStart)} --> ${this.msToTime(segEnd)}`;

        subSegments.push({
          index: currentIndex,
          timestamp,
          text: line.trim(),
        });
        currentIndex++;
      }
    }
    
    return subSegments;
  }

  /**
   * Convert time format "HH:MM:SS,mmm" to milliseconds
   */
  private timeToMs(timeStr: string): number {
    const [time, ms] = timeStr.split(',');
    const [h, m, s] = time.split(':').map(Number);
    return h * 3600000 + m * 60000 + s * 1000 + parseInt(ms, 10);
  }

  /**
   * Convert milliseconds to time format "HH:MM:SS,mmm"
   */
  private msToTime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
  }

  /**
   * Cleanup temporary files
   */
  private cleanup(dir: string) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        this.logger.log(`🧹 Cleaned up: ${dir}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup ${dir}:`, error);
    }
  }
}
