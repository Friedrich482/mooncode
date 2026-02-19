import { AvatarSection } from "@/features/profile/components/avatar-section";
import { UpdateUsernameForm } from "@/features/profile/components/update-username-form";
import { usePageTitle } from "@/hooks/use-page-title";

export const Profile = () => {
  usePageTitle("Profile | Mooncode");

  return (
    <main className="flex h-screen flex-1 flex-col gap-y-4 pt-2 pr-14 pb-4 pl-1 max-md:pl-14">
      <AvatarSection />
      <UpdateUsernameForm />
    </main>
  );
};
