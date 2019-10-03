import gql from 'graphql-tag';

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
    }
  }
`;

export const GET = gql`
  {
    user {
      name,
      tables {
        id,
        slug,
        created,
        lastEdited,
        title,
      },
    }
  }
`;

export default LOGIN;
