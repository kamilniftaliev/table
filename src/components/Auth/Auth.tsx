import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Domain, Button, Messages, Input as DefaultInput } from '../ui';

import { translation } from '../../utils';

import { LOGIN } from '../../queries/user';
import { useMutation } from 'react-apollo';

const CenteredDomain = styled(Domain)`
  display: block;
  font-size: 48px;
  margin-top: 100px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 250px;
  margin-left: auto;
  margin-right: auto;

  border-radius: 5px;
  padding: 25px;
  text-align: center;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Input = styled(DefaultInput)`
  margin-bottom: 15px;
`;

const Title = styled.h2`
  font-weight: 400;
  font-size: 28px;
  text-align: center;
  cursor: default;
  color: rgba(0, 0, 0, 0.8);
  text-shadow: 1px 1px white;

  margin-bottom: 40px;
`;

function setToken({ login: { token } }) {
  localStorage.setItem('token', token);
  location.reload();
}

function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, { loading, error }] = useMutation(LOGIN, {
    onCompleted: setToken,
  });

  function signIn(e: React.FormEvent) {
    e.preventDefault();

    if (loading || !username || !password) return;

    login({
      variables: {
        username,
        password,
      },
    });
  }

  return (
    <>
      <CenteredDomain />
      <Title>{translation('loginTitle')}</Title>
      <Form onSubmit={signIn}>
        {error?.graphQLErrors && <Messages.ErrorText>{translation(error.graphQLErrors[0].message)}</Messages.ErrorText>}
        <Input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={translation('username')}
        />
        <Input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={translation('password')}
        />
        <Button.default type="submit">{translation('signIn')}</Button.default>
      </Form>
    </>
  );
}

export default React.memo(Auth)