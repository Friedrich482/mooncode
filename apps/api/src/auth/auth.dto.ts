import { Request, Response } from "express";
import { z } from "zod";
import { environmentEnum } from "src/common/dto";

export const HandleGoogleQueryDto = z.union([
  z.object({ code: z.string().min(1) }),
  z.object({ error: z.string().min(1) }),
]);

export const HandleGoogleCallBackDto = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("success"),
    code: z.string().min(1),
  }),
  z.object({
    type: z.literal("error"),
    error: z.string().min(1),
  }),
]);

export const HandleGoogleLinkingCallBackDto = HandleGoogleCallBackDto;

export const StateQueryParamSchema = z.object({
  state: z.url(),
});

export const RedirectToGoogleDto = StateQueryParamSchema.extend({
  callback: z.url().optional(),
});

export const RedirectToGoogleForLinkingDto = StateQueryParamSchema;

export const GoogleUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  verified_email: z.boolean(),
  name: z.string().min(1),
  given_name: z.string().min(1),
  family_name: z.string().min(1),
  picture: z.string().min(1),
});

export type Environment = (typeof environmentEnum)[number];
export type HandleGoogleQueryDtoType = z.infer<typeof HandleGoogleQueryDto>;

export type HandleGoogleCallBacKDtoType = z.infer<
  typeof HandleGoogleCallBackDto
> & { response: Response; request: Request };

export type HandleGoogleLinkingCallBackDtoType = z.infer<
  typeof HandleGoogleLinkingCallBackDto
> & { response: Response; request: Request & { user: { sub: string } } };

export type RedirectToGoogleDtoType = z.infer<typeof RedirectToGoogleDto> & {
  response: Response;
};

export type GoogleUser = z.infer<typeof GoogleUserSchema>;

export type RedirectToGoogleForLinkingDtoType = z.infer<
  typeof RedirectToGoogleForLinkingDto
> & { response: Response };
