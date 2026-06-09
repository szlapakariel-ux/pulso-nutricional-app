import type { FastifyReply, FastifyRequest } from "fastify";
import { getHealthStatus } from "../services/health.service.js";

export async function healthController(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const status = getHealthStatus();
  await reply.code(200).send({ data: status });
}
