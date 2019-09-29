import {
  createGlobalStyle,
} from 'styled-components';

export const global = createGlobalStyle`
  body,
  input,
  button {
    font: 300 16px Roboto, Arial, sans-serif;
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    background-color: #f7f7f7;
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
