import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ _id: false, timestamps: true })
export class ProgresoLeccion {
  @ApiProperty({ description: 'Identificador único de la lección', example: 'leccion-101' })
  @Prop({ required: true })
  idLeccion: string;

  @ApiPropertyOptional({ description: 'Título o nombre de la lección', example: 'Introducción a Microservicios' })
  @Prop({ required: false, default: '' })
  tituloLeccion?: string;

  @ApiProperty({ description: 'Indica si la lección fue completada o vista en su totalidad', example: true })
  @Prop({ required: true, default: false })
  completada: boolean;

  @ApiPropertyOptional({ description: 'Fecha y hora en que se completó la lección' })
  @Prop({ required: false })
  fechaCompletada?: Date;

  @ApiProperty({ description: 'Última posición del video reproducida en segundos (para reanudación)', example: 120 })
  @Prop({ required: false, default: 0 })
  segundoActual: number;

  @ApiPropertyOptional({ description: 'Duración total del video de la lección en segundos', example: 300 })
  @Prop({ required: false, default: 0 })
  duracionSegundos?: number;

  @ApiPropertyOptional({ description: 'Notas u observaciones del estudiante' })
  @Prop({ required: false, default: '' })
  notas?: string;
}

export const ProgresoLeccionSchema = SchemaFactory.createForClass(ProgresoLeccion);
