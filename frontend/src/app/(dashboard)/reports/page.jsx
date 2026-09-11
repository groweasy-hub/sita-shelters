import { Suspense } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import { ReportsScreen } from "@/features/reports";

export default function ReportsPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading reports" variant="page" />}>
      <ReportsScreen />
    </Suspense>
  );
}
