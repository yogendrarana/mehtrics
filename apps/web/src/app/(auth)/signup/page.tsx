"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { RegisterUserSchema } from "../_lib/validation";

import { Logo } from "@/components/logo";
import { authClient } from "@mehtrics/auth/client";
import { Button, Google, Input, Label, toastManager } from "@mehtrics/ui";


export default function Page() {
  const router = useRouter();

  const {
    state: { isSubmitting },
    handleSubmit,
    Field,
    Subscribe,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: RegisterUserSchema,
    },
    onSubmit: async ({ value }) => {
        await toastManager.promise(
          (async () => {
            const { error: signUpError } = await authClient.signUp.email({
              email: value.email,
              password: value.password,
              name: value.name,
              callbackURL: "/dashboard",
            });

            if (signUpError) {
              throw signUpError;
            }
          })(),
          {
            loading: {
              title: "Signing up...",
              description: "Please wait while we sign you up.",
            },
            success: {
              title: "Signed up successfully!",
              description: "You are now logged in.",
            },
            error: (err: any) => ({
              title: "Error signing up",
              description: err?.message ?? "Something went wrong. Please try again.",
            }),
          },
        );

        router.push("/dashboard");
        router.refresh();
    },
  });

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
        className="max-w-96 m-auto h-fit w-full"
      >
        <div className="space-y-4">
          <div>
            <Logo />
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Create a Account
            </h1>
            <p className="text-muted-foreground">
              Welcome! Create an account to get started
            </p>
          </div>

          {/* name */}
          <Field
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Full Name
                </Label>
                <Input
                  placeholder="John Doe"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  id={field.name}
                  disabled={isSubmitting}
                  className="bg-transparent"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <div className="space-y-1">
                    {field.state.meta.errors.map((err, i) =>
                      err ? (
                        <p key={i} className="text-xs text-destructive">
                          {typeof err === "string" ? err : (err as any).message}
                        </p>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            )}
          />

          {/* email */}
          <Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Email
                </Label>
                <Input
                  type="email"
                  name={field.name}
                  id={field.name}
                  placeholder="name@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-transparent"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <div className="space-y-1">
                    {field.state.meta.errors.map((err, i) =>
                      err ? (
                        <p key={i} className="text-xs text-destructive">
                          {typeof err === "string" ? err : (err as any).message}
                        </p>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            )}
          />

          {/* password */}
          <Field
            name="password"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  Password
                </Label>
                <Input
                  type="password"
                  id={field.name}
                  placeholder="***"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-transparent"
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <div className="space-y-1">
                    {field.state.meta.errors.map((err, i) =>
                      err ? (
                        <p key={i} className="text-xs text-destructive">
                          {typeof err === "string" ? err : (err as any).message}
                        </p>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            )}
          />

          {/* create account button */}
          <Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full h-11" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            )}
          />

          {/* separator */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">
              Or continue With
            </span>
            <hr className="border-dashed" />
          </div>

          {/* google sign in button */}
          <Button
            type="button"
            variant="secondary"
            className="w-full border border-border"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <Google />
            <span className="ml-2">Google</span>
          </Button>

          {/* sign in link */}
          <div className="text-accent-foreground text-center text-sm">
            Have an account?
            <Button variant="link" className="px-2">
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}


