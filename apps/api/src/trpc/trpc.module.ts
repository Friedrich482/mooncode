import { EnvModule } from "@/env/env.module";
import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { limitersProvider } from "./providers/limiters.provider";
import { trpcProvider } from "./providers/trpc.provider";
import { TrpcService } from "./trpc.service";

@Global()
@Module({
  imports: [JwtModule, EnvModule],
  providers: [TrpcService, trpcProvider, limitersProvider],
  exports: [TrpcService],
})
export class TrpcModule {}
