import gql from 'graphql-tag';

export const GET_POSTS = gql`
  query getPosts($cityId: Int, $dateId: Int) {
    posts(cityID: $cityId, dateID: $dateId) {
      id
      text
      date
      views
      city
    }
    cities {
      id
      title
    }
  }
`;

export default GET_POSTS;
