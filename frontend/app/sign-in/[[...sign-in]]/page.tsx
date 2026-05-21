import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#050a0d] flex items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#1d2224] border border-[rgba(68,73,51,0.3)]",
            headerTitle: "text-white",
            headerSubtitle: "text-[#c4c9ac]",
            socialButtonsBlock: "text-white",
            socialButtonsBlockButton: "border border-[rgba(68,73,51,0.3)] hover:bg-[rgba(210,240,50,0.1)]",
            dividerLine: "bg-[rgba(68,73,51,0.3)]",
            dividerText: "text-[#c4c9ac]",
            formFieldLabel: "text-[#c4c9ac]",
            formFieldInput: "bg-[#050a0d] border-[rgba(68,73,51,0.3)] text-white",
            formFieldHintText: "text-[#c4c9ac]",
            formButton: "bg-[#d2f032] text-[#2c3400] hover:opacity-90",
            footerActionLink: "text-[#d2f032] hover:text-[#c3f400]",
            footer: "text-[#c4c9ac]",
          }
        }}
        forceRedirectUrl="/"
      />
    </div>
  );
}
