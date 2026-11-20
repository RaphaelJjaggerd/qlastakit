// Dev-only component preview at /dev/components. In a production build
// import.meta.env.DEV is false, so the dynamic import is dropped (the preview code is not
// shipped) and the route answers 404.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Preview = import.meta.env.DEV ? lazy(() => import("../dev/component-preview")) : null;

export const Route = createFileRoute("/dev/components")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: () =>
    Preview ? (
      <Suspense fallback={null}>
        <Preview />
      </Suspense>
    ) : null,
});
