import { SignIn } from "@clerk/nextjs";
import React from "react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="font-semibold text-4xl">Bentornato! 👋</h1>
      <p className="text-xl">Accedi per continuare al tuo account</p>

      <SignIn 
        appearance={{
          elements: {
            socialButtonsBlockButton: {
              display: "none"
            },
            socialButtons: {
              display: "none"
            },
            dividerRow: {
              display: "none"
            }
          }
        }}
      />
    </div>
  );
}
