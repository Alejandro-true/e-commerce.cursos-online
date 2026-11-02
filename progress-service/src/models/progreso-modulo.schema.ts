import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProgresoModuloDocument = ProgresoModulo & Document;

@Schema({ _id: false })
export class EventoOutbox {
  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true, default: 'PENDIENTE' })
  estado: string;

  @Prop({ required: true, type: Object })
  payload: Record<string, unknown>;

  @Prop({ required: true, default: Date.now })
  creadoEn: Date;

  @Prop()
  reintentarEn?: Date;

  @Prop({ default: 0 })
  intentos: number;

  @Prop()
  publicadoEn?: Date;

  @Prop()
  ultimoError?: string;
}

export const EventoOutboxSchema = SchemaFactory.createForClass(EventoOutbox);

@Schema({ collection: 'progreso_modulos', timestamps: true, optimisticConcurrency: true })
export class ProgresoModulo {
  @Prop({ required: true, index: true })
  idUsuario: string;

  @Prop({ required: true, index: true })
  idCurso: string;

  @Prop({ required: true })
  versionCurso: string;

  @Prop({ required: true })
  idModulo: string;

  @Prop({ required: true, type: [String] })
  leccionesObligatorias: string[];

  @Prop({ type: [String], default: [] })
  leccionesCompletadas: string[];

  @Prop({ required: true, default: 0, min: 0, max: 100 })
  porcentaje: number;

  @Prop({ default: false })
  completado: boolean;

  @Prop()
  fechaCompletado?: Date;

  @Prop()
  ultimaLeccionId?: string;

  @Prop({ default: Date.now })
  ultimoAcceso: Date;

  @Prop({ type: [EventoOutboxSchema], default: [] })
  outboxEvents: EventoOutbox[];
}

export const ProgresoModuloSchema = SchemaFactory.createForClass(ProgresoModulo);
ProgresoModuloSchema.index(
  { idUsuario: 1, idCurso: 1, versionCurso: 1, idModulo: 1 },
  { unique: true },
);
ProgresoModuloSchema.index({ 'outboxEvents.estado': 1, 'outboxEvents.reintentarEn': 1 });
