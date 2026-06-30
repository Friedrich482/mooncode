import React from "react";
import { beforeEach, describe, expect } from "vitest";
import { cleanup, render } from "vitest-browser-react";

import { LOGO_URL, SUPPORT_EMAIL } from "../constants";
import { getEmailUpdateNoticeEmailBody } from "./get-email-update-notice-email-body";

describe("getEmailUpdateNoticeEmailBody", () => {
  let htmlBody: string;
  let TestComponent: () => React.JSX.Element;

  beforeEach(() => {
    cleanup();

    htmlBody = getEmailUpdateNoticeEmailBody();
    TestComponent = () => {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: htmlBody,
          }}
        />
      );
    };
  });

  it("should include an element containing the text 'Email Update Notice'", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect.element(getByText(/Email Update Notice/)).toBeInTheDocument();
  });

  it("should include an indication about what to do if the user wasn't the source of the email update process", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect
      .element(getByText(`please contact ${SUPPORT_EMAIL}`))
      .toBeInTheDocument();
  });

  it("should include the current year", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect
      .element(getByText(`MoonCode ${new Date().getFullYear()}`))
      .toBeInTheDocument();
  });

  it("should include MoonCode's logo (the image)", async () => {
    const { getByAltText } = await render(<TestComponent />);

    const mooncodeLogoImageLocator = getByAltText("MoonCode Logo");
    await expect.element(mooncodeLogoImageLocator).toBeInTheDocument();
    await expect
      .element(mooncodeLogoImageLocator)
      .toHaveAttribute("src", LOGO_URL);
  });
});
