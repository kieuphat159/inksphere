"use client"

import { saveNewPost } from "@/lib/actions/postAction";
import { useActionState } from "react";
import UpsertPostForm from "./upsertPostForm";

const CreatePostContainer = () => {
    const [state, action] = useActionState(saveNewPost, undefined);
    return <UpsertPostForm state={state} formAction={action} />
}

export default CreatePostContainer;