import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function LogoutPage() {
  await auth.api.signOut({
    headers: await headers()
  });

  redirect('/');
}