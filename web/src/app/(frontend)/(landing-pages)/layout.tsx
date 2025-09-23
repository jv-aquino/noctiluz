import LandingPagesNav from "@/components/nav/InitialNav";
import Embarcar from "./Embarcar";
import { headers } from "next/headers";
import { auth } from "@/auth";
import Hero from "./Hero";
import Footer from "@/components/footer";
import { ReactNode } from "react";

export default async function Home({ children } : { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isLogged = !!session?.user;

  return (
    <div className="min-h-screen">
      <LandingPagesNav isLogged={isLogged} />
      
      {children}

      <Footer />
    </div>
  );
}