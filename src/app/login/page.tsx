import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForms } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForms />
    </Suspense>
  );
}
