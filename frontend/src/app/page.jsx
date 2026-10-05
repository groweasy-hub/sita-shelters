"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/feedback";
import { useAuth } from "@/features/auth";

/**
 * Sends a fresh visit straight to the right place — signed out to /login,
 * signed in to /dashboard — deciding here instead of always redirecting to
 * /dashboard and letting its layout guard bounce back to /login afterward,
 * which showed /dashboard in the address bar even for a signed-out visitor.
 * Same client-side auth check as `(dashboard)/layout.jsx`, for the same
 * reason (see that file's comment on the cross-origin-cookie tradeoff).
 */
export default function HomePage() {
  const router = useRouter();
  const { data: user, isPending } = useAuth();

  useEffect(() => {
    if (!isPending) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [isPending, user, router]);

  return <LoadingState label="Loading" variant="page" />;
}
