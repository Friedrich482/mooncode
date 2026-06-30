import { and, asc, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { languages } from "@/drizzle/schema/languages";
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
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
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

    const languagesData: {
      [languageSlug: string]: number;
    } = Object.fromEntries(
      languagesDataArray.map(({ languageSlug, timeSpent }) => [
        languageSlug,
        timeSpent,
      ]),
    );

    return languagesData;
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
          eq(languages.languageSlug, languageSlug),
        ),
      );

    if (!languageData) {
      return null;
    }

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
          eq(languages.languageSlug, languageSlug),
        ),
      )
      .returning({
        languageSlug: languages.languageSlug,
        timeSpent: languages.timeSpent,
      });

    return updatedLanguageData;
  }
}
