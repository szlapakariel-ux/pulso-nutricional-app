import type { FastifyInstance } from "fastify";
import { healthController } from "../controllers/health.controller.js";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        description: "Verifica que la API está activa",
        tags: ["health"],
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["ok", "degraded", "down"] },
                  service: { type: "string" },
                  version: { type: "string" },
                  timestamp: { type: "string" },
                  environment: { type: "string" },
                },
                required: ["status", "service", "version", "timestamp", "environment"],
              },
            },
          },
        },
      },
    },
    healthController,
  );
}
