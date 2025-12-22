"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

const SubmitButton = ({ children, ...props} : ButtonProps) => {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" {...props} aria-disabled={pending}>
            {pending ? <span className="animate-pulse">Submitting...</span> : children}
        </Button>
    );
} 

export default SubmitButton;