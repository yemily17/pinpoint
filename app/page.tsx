"use client";

import Image from "next/image";
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { SignOutButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin } from "lucide-react";
import React from "react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/map");
    }
  }, [isSignedIn, router]);

  console.log(isSignedIn);

  return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center px-4 lg:px-6 h-14">
          <Link className="flex items-center justify-center" href="#">
          <img src="/icons/pinpointLogo.png" alt="PinPoint Logo" className="w-6 h-6 rounded-md" />
          <span className="ml-2 text-2xl font-bold">PinPoint</span>
          </Link>
          <nav className="flex gap-4 ml-auto sm:gap-6">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <Button >Sign In</Button>
              </SignInButton>
            ) : (
              <SignOutButton />
            )}
          </nav>
        </header>
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    PinPoint Your Community
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Discover local events, meet your neighbors, and stay updated
                    with what's happening around you.
                  </p>
                </div>
                <div className="space-x-4">
                  <Link href="/map">
                    <Button size="lg">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="flex items-center justify-left h-14 bg-white text-black p-4">
        <Link href="/privacy" className="text-sm font-small underline hover:text-gray-400">
          Privacy Policy
        </Link>
      </footer>
      </div>
  );
}
