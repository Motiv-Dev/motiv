export const runtime = "edge";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#faf9f7]">
      <SignUp
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-none border border-stone-200 rounded-2xl",
            headerTitle: "text-stone-900 font-bold",
            headerSubtitle: "text-stone-500",
            socialButtonsBlockButton: "rounded-xl border-stone-200",
            formFieldInput: "rounded-xl border-stone-200 focus:border-orange-400",
            formButtonPrimary: "bg-stone-900 hover:bg-stone-800 rounded-xl",
            footerActionLink: "text-orange-500 hover:text-orange-600",
          },
        }}
      />
    </div>
  );
}
