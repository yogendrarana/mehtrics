import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignUpForm } from "./__components/signup-form";

export default async function Page() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <SignUpForm />;
}
