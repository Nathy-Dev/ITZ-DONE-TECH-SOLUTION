import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen pt-20">
      <SignUp />
    </div>
  );
}
