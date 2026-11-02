import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgresoLeccion, ProgresoLeccionSchema } from './progreso-leccion.schema';

export type ProgresoCursoDocument = ProgresoCurso & Document;

export enum EstadoProgreso {
  NO_INICIADO = 'NO_INICIADO',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADO = 'COMPLETADO',
}

@Schema({
  collection: 'progreso_cursos',
  timestamps: true,
})
export class ProgresoCurso {
  @ApiProperty({ description: 'ID del usuario / estudiante', example: 'usuario-001' })
  @Prop({ required: true, index: true })
  idUsuario: string;

  @ApiProperty({ description: 'ID del curso', example: 'curso-nestjs-microservicios' })
  @Prop({ required: true, index: true })
  idCurso: string;

  @ApiProperty({ description: 'Número total de lecciones del curso', example: 10, default: 0 })
  @Prop({ required: true, default: 0 })
  totalLecciones: number;

  @ApiProperty({ description: 'Cantidad de lecciones completadas', example: 5, default: 0 })
  @Prop({ required: true, default: 0 })
  leccionesCompletadas: number;

  @ApiProperty({ description: 'Porcentaje calculado de avance (0 a 100)', example: 50, default: 0 })
  @Prop({ required: true, default: 0, min: 0, max: 100 })
  porcentaje: number;

  @ApiProperty({
    description: 'Estado general del curso para el usuario',
    enum: EstadoProgreso,
    example: EstadoProgreso.EN_PROGRESO,
  })
  @Prop({
    required: true,
    enum: EstadoProgreso,
    default: EstadoProgreso.NO_INICIADO,
  })
  estado: EstadoProgreso;

  @ApiProperty({
    description: 'Detalle de avance por cada lección',
    type: () => [ProgresoLeccion],
  })
  @Prop({ type: [ProgresoLeccionSchema], default: [] })
  lecciones: ProgresoLeccion[];

  @ApiPropertyOptional({ description: 'ID de la última lección vista o accedida', example: 'leccion-101' })
  @Prop({ required: false })
  ultimaLeccionId?: string;

  @ApiPropertyOptional({ description: 'Fecha y hora del último acceso' })
  @Prop({ required: false, default: Date.now })
  ultimoAcceso?: Date;

  @ApiProperty({ description: 'Indica si el usuario completó el curso y puede emitir certificado', example: false })
  @Prop({ required: true, default: false })
  certificadoElegible: boolean;

  @ApiPropertyOptional({ description: 'Fecha de culminación del 100% del curso' })
  @Prop({ required: false })
  fechaCompletado?: Date;
}

export const ProgresoCursoSchema = SchemaFactory.createForClass(ProgresoCurso);

// Índice compuesto único para que cada usuario tenga un solo documento de progreso por curso
ProgresoCursoSchema.index({ idUsuario: 1, idCurso: 1 }, { unique: true });
