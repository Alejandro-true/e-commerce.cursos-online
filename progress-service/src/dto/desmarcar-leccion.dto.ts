import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DesmarcarLeccionDto {
  @ApiProperty({ description: 'ID del usuario / estudiante', example: 'usuario-001' })
  @IsString()
  @IsNotEmpty()
  idUsuario: string;

  @ApiProperty({ description: 'ID del curso', example: 'curso-nestjs-microservicios' })
  @IsString()
  @IsNotEmpty()
  idCurso: string;

  @ApiProperty({ description: 'ID de la lección a desmarcar', example: 'leccion-101' })
  @IsString()
  @IsNotEmpty()
  idLeccion: string;
}
