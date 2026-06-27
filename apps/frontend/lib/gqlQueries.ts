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
                id
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

export const CREATE_POST_MUTATION = gql`
    mutation createPost($input: CreatePostInput!) {
        createPost(createPostInput: $input) {
            id
        }
    }
`;

export const UPDATE_POST_MUTATION = gql`
    mutation updatePost($updatePostInput: UpdatePostInput!) {
        updatePost(updatePostInput: $updatePostInput) {
            id
        }
    }
`
export const DELETE_POST_MUTATION = gql`
    mutation deletePost($postId: Int!) {
        deletePost(postId: $postId)
    }
`;

export const GET_FRIENDS = gql`
    query friends {
        friends {
            id
            name
            email
            avatar
            bio
        }
    }
`;

export const GET_INCOMING_FRIEND_REQUESTS = gql`
    query incomingFriendRequests {
        incomingFriendRequests {
            id
            createdAt
            requester {
                id
                name
                email
                avatar
            }
        }
    }
`;

export const GET_OUTGOING_FRIEND_REQUESTS = gql`
    query outgoingFriendRequests {
        outgoingFriendRequests {
            id
            createdAt
            receiver {
                id
                name
                email
                avatar
            }
        }
    }
`;

export const SEARCH_USERS = gql`
    query searchUsers($query: String!, $take: Int) {
        searchUsers(query: $query, take: $take) {
            id
            name
            email
            avatar
            bio
        }
    }
`;

export const FRIENDSHIP_STATUS_QUERY = gql`
    query friendshipStatus($userId: Int!) {
        friendshipStatus(userId: $userId) {
            status
            friendshipId
        }
    }
`;

export const SEND_FRIEND_REQUEST_MUTATION = gql`
    mutation sendFriendRequest($receiverId: Int!) {
        sendFriendRequest(receiverId: $receiverId) {
            id
            status
        }
    }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
    mutation acceptFriendRequest($friendshipId: Int!) {
        acceptFriendRequest(friendshipId: $friendshipId) {
            id
            status
        }
    }
`;

export const REJECT_FRIEND_REQUEST_MUTATION = gql`
    mutation rejectFriendRequest($friendshipId: Int!) {
        rejectFriendRequest(friendshipId: $friendshipId)
    }
`;

export const CANCEL_FRIEND_REQUEST_MUTATION = gql`
    mutation cancelFriendRequest($friendshipId: Int!) {
        cancelFriendRequest(friendshipId: $friendshipId)
    }
`;

export const REMOVE_FRIEND_MUTATION = gql`
    mutation removeFriend($friendId: Int!) {
        removeFriend(friendId: $friendId)
    }
`;