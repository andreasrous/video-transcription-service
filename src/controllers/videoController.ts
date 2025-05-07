import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { db } from '../utils/db';
import fs from 'fs';
import { TranscriptionStatus } from '../../generated/prisma';
import config from '../config/config';

// @desc   Upload a new video file
// @route  POST /videos/upload
// @access Private
export const uploadVideo = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!req.file) {
    res.status(400).json({ error: 'Missing file' });
    return;
  }

  const { originalname, mimetype, size, path: filePath } = req.file;

  if (mimetype !== 'video/mp4') {
    fs.unlinkSync(filePath);
    res.status(415).json({ error: 'Invalid file type' });
    return;
  }

  if (size > config.maxFileSizeBytes) {
    fs.unlinkSync(filePath);
    res.status(413).json({ error: 'File too large' });
    return;
  }

  try {
    const video = await db.video.create({
      data: {
        userId: user?.id,
        originalFilename: originalname,
        storagePath: filePath,
        fileSizeBytes: BigInt(size),
        transcriptionStatus: TranscriptionStatus.PENDING,
      },
    });

    // Simulate async transcription trigger (e.g., queue)
    console.log(`Transcription job triggered for video ${video.id}`);

    res.status(202).json({
      videoId: video.id,
      filename: video.originalFilename,
      status: video.transcriptionStatus.toLowerCase(),
      message: 'Upload successful, processing started',
    });
  } catch {
    fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Error saving video to database' });
  }
});

// @desc   Get all videos uploaded by the user
// @route  GET /videos
// @access Private
export const listVideos = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  try {
    const videos = await db.video.findMany({
      where: { userId: user?.id },
      orderBy: { uploadTimestamp: 'desc' },
    });

    res.status(200).json(
      videos.map((v) => ({
        videoId: v.id,
        filename: v.originalFilename,
        status: v.transcriptionStatus.toLowerCase(),
        uploadTimestamp: v.uploadTimestamp.toISOString(),
      })),
    );
  } catch {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// @desc   Get metadata and transcript (if available) of a specific video
// @route  GET /videos/:videoId
// @access Private
export const getVideoById = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { videoId } = req.params;

    try {
      const video = await db.video.findUnique({
        where: { id: videoId },
        include: { transcript: true },
      });

      if (!video || video.userId !== user?.id) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }

      const response: any = {
        videoId: video.id,
        filename: video.originalFilename,
        status: video.transcriptionStatus.toLowerCase(),
        uploadTimestamp: video.uploadTimestamp.toISOString(),
      };

      if (
        video.transcriptionStatus === TranscriptionStatus.COMPLETED &&
        video.transcript
      ) {
        response.transcript = {
          transcriptId: video.transcript.id,
          text: video.transcript.transcriptText,
        };
      }

      res.status(200).json(response);
    } catch {
      res.status(500).json({ error: 'Failed to fetch video details' });
    }
  },
);

// @desc   Delete a specific video
// @route  DELETE /videos/:videoId
// @access Private
export const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { videoId } = req.params;

  try {
    const video = await db.video.findUnique({ where: { id: videoId } });

    if (!video || video.userId !== user?.id) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    try {
      fs.unlinkSync(video.storagePath);
    } catch (err) {
      console.warn(`Could not delete file at ${video.storagePath}`);
    }

    await db.video.delete({ where: { id: videoId } });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// @desc   Download transcript of a specific video
// @route  GET /videos/:videoId/transcript/download
// @access Private
export const downloadTranscript = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { videoId } = req.params;

    try {
      const transcript = await db.transcript.findUnique({
        where: { videoId },
        include: { video: true },
      });

      if (!transcript || transcript.video.userId !== user?.id) {
        res
          .status(404)
          .json({ error: 'Transcript not found or not completed' });
        return;
      }

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="transcript_${videoId}.txt"`,
      );
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(transcript.transcriptText);
    } catch {
      res.status(500).json({ error: 'Failed to download transcript' });
    }
  },
);
