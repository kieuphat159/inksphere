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
`

export const CREATE_USER_MUTATION = gql`
    mutation createUser($input: CreateUserInput!) {
        createUser(createUserInput: $input) { 
            id
        }
    }
`

export const SIGN_IN_MUTATION = gql`
    mutation signin($input: SignInInput!) {
        signin(signInInput: $input) {
            id
            name
            avatar
            accessToken
        }
    }
`