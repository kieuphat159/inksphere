import Link from "next/link";
import SignUpForm from "./_components/signUpForm";

const SignUpPage = () => {
    return (
        <div className="bg-card p-8 border border-border rounded-sm w-full max-w-sm flex flex-col justify-center items-stretch text-left">
            <h2 className="font-serif text-2xl font-bold tracking-tight mb-6 text-foreground text-center">
                Sign Up
            </h2>
            
            <SignUpForm />
            
            <div className="mt-8 pt-4 border-t border-border/40 text-center">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-foreground hover:underline underline-offset-4 font-bold">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default SignUpPage;