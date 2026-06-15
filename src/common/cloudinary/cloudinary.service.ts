import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { UploadedFileType } from '../types/uploadedFile.type';
@Injectable()
export class CloudinaryService {
    constructor(configService: ConfigService) {
        cloudinary.config({
            cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET')
        });
    }

   async uploadImage(
   file: UploadedFileType,
   folder: string,
   resourceType: 'image' | 'video' = 'image'
): Promise<UploadApiResponse> {

   return new Promise((resolve, reject) => {

      cloudinary.uploader.upload_stream(
         {
            folder,
            resource_type: resourceType
         },
         (error, result) => {

            if (error) {
               return reject(error);
            }

            if (!result) {
               return reject(
                  new Error('Tải ảnh thất bại')
               );
            }

            resolve(result);

         }
      ).end(file.buffer);

   });

}
}
