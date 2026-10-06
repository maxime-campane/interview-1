import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FakeUploadService, UploadedPicture } from './fake-upload.service';

@Controller('upload')
export class UploadsController {
  constructor(private readonly uploadService: FakeUploadService) {}

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadPicture(
    @UploadedFile() file: UploadedPicture | undefined,
  ): Promise<{ pictureUrl: string }> {
    if (!file || !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      throw new BadRequestException('Choisissez une image JPEG, PNG, WebP ou GIF.');
    }

    return this.uploadService.upload(file);
  }

  @Get(':filename')
  async getPicture(@Param('filename') filename: string): Promise<StreamableFile> {
    const file = await this.uploadService.getPicture(filename);

    if (!file) {
      throw new NotFoundException('Photo introuvable.');
    }

    return new StreamableFile(file.buffer, {
      type: file.mimetype,
      length: file.buffer.length,
    });
  }
}
