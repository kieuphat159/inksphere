import UpdatePostContainer from "./_components/updatePostContainer";
import { fetchPostById } from "@/lib/actions/postAction";

type Props = {
    params: {
        id: string
    }
}

const UpdatePostPage = async (props: Props) => {
    const params = await props.params;
    const post = await fetchPostById(+params.id);
    return (
        <div className="bg-card border border-border rounded-sm p-8 w-full max-w-2xl">
            <h2 className="font-serif text-2xl font-bold mb-6 text-foreground text-center">
                Update Post
            </h2>
            <UpdatePostContainer post={post} />
        </div>
    )
}

export default UpdatePostPage;