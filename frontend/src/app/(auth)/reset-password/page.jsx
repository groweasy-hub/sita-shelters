import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/password-recovery-forms.jsx";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
