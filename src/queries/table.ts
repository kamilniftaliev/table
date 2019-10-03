import gql from 'graphql-tag';

export const CREATE = gql`
  mutation CreateTable($title: String!) {
    createTable(title: $title) {
      id,
      title,
      created,
      lastEdited,
      slug,
    }
  }
`;

export const DELETE = gql`
  mutation DeleteTable($id: ID!) {
    deleteTable(id: $id) {
      id
    }
  }
`;

export const DUPLICATE = gql`
  mutation DuplicateTable($id: ID!) {
    duplicateTable(id: $id) {
      id
    }
  }
`;