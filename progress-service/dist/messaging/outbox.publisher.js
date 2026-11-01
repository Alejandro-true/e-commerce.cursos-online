"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OutboxPublisher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxPublisher = void 0;
const common_1 = require("@nestjs/common");
const amqplib_1 = require("amqplib");
const progreso_modulo_repository_1 = require("../repositories/progreso-modulo.repository");
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'aulabreve.domain.events';
const ROUTING_KEY = 'ModuloCompletado';
const COMMUNITY_QUEUE = 'community.modulo-completado';
let OutboxPublisher = OutboxPublisher_1 = class OutboxPublisher {
    repositorio;
    logger = new common_1.Logger(OutboxPublisher_1.name);
    connection;
    channel;
    timer;
    trabajando = false;
    constructor(repositorio) {
        this.repositorio = repositorio;
    }
    onModuleInit() {
        this.timer = setInterval(() => void this.publicarPendientes(), 2000);
        this.timer.unref();
    }
    async onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
        await this.channel?.close().catch(() => undefined);
        await this.connection?.close().catch(() => undefined);
    }
    async publicarPendientes() {
        if (this.trabajando || !process.env.RABBITMQ_URL)
            return;
        this.trabajando = true;
        try {
            await this.conectar();
            const ahora = new Date();
            const documentos = await this.repositorio.listarPendientes(ahora, 25);
            for (const documento of documentos) {
                for (const evento of documento.outboxEvents.filter((item) => item.estado === 'PENDIENTE' && (!item.reintentarEn || item.reintentarEn <= ahora))) {
                    try {
                        await this.publicar(evento.eventId, evento.payload);
                        await this.repositorio.marcarPublicado(documento._id, evento.eventId, new Date());
                    }
                    catch (error) {
                        const intentos = evento.intentos + 1;
                        const esperaMs = Math.min(300_000, 1000 * 2 ** Math.min(intentos, 8));
                        await this.repositorio.programarReintento(documento._id, evento.eventId, new Date(Date.now() + esperaMs), error instanceof Error ? error.message.slice(0, 500) : 'Error de publicación');
                        this.logger.warn(`Evento ${evento.eventId} pendiente; reintento programado`);
                        break;
                    }
                }
            }
        }
        catch (error) {
            this.descartarConexion();
            this.logger.warn(`RabbitMQ/outbox no disponible: ${error instanceof Error ? error.message : 'error desconocido'}`);
        }
        finally {
            this.trabajando = false;
        }
    }
    async conectar() {
        if (this.channel)
            return;
        const conexion = await (0, amqplib_1.connect)(process.env.RABBITMQ_URL);
        const canal = await conexion.createConfirmChannel();
        await canal.assertExchange(EXCHANGE, 'topic', { durable: true });
        await canal.assertQueue(COMMUNITY_QUEUE, { durable: true });
        await canal.bindQueue(COMMUNITY_QUEUE, EXCHANGE, ROUTING_KEY);
        conexion.on('close', () => this.descartarConexion());
        conexion.on('error', () => this.descartarConexion());
        this.connection = conexion;
        this.channel = canal;
    }
    async publicar(eventId, payload) {
        const canal = this.channel;
        if (!canal)
            throw new Error('Canal RabbitMQ no conectado');
        canal.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(payload)), {
            persistent: true,
            contentType: 'application/json',
            messageId: eventId,
            type: ROUTING_KEY,
        });
        await canal.waitForConfirms();
    }
    descartarConexion() {
        this.channel = undefined;
        this.connection = undefined;
    }
};
exports.OutboxPublisher = OutboxPublisher;
exports.OutboxPublisher = OutboxPublisher = OutboxPublisher_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [progreso_modulo_repository_1.ProgresoModuloRepository])
], OutboxPublisher);
//# sourceMappingURL=outbox.publisher.js.map