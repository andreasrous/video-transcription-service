import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  maxFileSizeBytes: number;
  openaiApiKey: string;
  openaiWhisperModel: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET!,
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES!),
  openaiApiKey: process.env.OPENAI_API_KEY!,
  openaiWhisperModel: process.env.OPENAI_WHISPER_MODEL!,
};

export default config;
