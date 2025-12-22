"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/submitButton";
import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";

const SignInForm = () => {
    const [state, action] = useActionState(signIn, undefined)
    return (
        <form action={action} className="flex flex-col gap-2">
            {!!state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    className="my-1"
                />
            </div>
            {!!state?.errors?.email && <p className="text-red-500 text-sm">{state.errors.email}</p>}

            <div>
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    className="my-1"
                />
            </div>
            {!!state?.errors?.password && <p className="text-red-500 text-sm">{state.errors.password}</p>}

            <SubmitButton className="">Sign In</SubmitButton>
        </form>
    )
}

export default SignInForm;