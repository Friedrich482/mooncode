import usePageTitle from "@/hooks/usePageTitle";

import CodeVerificationForm from "./CodeVerificationForm";

const CodeVerification = () => {
  usePageTitle("Verify Reset Code | Mooncode");

  return <CodeVerificationForm />;
};

export default CodeVerification;
