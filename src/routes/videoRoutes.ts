import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  deleteVideo,
  downloadTranscript,
  getVideoById,
  listVideos,
  uploadVideo,
} from '../controllers/videoController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.post('/upload', protect, upload.single('file'), uploadVideo);
router.get('/', protect, listVideos);
router.get('/:videoId', protect, getVideoById);
router.delete('/:videoId', protect, deleteVideo);
router.get('/:videoId/transcript/download', protect, downloadTranscript);

export default router;
