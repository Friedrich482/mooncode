import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { DASHBOARD_PORT } from "@repo/common/constants";
import { NestFactory } from "@nestjs/core";
import { TrpcExceptionFilter } from "./trpc/trpc.exception-handler";
import { TrpcRouter } from "./trpc/trpc.router";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: Array.from({ length: 6 }, (_, i) => DASHBOARD_PORT + i).flatMap(
      (port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`],
    ),
    credentials: true,
  });

  app.use(cookieParser());
  const trpc = app.get(TrpcRouter);
  app.useGlobalFilters(new TrpcExceptionFilter());
  trpc.applyMiddleware(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
