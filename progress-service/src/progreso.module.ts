import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgresoController } from './controllers/progreso.controller';
import { ProgresoService } from './services/progreso.service';
import { ProgresoModuloService } from './services/progreso-modulo.service';
import { CatalogoClient } from './integrations/catalogo.client';
import { JwtAuthGuard } from './security/jwt-auth.guard';
import { OutboxPublisher } from './messaging/outbox.publisher';
import { ProgresoCurso, ProgresoCursoSchema } from './models/progreso-curso.schema';
import { ProgresoModulo, ProgresoModuloSchema } from './models/progreso-modulo.schema';
import { ProgresoCursoRepository } from './repositories/progreso-curso.repository';
import { ProgresoModuloRepository } from './repositories/progreso-modulo.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProgresoCurso.name, schema: ProgresoCursoSchema },
      { name: ProgresoModulo.name, schema: ProgresoModuloSchema },
    ]),
  ],
  controllers: [ProgresoController],
  providers: [
    ProgresoCursoRepository,
    ProgresoModuloRepository,
    ProgresoService,
    ProgresoModuloService,
    CatalogoClient,
    JwtAuthGuard,
    OutboxPublisher,
  ],
  exports: [ProgresoService, ProgresoModuloService],
})
export class ProgresoModule {}
