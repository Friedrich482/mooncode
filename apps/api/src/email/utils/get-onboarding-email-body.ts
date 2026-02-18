export const getOnboardingEmailBody = (code: string) => {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
  <link
      rel="preload"
      as="image"
      href="https://pub-ed7ddcd6ee5d46ef8244de5ac2e76ee5.r2.dev/moon-email.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #18181b">
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color: #18181b"
    >
      <tr>
        <td align="center" style="padding: 20px">
          <!-- Main container -->
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="max-width: 432px; background-color: #18181b"
          >
            <tr>
              <td align="center" style="padding-top: 40px; padding-bottom: 0">
                <img
                  alt="MoonCode Logo"
                  src="https://pub-ed7ddcd6ee5d46ef8244de5ac2e76ee5.r2.dev/moon-email.png"
                  width="100"
                  height="100"
                  style="display: block; border: 0"
                />
              </td>
            </tr>
            <tr>
              <td style="padding: 25px 0">
                <h1
                  style="
                    margin: 0 0 15px 0;
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: 700;
                    font-family: HelveticaNeue, Helvetica, Arial, sans-serif;
                  "
                >
                  Verify your identity
                </h1>
                <p
                  style="
                    margin: 24px 0 14px 0;
                    color: #ffffff;
                    font-size: 16px;
                    font-family: HelveticaNeue, Helvetica, Arial, sans-serif;
                  "
                >
                  Thanks for starting the MoonCode registration process. Here is
                  your verification code:
                </p>
                <p
                  style="
                    margin: 20px auto;
                    color: #ffffff;
                    font-size: 46px;
                    font-weight: 700;
                    text-align: center;
                    font-family: HelveticaNeue, Helvetica, Arial, sans-serif;
                    background-color: #3f3f46;
                    padding: 4px;
                    border-radius: 8px;
                  "
                >
                  ${code}
                </p>
                <p
                  style="
                    margin: 32px 0 0 0;
                    color: #ffffff;
                    font-size: 18px;
                    line-height: 24px;
                    font-family: HelveticaNeue, Helvetica, Arial, sans-serif;
                  "
                >
                  This code will be valid for 30 minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 25px 0">
                <p
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 14px;
                    line-height: 24px;
                    opacity: 0.65;
                    font-family: HelveticaNeue, Helvetica, Arial, sans-serif;
                  "
                >
                  If you did not try to register, you can safely ignore and delete this
                  email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 16px 0">
                <p
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 14px;
                    line-height: 20px;
                    text-align: center;
                    opacity: 0.65;
                    font-family: HelveticaNeue, Helvetica, Arial, sans-serif;
                  "
                >
                  MoonCode ${currentYear}, &copy; All rights reserved
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
