import { User } from '@prisma/client';
import { File as MulterFile } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email'>;
      file?: MulterFile;
    }
  }
}
