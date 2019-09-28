import {
  createGlobalStyle,
} from 'styled-components';

export const global = createGlobalStyle`
  body,
  input,
  button {
    font-family: Roboto, Arial, sans-serif;
    font-weight: 300;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    background-color: #f7f7f7;
    font-size: 14px;
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
`;
