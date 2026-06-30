import React from "react";
import { beforeEach, describe, expect } from "vitest";
import { cleanup, render } from "vitest-browser-react";

import { LOGO_URL } from "../constants";
import { getEmailUpdateEmailBody } from "./get-email-update-email-body";

describe("getEmailUpdateEmailBody", () => {
  const mockedCode = "K23TKHBM";

  let htmlBody: string;
  let TestComponent: () => React.JSX.Element;

  beforeEach(() => {
    cleanup();

    htmlBody = getEmailUpdateEmailBody(mockedCode);
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

  it("should include an element containing the text 'Email Update'", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect.element(getByText(/Email update/)).toBeInTheDocument();
  });

  it("should include the duration of validity of the code sent", async () => {
    const { getByText } = await render(<TestComponent />);

    await expect.element(getByText("valid for 15 minutes")).toBeInTheDocument();
  });

  it("should include an indication about what to do if the user wasn't the source of the email update process", async () => {
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
