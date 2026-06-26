import CreatePostContainer from "./_components/createPostContainer";

const CreatePostPage = () => {
    return (
        <div className="bg-white rounded-md shadow-md p-6 w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-4 text-slate-700 text-center">
                Create a Post
            </h2>
            <CreatePostContainer />
        </div>
    )
}

export default CreatePostPage;