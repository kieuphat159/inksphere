"use server";
import { fetchGraphQL } from "../fetchGraphQL";
import { SignUpFormState } from "../types/formState";
import { signUpFormSchema } from "../zodSchemas/signUpFormSchemas";
import { print } from "graphql";
import { CREATE_USER_MUTATION, SIGN_IN_MUTATION } from "../gqlQueries";
import { redirect } from "next/navigation";
import { LoginFormSchema } from "../zodSchemas/loginFormSchemas";
import { revalidatePath } from "next/cache";

export async function signUp(state: SignUpFormState, formData: FormData): Promise<SignUpFormState> {
    const validatedFields = signUpFormSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            data: Object.fromEntries(formData.entries()),
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }
    const data = await fetchGraphQL(print(CREATE_USER_MUTATION), {
        input: {
            ...validatedFields.data,
        }
    });
    if (data.errors) return {
        data: Object.fromEntries(formData.entries()),
        errors: {},
        message: "Something went wrong"
    };
    redirect('/auth/signin');
}

export async function signIn(state: SignUpFormState, formData: FormData): Promise<SignUpFormState> {
    const validatedFields = LoginFormSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            data: Object.fromEntries(formData.entries()),
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const data = await fetchGraphQL(print(SIGN_IN_MUTATION), {
        input: {
            ...validatedFields.data,
        }
    });

    if (data.errors) return {
        data: Object.fromEntries(formData.entries()),
        errors: {},
        message: "Something went wrong"
    }
    revalidatePath('/');
    redirect('/');
}