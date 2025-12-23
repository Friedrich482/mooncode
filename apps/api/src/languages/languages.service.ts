import { and, asc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { languages } from "src/drizzle/schema/languages";

import { Inject, Injectable } from "@nestjs/common";

import {
  CreateLanguageDtoType,
  FindAllLanguagesDtoType,
  FindOneLanguageDtoType,
  UpdateLanguageDtoType,
} from "./languages.dto";

@Injectable()
export class LanguagesService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase
  ) {}
  async create(createLanguageDto: CreateLanguageDtoType) {
    const { dailyDataId, languageSlug, timeSpent } = createLanguageDto;

    const [createdLanguageData] = await this.db
      .insert(languages)
      .values({
        languageSlug,
        timeSpent,
        dailyDataId,
      })
      .returning({
        languageSlug: languages.languageSlug,
        timeSpent: languages.timeSpent,
      });

    return createdLanguageData;
  }

  async findAll(findAllLanguagesDto: FindAllLanguagesDtoType) {
    const { dailyDataId } = findAllLanguagesDto;

    const languagesDataArray = await this.db
      .select({
        timeSpent: languages.timeSpent,
        languageSlug: languages.languageSlug,
      })
      .from(languages)
      .where(eq(languages.dailyDataId, dailyDataId))
      .orderBy(asc(languages.timeSpent));

    const languagesDataObject: {
      [languageSlug: string]: number;
    } = Object.fromEntries(
      languagesDataArray.map(({ languageSlug, timeSpent }) => [
        languageSlug,
        timeSpent,
      ])
    );

    return languagesDataObject;
  }

  async findOne(findOneLanguageDto: FindOneLanguageDtoType) {
    const { dailyDataId, languageSlug } = findOneLanguageDto;

    const [languageData] = await this.db
      .select({
        timeSpent: languages.timeSpent,
        languageSlug: languages.languageSlug,
        languageId: languages.id,
      })
      .from(languages)
      .where(
        and(
          eq(languages.dailyDataId, dailyDataId),
          eq(languages.languageSlug, languageSlug)
        )
      );

    if (!languageData) return null;

    return languageData;
  }

  async update(updateLanguageDto: UpdateLanguageDtoType) {
    const { timeSpent, dailyDataId, languageSlug } = updateLanguageDto;

    const [updatedLanguageData] = await this.db
      .update(languages)
      .set({
        timeSpent,
      })
      .where(
        and(
          eq(languages.dailyDataId, dailyDataId),
          eq(languages.languageSlug, languageSlug)
        )
      )
      .returning({
        languageSlug: languages.languageSlug,
        timeSpent: languages.timeSpent,
      });

    return updatedLanguageData;
  }
}
