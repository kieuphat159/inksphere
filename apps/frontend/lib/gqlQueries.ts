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