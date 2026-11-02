import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, type ChannelModel, type ConfirmChannel } from 'amqplib';
import { ProgresoModuloRepository } from '../repositories/progreso-modulo.repository';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'aulabreve.domain.events';
const ROUTING_KEY = 'ModuloCompletado';
const COMMUNITY_QUEUE = 'community.modulo-completado';

@Injectable()
export class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;
  private timer?: NodeJS.Timeout;
  private trabajando = false;

  constructor(private readonly repositorio: ProgresoModuloRepository) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.publicarPendientes(), 2000);
    this.timer.unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  private async publicarPendientes(): Promise<void> {
    if (this.trabajando || !process.env.RABBITMQ_URL) return;
    this.trabajando = true;
    try {
      await this.conectar();
      const ahora = new Date();
      const documentos = await this.repositorio.listarPendientes(ahora, 25);

      for (const documento of documentos) {
        for (const evento of documento.outboxEvents.filter(
          (item) => item.estado === 'PENDIENTE' && (!item.reintentarEn || item.reintentarEn <= ahora),
        )) {
          try {
            await this.publicar(evento.eventId, evento.payload);
            await this.repositorio.marcarPublicado(documento._id, evento.eventId, new Date());
          } catch (error) {
            const intentos = evento.intentos + 1;
            const esperaMs = Math.min(300_000, 1000 * 2 ** Math.min(intentos, 8));
            await this.repositorio.programarReintento(
              documento._id,
              evento.eventId,
              new Date(Date.now() + esperaMs),
              error instanceof Error ? error.message.slice(0, 500) : 'Error de publicación',
            );
            this.logger.warn(`Evento ${evento.eventId} pendiente; reintento programado`);
            break;
          }
        }
      }
    } catch (error) {
      this.descartarConexion();
      this.logger.warn(
        `RabbitMQ/outbox no disponible: ${error instanceof Error ? error.message : 'error desconocido'}`,
      );
    } finally {
      this.trabajando = false;
    }
  }

  private async conectar(): Promise<void> {
    if (this.channel) return;
    const conexion = await connect(process.env.RABBITMQ_URL as string);
    const canal = await conexion.createConfirmChannel();
    await canal.assertExchange(EXCHANGE, 'topic', { durable: true });
    await canal.assertQueue(COMMUNITY_QUEUE, { durable: true });
    await canal.bindQueue(COMMUNITY_QUEUE, EXCHANGE, ROUTING_KEY);
    conexion.on('close', () => this.descartarConexion());
    conexion.on('error', () => this.descartarConexion());
    this.connection = conexion;
    this.channel = canal;
  }

  private async publicar(eventId: string, payload: Record<string, unknown>): Promise<void> {
    const canal = this.channel;
    if (!canal) throw new Error('Canal RabbitMQ no conectado');
    canal.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
      messageId: eventId,
      type: ROUTING_KEY,
    });
    await canal.waitForConfirms();
  }

  private descartarConexion(): void {
    this.channel = undefined;
    this.connection = undefined;
  }
}
