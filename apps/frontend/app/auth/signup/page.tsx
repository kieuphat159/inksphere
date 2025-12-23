import Link from "next/link";
import SignUpForm from "./_components/signUpForm";

const SignUpPage = () => {
    return (
        <div className="bg-white p-8 rounded-md shadow-md w-96 flex flex-col justify-center items-center">
            <h2 className="text-center text-2xl font-bold mt-8 mb-4">Sign Up Page</h2>
                {/* signup form */}
                <SignUpForm />
                <div>
                    <p>
                        Already have an account? 
                        <Link href="/auth/signin" className="underline">
                            Sign In
                        </Link>
                    </p>
                </div>
        </div>
    )
}

export default SignUpPage;