import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompletarLeccionModuloDto {
  @ApiProperty({ example: 'curso-101' })
  @IsString()
  @IsNotEmpty()
  idCurso: string;

  @ApiProperty({ example: 'version-3' })
  @IsString()
  @IsNotEmpty()
  versionCurso: string;

  @ApiProperty({ example: 'modulo-1' })
  @IsString()
  @IsNotEmpty()
  idModulo: string;

  @ApiProperty({ example: 'leccion-1' })
  @IsString()
  @IsNotEmpty()
  idLeccion: string;
}
