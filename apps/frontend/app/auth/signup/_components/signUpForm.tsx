"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/submitButton";
import { useActionState } from "react";
import { sign } from "crypto";
import { signUp } from "@/lib/actions/auth";

const  SignUpForm = () => {
    const [state, action] = useActionState(signUp, undefined);
    return (
        <form action={action} className="flex flex-col gap-4">
            {!!state?.message && (
                <div className="p-3 border border-red-500 bg-red-500/10 text-red-600 rounded-sm text-xs font-mono">
                    {state.message}
                </div>
            )}
            
            <div className="flex flex-col gap-1">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" className="border-border focus-visible:ring-foreground/10" defaultValue={state?.data.name}></Input>
                {!!state?.errors?.name && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.name}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input id="email" name="email" placeholder="john@example.com" className="border-border focus-visible:ring-foreground/10" defaultValue={state?.data.email}></Input>
                {!!state?.errors?.email && (
                    <p className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-1">{state.errors.email}</p>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                <Input id="password" name="password" type="password" className="border-border focus-visible:ring-foreground/10" defaultValue={state?.data.password}></Input>
                {!!state?.errors?.password && (
                    <div className="text-red-600 font-mono text-[10px] uppercase tracking-wider mt-2 p-3 bg-red-500/5 border border-red-500/20 rounded-sm">
                        <p className="font-bold mb-1">Password Requirements:</p>
                        <ul className="list-disc pl-4 space-y-1"> 
                            {state.errors.password.map(err => <li key={err}>{err}</li>)} 
                        </ul>
                    </div>
                )}
            </div>

            <SubmitButton className="mt-2 w-full font-mono text-[11px] uppercase tracking-widest py-5 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-sm">
                Sign Up
            </SubmitButton>
        </form>
    )
}

export default SignUpForm;