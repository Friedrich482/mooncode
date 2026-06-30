import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-react";

import { LOGO_URL } from "../constants";
import { getPasswordResetEmailBody } from "./get-password-reset-email-body";

describe("getPasswordResetEmailBody", () => {
  const mockedCode = "GF3TKHBM";

  let htmlBody: string;
  let TestComponent: () => React.JSX.Element;

  beforeEach(() => {
    cleanup();

    htmlBody = getPasswordResetEmailBody(mockedCode);
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

  it("should include the code in the body of the email", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect.element(getByText(mockedCode)).toBeInTheDocument();
  });

  it("should include an element containing the text 'Password Reset' since it is about password reset", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect.element(getByText(/Password Reset/i)).toBeInTheDocument();
  });

  it("should include the duration of validity of the code sent", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect.element(getByText("valid for 15 minutes")).toBeInTheDocument();
  });

  it("should include an indication about what to do if the user wasn't the source of the password reset process", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect
      .element(getByText("you can safely ignore and delete this email"))
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
