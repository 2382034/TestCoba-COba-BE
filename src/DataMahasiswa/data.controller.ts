// DataMahasiswa/data.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe,
  Query, // For query parameters
  UploadedFile, // For file uploads
  UseInterceptors, // For file interceptors
  Res,
  BadRequestException, // To send file response
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // For file uploads
import { diskStorage } from 'multer'; // For file storage configuration
import { extname } from 'path'; // For getting file extension
import { v4 as uuidv4 } from 'uuid'; // For unique filenames
import type { Response } from 'express'; // For Res type

import { DataService } from './data.service';
import {
  CreateProdiDto, UpdateProdiDto,
  CreateMahasiswaDto, UpdateMahasiswaDto,
  FindMahasiswaQueryDto, // Import the new DTO
} from './create-data.dto';
import { MAHASISWA_FOTO_PATH } from './constants'; // We'll create this

// Helper for Multer file filter
export const imageFileFilter = (req, file, callback) => {
if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
  return callback(new Error('Only image files are allowed!'), false);
}
callback(null, true);
};

@Controller('data')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class DataController {
constructor(private readonly dataService: DataService) {}

// --- Prodi Endpoints --- (No change)
@Post('prodi')
createProdi(@Body() createProdiDto: CreateProdiDto) {
  return this.dataService.createProdi(createProdiDto);
}

@Get('prodi')
findAllProdi() {
  return this.dataService.findAllProdi();
}

@Get('prodi/:id')
findOneProdi(@Param('id', ParseIntPipe) id: number) {
  return this.dataService.findOneProdi(id);
}

@Patch('prodi/:id')
updateProdi(@Param('id', ParseIntPipe) id: number, @Body() updateProdiDto: UpdateProdiDto) {
  return this.dataService.updateProdi(id, updateProdiDto);
}

@Delete('prodi/:id')
removeProdi(@Param('id', ParseIntPipe) id: number) {
  return this.dataService.removeProdi(id);
}

// --- Mahasiswa Endpoints ---
@Post('mahasiswa')
createMahasiswa(@Body() createMahasiswaDto: CreateMahasiswaDto) {
  return this.dataService.createMahasiswa(createMahasiswaDto);
}

@Get('mahasiswa')
findAllMahasiswa(@Query() query: FindMahasiswaQueryDto) { // Use the query DTO
  return this.dataService.findAllMahasiswa(query);
}

@Get('mahasiswa/:id')
findOneMahasiswa(@Param('id', ParseIntPipe) id: number) {
  return this.dataService.findOneMahasiswa(id);
}

@Patch('mahasiswa/:id')
updateMahasiswa(@Param('id', ParseIntPipe) id: number, @Body() updateMahasiswaDto: UpdateMahasiswaDto) {
  return this.dataService.updateMahasiswa(id, updateMahasiswaDto);
}

@Delete('mahasiswa/:id')
removeMahasiswa(@Param('id', ParseIntPipe) id: number) {
  return this.dataService.removeMahasiswa(id);
}

// New endpoint for uploading Mahasiswa photo
@Post('mahasiswa/:id/foto')
@UseInterceptors(
  FileInterceptor('foto', { // 'foto' is the field name in the form-data
    storage: diskStorage({
      destination: `./${MAHASISWA_FOTO_PATH}`, // Save to './uploads/mahasiswa-fotos'
      filename: (req, file, callback) => {
        const uniqueSuffix = uuidv4();
        const extension = extname(file.originalname);
        callback(null, `${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  }),
)
uploadMahasiswaFoto(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
      throw new BadRequestException('Foto file is required.');
  }
  return this.dataService.updateMahasiswaFoto(id, file.filename);
}

// New endpoint to serve Mahasiswa photo
// Ensure you have ServeStaticModule configured in your app.module or data.module
// This endpoint is a more direct way to get the file if ServeStaticModule isn't configured for this specific path prefix
@Get('mahasiswa/foto/:filename')
getMahasiswaFoto(@Param('filename') filename: string, @Res() res: Response) {
  return res.sendFile(filename, { root: `./${MAHASISWA_FOTO_PATH}` }, (err) => {
      if (err) {
          // console.error('Error sending file:', err);
          if (!res.headersSent) { // Check if headers are already sent
               res.status(404).send({message: 'Foto tidak ditemukan.'});
          }
      }
  });
}
}