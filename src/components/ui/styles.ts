import { createGlobalStyle } from 'styled-components';

export const global = createGlobalStyle`
  a,
  body,
  input,
  button,
  textarea,
  select,
  option,
  ul,
  li,
  p,
  span,
  div,
  header,
  section,
  footer,
  main {
    box-sizing: border-box;
  }

  body,
  input,
  button {
    font: 300 16px Roboto, Arial, sans-serif;
  }

  p,
  span,
  div {
    cursor: default;
  }
  
  body {
    margin: 0;
    background-color: #f5f9fa;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  button:focus,
  input:focus {
    outline: 0;
  }

  a {
    text-decoration: none;
  }
`;

export default global;
