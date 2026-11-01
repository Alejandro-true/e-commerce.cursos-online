import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InicializarProgresoDto {
  @ApiProperty({ description: 'ID del usuario / estudiante', example: 'usuario-001' })
  @IsString()
  @IsNotEmpty()
  idUsuario: string;

  @ApiProperty({ description: 'ID del curso', example: 'Programacion Orientada a Objetos' })
  @IsString()
  @IsNotEmpty()
  idCurso: string;

  @ApiProperty({ description: 'Total de lecciones que componen el curso', example: 12 })
  @IsNumber()
  @Min(1)
  totalLecciones: number;

  @ApiPropertyOptional({
    description: 'Lista de IDs de lecciones iniciales para precargar el temario del curso',
    example: ['leccion-101', 'leccion-102', 'leccion-103'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  leccionesIds?: string[];
}
