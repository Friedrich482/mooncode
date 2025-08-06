import { z } from "zod";

export const CreateLanguageDto = z.object({
  dailyDataId: z.ulid(),
  timeSpent: z.number().int(),
  languageSlug: z.string().min(1),
});

export const FindAllLanguagesDto = z.object({
  dailyDataId: z.ulid(),
});

export const FindOneLanguageDto = z.object({
  dailyDataId: z.ulid(),
  languageSlug: z.string().min(1),
});

export const UpdateLanguageDto = CreateLanguageDto;

export type CreateLanguageDtoType = z.infer<typeof CreateLanguageDto>;

export type UpdateLanguageDtoType = z.infer<typeof UpdateLanguageDto>;

export type FindAllLanguagesDtoType = z.infer<typeof FindAllLanguagesDto>;

export type FindOneLanguageDtoType = z.infer<typeof FindOneLanguageDto>;
