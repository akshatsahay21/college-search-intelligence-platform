import ImageKit from 'imagekit';
import fs from 'fs';
import path from 'path';

let imagekit: ImageKit | null = null;

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (publicKey && privateKey && urlEndpoint) {
  try {
    imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
    console.log('⚡ ImageKit.io CDN initialized successfully!');
  } catch (err: any) {
    console.warn('⚠️ ImageKit initialization error:', err.message);
  }
} else {
  console.log('ℹ️ ImageKit credentials not configured. Using local filesystem storage for documents.');
}

export interface UploadResult {
  fileUrl: string;
  fileId: string;
  thumbnailUrl?: string;
  isImageKit: boolean;
}

export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  folder: string = '/college_docs'
): Promise<UploadResult> => {
  // If ImageKit is configured, upload to ImageKit
  if (imagekit) {
    try {
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName,
        folder,
        useUniqueFileName: true,
      });

      return {
        fileUrl: response.url,
        fileId: response.fileId,
        thumbnailUrl: response.thumbnailUrl || response.url,
        isImageKit: true,
      };
    } catch (error: any) {
      console.warn('⚠️ ImageKit upload failed, falling back to local storage:', error.message);
    }
  }

  // Fallback: Store locally in uploads/ directory
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const localFilePath = path.join(uploadsDir, safeFileName);
  fs.writeFileSync(localFilePath, fileBuffer);

  const localUrl = `/uploads/${safeFileName}`;
  return {
    fileUrl: localUrl,
    fileId: safeFileName,
    thumbnailUrl: undefined,
    isImageKit: false,
  };
};

export default imagekit;

