import DesktopClientWrapper from "@/components/DesktopClientWrapper";
import { getProfile } from "@/app/actions/user";

export default async function DesktopLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <DesktopClientWrapper initialProfile={profile}>
      {children}
    </DesktopClientWrapper>
  );
}
