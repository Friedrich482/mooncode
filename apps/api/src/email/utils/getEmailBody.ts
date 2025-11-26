const getEmailBody = (code: string) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link rel="preload" as="image" href="../assets/moon.svg" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="background-color: oklch(0.21 0.006 285.885)">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tbody>
        <tr>
          <td
            style="
              background-color: oklch(0.21 0.006 285.885);
              font-family: &quot;Roboto&quot;;
            "
          >
            <div
              style="
                display: none;
                overflow: hidden;
                line-height: 1px;
                opacity: 0;
                max-height: 0;
                max-width: 0;
              "
              data-skip-in-text="true"
            >
              MoonCode Email Verification
              <div></div>
            </div>
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="
                max-width: 27rem;
                padding: 20px;
                margin-right: auto;
                margin-left: auto;
                margin-top: 1rem;
                background-color: oklch(0.21 0.006 285.885);
              "
            >
              <tbody>
                <tr style="width: 100%">
                  <td>
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="
                        background-color: oklch(0.21 0.006 285.885);
                        border: 0.5px solid oklch(0.439 0 0);
                        border-radius: 0.5rem;
                        padding-top: 1.5rem;
                      "
                    >
                      <tbody>
                        <tr>
                          <td>
                            <table
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                background-color: oklch(0.21 0.006 285.885);
                                display: flex;
                                padding-bottom: 0px;
                                padding-top: 40px;
                                align-items: center;
                                justify-content: center;
                                border-radius: 0.5rem;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <img
                                      alt="MoonCode's Logo"
                                      height="100"
                                      src="../assets/moon.svg"
                                      style="
                                        display: block;
                                        outline: none;
                                        border: none;
                                        text-decoration: none;
                                      "
                                    />
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                padding-bottom: 25px;
                                padding-top: 25px;
                                padding-right: 35px;
                                padding-left: 35px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <h1
                                      style="
                                        color: oklch(1 0 0);
                                        font-size: 2rem;
                                        font-weight: 700;
                                        margin-bottom: 15px;
                                      "
                                    >
                                      Verify your identity
                                    </h1>
                                    <p
                                      style="
                                        font-size: 1.125rem;
                                        line-height: 24px;
                                        color: oklch(1 0 0);
                                        margin-top: 24px;
                                        margin-bottom: 14px;
                                        margin-right: 0;
                                        margin-left: 0;
                                      "
                                    >
                                      Thanks for starting the MoonCode
                                      registration process. Here is your
                                      verification code
                                    </p>
                                    <p
                                      style="
                                        font-size: 2.25rem;
                                        line-height: 24px;
                                        color: oklch(1 0 0);
                                        margin-bottom: 1rem;
                                        margin-top: 1rem;
                                        margin-right: 0;
                                        margin-left: 0;
                                        font-weight: 700;
                                        text-align: center;
                                      "
                                    >
                                      ${code}
                                    </p>
                                    <p
                                      style="
                                        font-size: 1.125rem;
                                        line-height: 24px;
                                        color: oklch(1 0 0);
                                        margin: 0;
                                        text-align: start;
                                        margin-top: 2rem;
                                        margin-bottom: 0;
                                        margin-left: 0;
                                        margin-right: 0;
                                        display: block;
                                      "
                                    >
                                      This code will be valid for 30 minutes.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table
                              width="100%"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                padding-bottom: 25px;
                                padding-right: 35px;
                                padding-left: 35px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <p
                                      style="
                                        font-size: 1.125rem;
                                        line-height: 24px;
                                        color: oklch(1 0 0);
                                        margin: 0;
                                        margin-top: 0;
                                        margin-bottom: 0;
                                        margin-left: 0;
                                        margin-right: 0;
                                      "
                                    >
                                      If you did not try to login in, you can
                                      safely ignore this email.
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p
                              style="
                                font-size: 1rem;
                                line-height: 24px;
                                color: oklch(1 0 0);
                                text-align: center;
                                padding-bottom: 1rem;
                                padding-left: 35px;
                                padding-right: 35px;
                                margin: 0;
                                opacity: 0.65;
                              "
                            >
                              MoonCode
                              <span class="rights">batat</span>,&nbsp;All rights
                              reserved
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
  <script defer>
    const dateSpan = document.querySelector(".rights");
    const currentYear = new Date().getFullYear();
    dateSpan.textContent = currentYear;
  </script>
</html>
`;
};

export default getEmailBody;
