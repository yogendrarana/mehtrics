import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignInForm } from "./__components/signin-form";

export default async function Page() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
