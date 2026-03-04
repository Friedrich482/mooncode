import { Response } from "express";

export const handleErrorResponse = ({
  url,
  error,
  errorDescription,
  response,
}: {
  url: URL;
  error: string;
  errorDescription: string;
  response: Response;
}) => {
  url.searchParams.set("error", error);
  url.searchParams.set("error-description", errorDescription);
  response.redirect(url.toString());
};
