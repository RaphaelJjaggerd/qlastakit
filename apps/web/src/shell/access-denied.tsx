import { ErrorComponent, type ErrorComponentProps } from "@tanstack/react-router";
import { AccessDeniedError } from "../access";
import { t } from "../i18n";

export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mt-10 text-center">
        <h3 className="mb-2 title-display">{t("access.denied.title")}</h3>
        <p className="text-base">{t("access.denied.body")}</p>
      </div>
    </div>
  );
}

/** The router's default error component: access denied gets its screen, the rest the default view. */
export function RouteError(props: ErrorComponentProps) {
  if (props.error instanceof AccessDeniedError) return <AccessDenied />;
  return <ErrorComponent {...props} />;
}
