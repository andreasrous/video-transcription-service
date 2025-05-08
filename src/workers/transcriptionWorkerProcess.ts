import { db } from '../utils/db';
import { OpenAI } from 'openai';
import fs from 'fs';
import { TranscriptionStatus } from '../../generated/prisma';
import config from '../config/config';

process.on('message', async (data: { videoId: string; filePath: string }) => {
  const { videoId, filePath } = data;
  const openai = new OpenAI({ apiKey: config.openaiApiKey });

  try {
    await db.video.update({
      where: { id: videoId },
      data: { transcriptionStatus: TranscriptionStatus.PROCESSING },
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: config.openaiWhisperModel,
    });

    await db.transcript.create({
      data: {
        videoId,
        transcriptText: transcription.text,
        whisperModelUsed: config.openaiWhisperModel,
      },
    });

    await db.video.update({
      where: { id: videoId },
      data: { transcriptionStatus: TranscriptionStatus.COMPLETED },
    });
  } catch (err) {
    console.error(`Transcription failed:`, err);
    await db.video.update({
      where: { id: videoId },
      data: { transcriptionStatus: TranscriptionStatus.FAILED },
    });
  }
});
