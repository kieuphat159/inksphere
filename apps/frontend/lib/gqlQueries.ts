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