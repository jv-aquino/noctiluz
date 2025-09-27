import { headers } from "next/headers";
import { auth } from "@/auth";
import Hero from "./Hero";
import CTA from "./CTA";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isLogged = !!session?.user;

  return (
    <>
      <Hero />
      <CTA isLogged={isLogged}/>
    </>
  );
}