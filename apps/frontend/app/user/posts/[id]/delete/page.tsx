import { fetchPostById } from "@/lib/actions/postAction";
import DeletePostContainer from "./_components/DeletePostContainer";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ id: string }>;
};

const DeletePostPage = async (props: Props) => {
    const { id } = await props.params;
    const post = await fetchPostById(+id);

    if (!post) {
        notFound();
    }

    return <DeletePostContainer post={post} />;
};

export default DeletePostPage;
