import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { LanguagesService } from "./languages.service";

@Module({
  imports: [DrizzleModule],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
