import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';

export interface UploadedPicture {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class FakeUploadService {
  private readonly logger = new Logger(FakeUploadService.name);
  private readonly uploadDirectory = resolve(__dirname, '../../upload');

  async upload(file: UploadedPicture): Promise<{ pictureUrl: string }> {
    const filename = basename(file.originalname);

    await mkdir(this.uploadDirectory, { recursive: true });
    await writeFile(join(this.uploadDirectory, filename), file.buffer);

    this.logger.log({
      type: 'picture.upload.simulated',
      filename,
      size: file.buffer.length,
    });

    return { pictureUrl: `/upload/${encodeURIComponent(filename)}` };
  }

  async getPicture(filename: string): Promise<{ buffer: Buffer; mimetype: string } | undefined> {
    const buffer = await readFile(join(this.uploadDirectory, basename(filename))).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return undefined;

      throw error;
    });

    if (!buffer) return undefined;

    const mimetypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    return {
      buffer,
      mimetype: mimetypes[extname(filename).toLowerCase()] ?? 'application/octet-stream',
    };
  }
}
