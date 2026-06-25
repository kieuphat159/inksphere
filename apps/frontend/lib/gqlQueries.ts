import gql from 'graphql-tag';

export const GET_POST = gql`
    query posts( $skip: Float, $take: Float ) {
        posts( skip: $skip, take: $take ) {
            id
            title
            slug
            thumbnail
            content
            createdAt
        }
        postsCount
    }
`;

export const GET_POST_BY_ID = gql`
    query getPostById($id: Int!) {
        getPostById(id: $id) {
            id
            title
            thumbnail
            content
            createdAt
            author {
                name
            }
            tags {
                id
                name
            }
        }
    }
`;

export const CREATE_USER_MUTATION = gql`
    mutation createUser($input: CreateUserInput!) {
        createUser(createUserInput: $input) {
            id
        }
    }
`;

export const SIGN_IN_MUTATION = gql`
    mutation signin($input: SignInInput!) {
        signin(signInInput: $input) {
            id
            name
            avatar
            accessToken
        }
    }
`;

export const GET_POST_COMMENTS = gql`
    query getPostComments($postId: Int!, $take: Int, $skip: Int) {
        getPostComments(postId: $postId, take: $take, skip: $skip) {
            id
            content
            createdAt
            author {
                name
                avatar
            }
        }

        postCommentsCount(postId: $postId)
    }
`;

export const CREATE_COMMENT_MUTATION = gql`
    mutation createComment($input: CreateCommentInput!) {
        createComment(createCommentInput: $input) {
            id
        }
    }
`;

export const POST_LIKE_COUNT_QUERY = gql`
    query PostLikeCount($postId: Int!) {
        postLikeCount(postId: $postId)
    }
`;

export const USER_LIKED_POST_MUTATION = gql`
    mutation userLikedPost($postId: Int!) {
        userLikedPost(postId: $postId)
    }
`;

export const LIKE_POST_MUTATION = gql`
    mutation likePost($postId: Int!) {
        likePost(postId: $postId)
    }
`;

export const UNLIKE_POST_MUTATION = gql`
    mutation unlikePost($postId: Int!) {
        unlikePost(postId: $postId)
    }
`;

export const GET_USER_POSTS = gql`
    query getUserPosts($skip: Int, $take: Int) {
        getUserPosts(skip: $skip, take: $take) {
            id
            content
            createdAt
            published
            slug
            title
            thumbnail
            _count {
                comments
                likes
            }
        }
        userPostsCount
    }
`;
