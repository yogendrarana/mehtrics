"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@mehtrics/auth/client";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@mehtrics/ui";

export default function WebSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/dashboard",
    });

    if (signUpError) {
      setError(signUpError.message ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)] px-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full h-11" disabled={loading}>
              {loading ? "Loading..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/auth/login" className="text-primary hover:underline">Login</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
