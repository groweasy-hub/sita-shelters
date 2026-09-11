import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { RouteAccessGuard } from "@/components/layout/route-access-guard";
import { PreferencesEffects } from "@/features/preferences";
import { getSessionUser } from "@/lib/session";
import { SessionProvider } from "@/lib/session-provider";

export default async function ApplicationLayout({ children }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <SessionProvider userId={user.id}>
      <PreferencesEffects />
      <AppShell>
        <RouteAccessGuard>{children}</RouteAccessGuard>
      </AppShell>
    </SessionProvider>
  );
}
