import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import {
  deleteVideo,
  downloadTranscript,
  getVideoById,
  listVideos,
  uploadVideo,
} from '../controllers/videoController';

const router = Router();

router.post('/upload', protect, uploadVideo);
router.get('/', protect, listVideos);
router.get('/:videoId', protect, getVideoById);
router.delete('/:videoId', protect, deleteVideo);
router.get('/:videoId/transcript/download', protect, downloadTranscript);

export default router;
