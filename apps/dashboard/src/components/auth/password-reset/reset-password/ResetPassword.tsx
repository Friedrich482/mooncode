import usePageTitle from "@/hooks/usePageTitle";

import ResetPasswordForm from "./ResetPasswordForm";

const ResetPassword = () => {
  usePageTitle("Reset your password | Mooncode");

  return <ResetPasswordForm />;
};

export default ResetPassword;
