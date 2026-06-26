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
        <div className="bg-white rounded-md shadow-md p-6 w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-4 text-slate-700 text-center">
                Update Post
            </h2>
            <UpdatePostContainer post={post} />
        </div>
    )
}

export default UpdatePostPage;