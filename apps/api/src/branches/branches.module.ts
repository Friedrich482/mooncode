import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { BranchesService } from "./branches.service";

@Module({
  imports: [DrizzleModule],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
