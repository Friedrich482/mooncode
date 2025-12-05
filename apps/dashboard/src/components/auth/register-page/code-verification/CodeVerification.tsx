import usePageTitle from "@/hooks/usePageTitle";
import useParseStoredPendingRegistrationEmail from "@/hooks/useParseStoredPendingRegistrationEmail";

import CodeVerificationForm from "./CodeVerificationForm";

const CodeVerification = () => {
  usePageTitle("Register | Mooncode");

  const pendingRegistrationEmail = useParseStoredPendingRegistrationEmail();

  return (
    <CodeVerificationForm pendingRegistrationEmail={pendingRegistrationEmail} />
  );
};

export default CodeVerification;
