import asyncio
import json
import logging

import aio_pika
from pydantic import ValidationError

from app.core.config import settings
from app.database.session import SessionLocal
from app.schemas.reward import ModuleCompletedData
from app.services.reward_service import grant_module_reward

logger = logging.getLogger(__name__)


async def _process_message(message: aio_pika.abc.AbstractIncomingMessage) -> None:
    try:
        payload = json.loads(message.body)
        data = ModuleCompletedData(
            estudiante_id=payload["idUsuario"],
            modulo_id=payload["idModulo"],
        )
    except (json.JSONDecodeError, KeyError, TypeError, ValidationError) as exc:
        logger.exception("Se descarta un evento ModuloCompletado inválido: %s", exc)
        await message.reject(requeue=False)
        return

    try:
        with SessionLocal() as db:
            grant_module_reward(db, data)
        await message.ack()
    except Exception:
        logger.exception("No se pudo conceder la recompensa del módulo %s", data.modulo_id)
        await message.nack(requeue=True)


async def consume_module_completed() -> None:
    if not settings.rabbitmq_url:
        logger.info("RabbitMQ no está configurado; no se inicia el consumidor de recompensas")
        return

    while True:
        try:
            connection = await aio_pika.connect_robust(settings.rabbitmq_url)
            async with connection:
                channel = await connection.channel()
                await channel.set_qos(prefetch_count=10)
                exchange = await channel.declare_exchange(
                    settings.rabbitmq_exchange,
                    aio_pika.ExchangeType.TOPIC,
                    durable=True,
                )
                queue = await channel.declare_queue(settings.rabbitmq_queue, durable=True)
                await queue.bind(exchange, routing_key="ModuloCompletado")
                logger.info("Consumidor RabbitMQ listo: %s", settings.rabbitmq_queue)
                async with queue.iterator() as iterator:
                    async for message in iterator:
                        await _process_message(message)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("RabbitMQ no disponible; se reintentará en 5 segundos")
            await asyncio.sleep(5)
