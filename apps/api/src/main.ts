import cookieParser from "cookie-parser";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { ALLOWED_CLIENTS } from "./common/constants";
import { TrpcRouter } from "./trpc/trpc.router";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ALLOWED_CLIENTS,
    credentials: true,
  });
  app.use(cookieParser());

  const trpc = app.get(TrpcRouter);
  trpc.applyMiddleware(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
