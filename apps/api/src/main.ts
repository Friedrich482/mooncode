import * as cookieParser from "cookie-parser";
import { DASHBOARD_PORT, DASHBOARD_PREVIEW_PORT } from "@repo/common/constants";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { TrpcRouter } from "./trpc/trpc.router";

export const allowedClients = Array.from(
  { length: 6 },
  (_, i) => DASHBOARD_PORT + i,
)
  .flatMap((port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`])
  .concat([
    `http://localhost:${DASHBOARD_PREVIEW_PORT}`,
    `http://127.0.0.1:${DASHBOARD_PREVIEW_PORT}`,
  ]);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: allowedClients,
    credentials: true,
  });
  app.use(cookieParser());

  const trpc = app.get(TrpcRouter);
  trpc.applyMiddleware(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
