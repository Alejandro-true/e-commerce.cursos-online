import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('vista')
  getVista(@Res() res: Response) {
    const posiblesRutas = [
      join(process.cwd(), '..', 'frontend', 'index.html'),
      join(__dirname, '..', '..', 'frontend', 'index.html'),
      join(process.cwd(), 'frontend', 'index.html'),
    ];
    const archivoIndex = posiblesRutas.find((ruta) => existsSync(ruta));

    if (archivoIndex) {
      return res.sendFile(archivoIndex);
    }
    return res.status(404).send('Archivo frontend/index.html no encontrado');
  }
}

