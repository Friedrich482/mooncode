import { and, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { branches } from "@/drizzle/schema";
import { Inject, Injectable } from "@nestjs/common";

import {
  CreateBranchDtoType,
  FindBranchDtoType,
  UpdateBranchDtoType,
} from "./branches.dto";

@Injectable()
export class BranchesService {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}
  async create(createBranchDto: CreateBranchDtoType) {
    const { projectId, name, timeSpent } = createBranchDto;

    const [createBranch] = await this.db
      .insert(branches)
      .values({
        projectId,
        name,
        timeSpent,
      })
      .returning({
        id: branches.id,
        name: branches.name,
        timeSpent: branches.timeSpent,
      });

    return createBranch;
  }

  async findOne(findBranchDto: FindBranchDtoType) {
    const { name, projectId } = findBranchDto;

    const [branch] = await this.db
      .select({
        id: branches.id,
        name: branches.name,
        timeSpent: branches.timeSpent,
      })
      .from(branches)
      .where(and(eq(branches.projectId, projectId), eq(branches.name, name)))
      .limit(1);

    if (!branch) {
      return null;
    }

    return branch;
  }

  async update(updateBranchDto: UpdateBranchDtoType) {
    const { projectId, timeSpent, name } = updateBranchDto;

    const [updatedBranch] = await this.db
      .update(branches)
      .set({ timeSpent })
      .where(and(eq(branches.projectId, projectId), eq(branches.name, name)))
      .returning({
        name: branches.name,
        timeSpent: branches.timeSpent,
        projectId: branches.projectId,
      });

    return updatedBranch;
  }
}
