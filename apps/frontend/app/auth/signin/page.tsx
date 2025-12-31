import { Sign } from "crypto";
import Link from "next/link";
import SignInForm from "./_components/signInForm";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/lib/constants";

const SignInPage = () => {
    return (
        <div className="bg-white p-8 border rounded-md shadow-md w-96 flex flex-col justify-center items-center">
            <h1 className="text-center text-2xl font-bold mb-4">Sign In Page</h1>
            {/* signin form */}
            <SignInForm />
            <Link href="/auth/signup" className="underline">
                Don't have an account? Sign Up
            </Link>
            <Button>
                <a href={`${BACKEND_URL}/auth/google/login`}>Sign In with Google</a>
            </Button>
        </div>
    )
}

export default SignInPage;