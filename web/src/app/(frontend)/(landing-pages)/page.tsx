import LandingPagesNav from "@/components/nav/InitialNav";
import Embarcar from "./Embarcar";
import { headers } from "next/headers";
import { auth } from "@/auth";
import Hero from "./Hero";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isLogged = !!session?.user;

  return (
    <div className="min-h-screen">
      <LandingPagesNav isLogged={isLogged} />
      
      <Hero />
      
      <Embarcar isLogged={isLogged} />
    </div>
  );
}