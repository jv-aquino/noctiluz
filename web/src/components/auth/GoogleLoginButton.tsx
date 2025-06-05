'use client'
import clsx from "clsx";
import Image from "next/image";
// import { useSearchParams } from "next/navigation";
import { isSafeRedirect } from "@/utils";

import { HTMLMotionProps } from "motion/react";
import BaseMotionButton from "../common/BaseMotionButton";
import { authClient } from "@/utils/auth-client";

type GoogleAuthButtonProps = HTMLMotionProps<"button"> & {
  className?: string;
  text?: string;
};

function GoogleAuthButton({ className, text, ...props }: GoogleAuthButtonProps) {
  // const searchParams = useSearchParams();
  // const callbackUrl = searchParams.get('callbackUrl') ?? "/";
  const callbackUrl = "/";
  const safeCallbackUrl = isSafeRedirect(callbackUrl) ? callbackUrl : "/";
  
  return ( 
      <div
        className={clsx("w-full flex-1", className)}
      >
        <input type="hidden" name="type" value="google" />

        <BaseMotionButton type="submit" className='login-button tracking-4' {...props}
        onClick={async () => {
          if (props.disabled) {
            return
          } 
          await authClient.signIn.social({
            provider: "google",
            callbackURL: safeCallbackUrl,
          });
        }}>
            <Image
              src={`/icons/google-logo.png`}
              alt={`Google logo`}
              width={24}
              height={24}
            />

          {text}
        </BaseMotionButton>
      </div>
    );
}

export default GoogleAuthButton;