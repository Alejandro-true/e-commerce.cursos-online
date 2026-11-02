import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ProgresoModuloRepository } from '../repositories/progreso-modulo.repository';
export declare class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
    private readonly repositorio;
    private readonly logger;
    private connection?;
    private channel?;
    private timer?;
    private trabajando;
    constructor(repositorio: ProgresoModuloRepository);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    private publicarPendientes;
    private conectar;
    private publicar;
    private descartarConexion;
}
