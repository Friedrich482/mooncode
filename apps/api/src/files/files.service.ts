import { and, asc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { branches } from "@/drizzle/schema";
import { files } from "@/drizzle/schema/files";
import { languages } from "@/drizzle/schema/languages";
import { projects } from "@/drizzle/schema/projects";
import { Inject, Injectable } from "@nestjs/common";

import {
  CreateFileDtoType,
  FindAllFilesOnDayDtoType,
  FindOneFileDtoType,
  UpdateFileDtoType,
} from "./files.dto";

@Injectable()
export class FilesService {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}

  async create(createFileDto: CreateFileDtoType) {
    const { languageId, branchId, name, timeSpent, path } = createFileDto;

    const [createdFileData] = await this.db
      .insert(files)
      .values({
        languageId,
        branchId,
        name,
        path,
        timeSpent,
      })
      .returning({
        name: files.name,
        timeSpent: files.timeSpent,
        path: files.path,
      });

    return createdFileData;
  }

  async findOne(findOneFileDto: FindOneFileDtoType) {
    const { languageId, branchId, name, path } = findOneFileDto;

    const [fileData] = await this.db
      .select({
        name: files.name,
        path: files.path,
        timeSpent: files.timeSpent,
      })
      .from(files)
      .where(
        and(
          eq(files.languageId, languageId),
          eq(files.branchId, branchId),
          eq(files.name, name),
          eq(files.path, path),
        ),
      )
      .limit(1);

    if (!fileData) {
      return null;
    }

    return fileData;
  }

  async findAllOnDay(findAllFilesOnDayDto: FindAllFilesOnDayDtoType) {
    const { dailyDataId } = findAllFilesOnDayDto;

    const filesDataArray = await this.db
      .select({
        languageSlug: languages.languageSlug,
        timeSpent: files.timeSpent,
        fileName: files.name,
        filePath: files.path,
        projectName: projects.name,
        projectPath: projects.path,
        branchName: branches.name,
      })
      .from(files)
      .innerJoin(branches, eq(branches.id, files.branchId))
      .innerJoin(projects, eq(projects.id, branches.projectId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(eq(projects.dailyDataId, dailyDataId))
      .orderBy(asc(files.timeSpent));

    return filesDataArray;
  }

  async update(updateFileDto: UpdateFileDtoType) {
    const { timeSpent, branchId, languageId, name, path } = updateFileDto;

    const [updatedFileData] = await this.db
      .update(files)
      .set({
        timeSpent,
      })
      .where(
        and(
          eq(files.branchId, branchId),
          eq(files.languageId, languageId),
          eq(files.name, name),
          eq(files.path, path),
        ),
      )
      .returning({
        name: files.name,
        path: files.path,
        timeSpent: files.timeSpent,
      });

    return updatedFileData;
  }
}
