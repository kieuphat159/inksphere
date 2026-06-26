import { Sign } from "crypto";
import Link from "next/link";
import SignInForm from "./_components/signInForm";
import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/lib/constants";

const SignInPage = () => {
    return (
        <div className="bg-card p-8 border border-border rounded-sm w-full max-w-sm flex flex-col justify-center items-stretch text-left">
            <h1 className="font-serif text-2xl font-bold tracking-tight mb-6 text-foreground text-center">
                Sign In
            </h1>
            
            <SignInForm />
            
            <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <span className="relative bg-card px-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Or
                </span>
            </div>

            <Button asChild variant="outline" className="w-full font-mono text-[11px] uppercase tracking-widest py-5 border-border hover:border-foreground/50 hover:bg-foreground hover:text-background transition-all duration-200">
                <a href={`${BACKEND_URL}/auth/google/login`}>Sign In with Google</a>
            </Button>

            <div className="mt-8 pt-4 border-t border-border/40 text-center">
                <Link href="/auth/signup" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline underline-offset-4">
                    Need an account? Sign Up
                </Link>
            </div>
        </div>
    )
}

export default SignInPage;