"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loginSchema, signupSchema, type LoginValues, type SignupValues } from "@/lib/schemas";

/** Only follow redirects within this site. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

const NOT_CONFIGURED = "Accounts aren't set up yet. Add the Supabase keys to .env.local.";

export function AuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [formError, setFormError] = useState<string | null>(
    searchParams.get("error") === "confirm" ? "That confirmation link has expired. Log in or sign up again." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const signup = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  function done() {
    router.replace(next);
    router.refresh(); // re-render Server Components with the new session
  }

  const onLogin = login.handleSubmit(async ({ email, password }) => {
    setFormError(null);
    if (!isSupabaseConfigured) return setFormError(NOT_CONFIGURED);
    const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({ email, password });
    if (error) {
      setFormError(
        error.message === "Invalid login credentials" ? "That email and password don't match an account." : error.message,
      );
      return;
    }
    done();
  });

  const onSignup = signup.handleSubmit(async ({ name, email, password }) => {
    setFormError(null);
    if (!isSupabaseConfigured) return setFormError(NOT_CONFIGURED);
    const { data, error } = await getSupabaseBrowserClient().auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) return setFormError(error.message);
    // With email confirmation on, Supabase returns no session until the link is clicked.
    if (!data.session) return setNotice(`Check ${email} for a link to confirm your account.`);
    done();
  });

  return (
    <div className="mx-auto max-w-sm">
      <Tabs
        defaultValue="login"
        onValueChange={() => {
          setFormError(null);
          setNotice(null);
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="login">Log in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Your watchlist and picks are waiting.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={onLogin} noValidate aria-label="Log in">
                <div className="grid gap-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!login.formState.errors.email}
                    aria-describedby="login-email-error"
                    {...login.register("email")}
                  />
                  <FieldError id="login-email-error" message={login.formState.errors.email?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={!!login.formState.errors.password}
                    aria-describedby="login-password-error"
                    {...login.register("password")}
                  />
                  <FieldError id="login-password-error" message={login.formState.errors.password?.message} />
                </div>
                <Button type="submit" disabled={login.formState.isSubmitting}>
                  {login.formState.isSubmitting ? "Logging in…" : "Log in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Save films and get picks that learn what you like.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={onSignup} noValidate aria-label="Sign up">
                <div className="grid gap-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input id="signup-name" autoComplete="name" {...signup.register("name")} />
                  <FieldError id="signup-name-error" message={signup.formState.errors.name?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!signup.formState.errors.email}
                    aria-describedby="signup-email-error"
                    {...signup.register("email")}
                  />
                  <FieldError id="signup-email-error" message={signup.formState.errors.email?.message} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!signup.formState.errors.password}
                    aria-describedby="signup-password-error signup-password-hint"
                    {...signup.register("password")}
                  />
                  <p id="signup-password-hint" className="text-xs text-muted-foreground">
                    At least 8 characters.
                  </p>
                  <FieldError id="signup-password-error" message={signup.formState.errors.password?.message} />
                </div>
                <Button type="submit" disabled={signup.formState.isSubmitting}>
                  {signup.formState.isSubmitting ? "Creating account…" : "Sign up"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {formError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {formError}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {notice}
        </p>
      )}
    </div>
  );
}
