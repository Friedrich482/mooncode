import { useEffect } from "react";

import { displayAuthErrorSonner } from "@/features/auth/utils/display-auth-error-sonner";
import { AuthenticationMethods } from "@/features/profile/components/authentication-methods";
import { AvatarSection } from "@/features/profile/components/avatar-section";
import { CreateEmailUpdateForm } from "@/features/profile/components/create-email-update-form";
import { SomeStats } from "@/features/profile/components/some-stats";
import { UpdateUsernameForm } from "@/features/profile/components/update-username-form";
import { usePageTitle } from "@/hooks/use-page-title";

export const Profile = () => {
  usePageTitle("Profile | Mooncode");

  useEffect(() => {
    displayAuthErrorSonner();
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-y-4 pt-2 pr-14 pb-4 pl-1 max-md:pl-14">
      <AvatarSection />
      <UpdateUsernameForm />
      <CreateEmailUpdateForm />
      <AuthenticationMethods />
      <SomeStats />
    </main>
  );
};
