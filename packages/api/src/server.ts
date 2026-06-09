import { buildApp } from "./app.js";

const HOST = process.env["HOST"] ?? "0.0.0.0";
const PORT = Number(process.env["PORT"] ?? 3001);

const app = buildApp();

try {
  await app.listen({ host: HOST, port: PORT });
  app.log.info(`API escuchando en http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
