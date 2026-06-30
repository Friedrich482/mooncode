import cookieParser from "cookie-parser";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { AppRouterRouter } from "./app-router/app-router.router";
import { getAllowedClients } from "./common/utils/get-allowed-clients";

async function bootstrap() {
  const allowedClients = getAllowedClients();

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: allowedClients,
    credentials: true,
  });
  app.use(cookieParser());

  const trpc = app.get(AppRouterRouter);
  trpc.applyMiddleware(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
