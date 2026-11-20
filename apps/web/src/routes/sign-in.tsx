// Placeholder until 2.4a replaces it with the real sign-in form.
import { Button } from "@qlastakit/ui";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { appConfig } from "@/config/app.config";
import { t } from "@/i18n";

export const Route = createFileRoute("/sign-in")({
  staticData: { key: "sign-in", layout: "auth-side" },
  // Already signed in: nothing to do here.
  beforeLoad: ({ context }) => {
    if (context.session) throw redirect({ to: appConfig.authenticatedEntryPath });
  },
  component: SignIn,
});

function SignIn() {
  const router = useRouter();
  async function signIn() {
    await router.options.context.sessionSource.signIn();
    await router.invalidate();
    await router.navigate({ to: appConfig.authenticatedEntryPath });
  }
  return (
    <div className="space-y-4">
      <h1 className="title-display">{t("auth.signIn.title")}</h1>
      <p className="text-muted-foreground">{t("auth.signIn.body")}</p>
      <Button onClick={signIn}>{t("auth.signIn.continue")}</Button>
    </div>
  );
}
