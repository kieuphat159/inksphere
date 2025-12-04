import type { Post } from "@/lib/types/modelTypes";

type Props = {
    posts:  Post[];
}

export default function Post(props: Props) {
    return (
        <section>
            <h2 className="text-5xl font-bold text-center text-gray-600 leading-tight mt-5">
                Latest Posts
            </h2>
            <div className="h-1 mx-auto bg-gradient-to-r from-sky-500 to-indigo-500 w-96 mb-9 rounded-t-md">

            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                posts here
            </div>
        </section>
    )
};