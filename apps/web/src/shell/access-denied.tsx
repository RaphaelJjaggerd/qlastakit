import { Button } from "@qlastakit/ui";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AccessDeniedError } from "../access";

export function AccessDenied() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mt-10 text-center">
        <h3 className="mb-2 title-display">{t("access.denied.title")}</h3>
        <p className="text-base">{t("access.denied.body")}</p>
      </div>
    </div>
  );
}

function GenericError({ reset }: Pick<ErrorComponentProps, "reset">) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mt-10 space-y-4 text-center">
        <h3 className="title-display">{t("error.title")}</h3>
        <p className="text-base">{t("error.body")}</p>
        <Button onClick={reset}>{t("error.retry")}</Button>
      </div>
    </div>
  );
}

/** The router's default error component: access denied gets its screen, the rest a translated one. */
export function RouteError(props: ErrorComponentProps) {
  if (props.error instanceof AccessDeniedError) return <AccessDenied />;
  return <GenericError reset={props.reset} />;
}
