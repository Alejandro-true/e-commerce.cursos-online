import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CompletarLeccionDto {
  @ApiProperty({ description: 'ID del usuario / estudiante', example: 'usuario-001' })
  @IsString()
  @IsNotEmpty()
  idUsuario: string;

  @ApiProperty({ description: 'ID del curso', example: 'curso-nestjs-microservicios' })
  @IsString()
  @IsNotEmpty()
  idCurso: string;

  @ApiProperty({ description: 'ID de la lección completada', example: 'leccion-101' })
  @IsString()
  @IsNotEmpty()
  idLeccion: string;

  @ApiPropertyOptional({ description: 'Título de la lección', example: 'Introducción a Microservicios' })
  @IsString()
  @IsOptional()
  tituloLeccion?: string;

  @ApiPropertyOptional({
    description: 'Total de lecciones del curso (actualiza el total si no estaba inicializado)',
    example: 10,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  totalLecciones?: number;

  @ApiPropertyOptional({ description: 'Duración total de la lección en segundos', example: 300 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duracionSegundos?: number;
}
