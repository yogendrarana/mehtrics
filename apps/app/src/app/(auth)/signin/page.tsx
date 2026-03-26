"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { LoginUserSchema } from "../_lib/validation";

import { Logo } from "@/components/logo";
import { authClient } from "@mehtrics/auth";
import { Button } from "@mehtrics/ui/button";
import { Google } from "@mehtrics/ui/icons";
import { Input } from "@mehtrics/ui/input";
import { Label } from "@mehtrics/ui/label";
import { toastManager } from "@mehtrics/ui/toast";

export default function Page() {
  const router = useRouter();

  const {
    state: { isSubmitting },
    handleSubmit,
    Field,
    Subscribe,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: LoginUserSchema,
    },
    onSubmit: async ({ value }) => {
      const id = toastManager.add({
        type: "loading",
        title: "Signing in...",
        description: "Please wait while we sign you in.",
      });

      try {
        const { error: signInError } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          callbackURL: "/dashboard",
        });

        if (signInError) {
          throw signInError;
        }

        toastManager.update(id, {
          type: "success",
          title: "Signed in successfully!",
          description: "Welcome back!",
        });

        router.push("/dashboard");
        router.refresh();
      } catch (err: any) {
        toastManager.update(id, {
          type: "error",
          title: "Error signing in",
          description:
            err?.message ?? "Something went wrong. Please try again.",
        });
      }
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
            <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In</h1>
            <p className="text-muted-foreground">
              Welcome back! Please enter your details
            </p>
          </div>

          {/* email */}
          <Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
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
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <div className="space-y-1">
                      {field.state.meta.errors.map((err, i) =>
                        err ? (
                          <p key={i} className="text-xs text-destructive">
                            {typeof err === "string"
                              ? err
                              : (err as any).message}
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
                <Label htmlFor={field.name}>Password</Label>
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
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <div className="space-y-1">
                      {field.state.meta.errors.map((err, i) =>
                        err ? (
                          <p key={i} className="text-xs text-destructive">
                            {typeof err === "string"
                              ? err
                              : (err as any).message}
                          </p>
                        ) : null,
                      )}
                    </div>
                  )}
              </div>
            )}
          />

          {/* sign in button */}
          <Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full h-11"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
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

          {/* sign up link */}
          <div className="text-accent-foreground text-center text-sm">
            Don't have an account?
            <Button variant="link" className="px-2">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
