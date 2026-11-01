import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GuardarPosicionDto {
  @ApiProperty({ description: 'ID del usuario / estudiante', example: 'usuario-001' })
  @IsString()
  @IsNotEmpty()
  idUsuario: string;

  @ApiProperty({ description: 'ID del curso', example: 'Programacion Orientada a Objetos' })
  @IsString()
  @IsNotEmpty()
  idCurso: string;

  @ApiProperty({ description: 'ID de la lección', example: 'leccion-101' })
  @IsString()
  @IsNotEmpty()
  idLeccion: string;

  @ApiPropertyOptional({ description: 'Título de la lección', example: 'Clases y Objetos' })
  @IsString()
  @IsOptional()
  tituloLeccion?: string;

  @ApiProperty({ description: 'Posición actual del video en segundos', example: 180 })
  @IsNumber()
  @Min(0)
  segundoActual: number;

  @ApiPropertyOptional({ description: 'Duración total del video en segundos', example: 200 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duracionSegundos?: number;

  @ApiPropertyOptional({
    description: 'Si es true o si el progreso del video supera el 90%, se marca como completada automáticamente',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  autoCompletar?: boolean;

  @ApiPropertyOptional({ description: 'Total de lecciones del curso', example: 10 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  totalLecciones?: number;
}
