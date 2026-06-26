import CreatePostContainer from "./_components/createPostContainer";

const CreatePostPage = () => {
    return (
        <div className="bg-card border border-border rounded-sm p-8 w-full max-w-2xl">
            <h2 className="font-serif text-2xl font-bold mb-6 text-foreground text-center">
                Create Post
            </h2>
            <CreatePostContainer />
        </div>
    )
}

export default CreatePostPage;