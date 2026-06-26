"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/submitButton";
import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";

const SignInForm = () => {
    const [state, action] = useActionState(signIn, undefined)
    return (
        <form action={action} className="flex flex-col gap-4">
            {!!state?.message && (
                <div className="p-3 border border-red-500 bg-red-500/10 text-red-600 rounded-sm text-xs font-mono">
                    {state.message}
                </div>
            )}
            
            <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Email Address
                </Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    className="border-border focus-visible:ring-foreground/10"
                />
                {!!state?.errors?.email && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.email}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Password
                </Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    className="border-border focus-visible:ring-foreground/10"
                />
                {!!state?.errors?.password && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.password}</p>
                )}
            </div>

            <SubmitButton className="mt-2 w-full font-mono text-[11px] uppercase tracking-widest py-5 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-sm">
                Sign In
            </SubmitButton>
        </form>
    )
}

export default SignInForm;