import gql from 'graphql-tag';

export const GET_POST = gql`
    query {
        posts {
            id
            title
            slug
            thumbnail
            content  
            createdAt  
        }
    }
`;