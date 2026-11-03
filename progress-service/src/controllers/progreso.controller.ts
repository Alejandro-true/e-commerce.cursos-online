import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProgresoService } from '../services/progreso.service';
import { ProgresoModuloService } from '../services/progreso-modulo.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { CompletarLeccionModuloDto } from '../dto/completar-leccion-modulo.dto';
import { CompletarLeccionDto } from '../dto/completar-leccion.dto';
import { DesmarcarLeccionDto } from '../dto/desmarcar-leccion.dto';
import { GuardarPosicionDto } from '../dto/guardar-posicion.dto';
import { InicializarProgresoDto } from '../dto/inicializar-progreso.dto';
import { ProgresoView } from '../views/progreso.view';

interface AuthenticatedRequest extends Request {
  user: { idUsuario: string; roles: string[] };
}

@ApiTags('Progreso de Aprendizaje')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progreso')
export class ProgresoController {
  constructor(
    private readonly servicioProgreso: ProgresoService,
    private readonly servicioModulo: ProgresoModuloService,
  ) {}

  @Post('inicializar')
  @HttpCode(HttpStatus.OK)
  async inicializar(@Body() dto: InicializarProgresoDto) {
    return ProgresoView.curso(await this.servicioProgreso.inicializarProgreso(dto));
  }

  @Post('completar-leccion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ deprecated: true, summary: 'Compatibilidad con el flujo anterior por curso' })
  async completarLeccion(@Body() dto: CompletarLeccionDto) {
    return ProgresoView.curso(await this.servicioProgreso.completarLeccion(dto));
  }

  @Post('modulo/completar-leccion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar una finalización idempotente de lección dentro de un módulo y versión',
    description:
      'Valida el token, el acceso vigente en Catálogo y la estructura publicada; al completar el módulo guarda ModuloCompletado en el outbox.',
  })
  @ApiResponse({ status: 200, description: 'Avance del módulo y curso actualizado' })
  async completarLeccionModulo(
    @Body() dto: CompletarLeccionModuloDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Se requiere el encabezado Idempotency-Key');
    }
    return this.servicioModulo.completarLeccion(
      request.user.idUsuario,
      dto,
      idempotencyKey.trim(),
    );
  }

  @Get('modulo/curso/:idCurso/version/:versionCurso')
  @ApiOperation({ summary: 'Consultar el progreso por módulos del usuario autenticado' })
  async obtenerProgresoModulo(
    @Param('idCurso') idCurso: string,
    @Param('versionCurso') versionCurso: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.servicioModulo.consultarCurso(request.user.idUsuario, idCurso, versionCurso);
  }

  @Post('desmarcar-leccion')
  @HttpCode(HttpStatus.OK)
  async desmarcarLeccion(@Body() dto: DesmarcarLeccionDto) {
    return ProgresoView.curso(await this.servicioProgreso.desmarcarLeccion(dto));
  }

  @Post('guardar-posicion')
  @HttpCode(HttpStatus.OK)
  async guardarPosicion(@Body() dto: GuardarPosicionDto) {
    return ProgresoView.curso(await this.servicioProgreso.guardarPosicion(dto));
  }

  @Get('usuario/:idUsuario')
  @ApiParam({ name: 'idUsuario', description: 'ID del usuario del token' })
  async obtenerTodosLosProgresosUsuario(@Param('idUsuario') idUsuario: string) {
    return ProgresoView.historial(await this.servicioProgreso.obtenerTodosLosProgresosUsuario(idUsuario));
  }

  @Get('curso/:idCurso/metricas')
  async obtenerMetricasCurso(@Param('idCurso') idCurso: string) {
    return await this.servicioProgreso.obtenerMetricasCurso(idCurso);
  }

  @Get(':idUsuario/:idCurso')
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  async obtenerProgreso(
    @Param('idUsuario') idUsuario: string,
    @Param('idCurso') idCurso: string,
  ) {
    return ProgresoView.curso(await this.servicioProgreso.obtenerProgreso(idUsuario, idCurso));
  }

  @Put(':idUsuario/:idCurso/reiniciar')
  async reiniciarProgreso(
    @Param('idUsuario') idUsuario: string,
    @Param('idCurso') idCurso: string,
  ) {
    return ProgresoView.curso(await this.servicioProgreso.reiniciarProgreso(idUsuario, idCurso));
  }

  @Delete(':idUsuario/:idCurso')
  async eliminarProgreso(
    @Param('idUsuario') idUsuario: string,
    @Param('idCurso') idCurso: string,
  ) {
    return await this.servicioProgreso.eliminarProgreso(idUsuario, idCurso);
  }
}
