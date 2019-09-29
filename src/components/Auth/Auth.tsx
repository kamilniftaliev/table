import React, { useState } from 'react';
import styled from 'styled-components';

import { Button, Messages, Input as DefaultInput } from '../ui';

import text from '../../utils/translations';

import { LOGIN } from '../../queries/user';
import { useMutation } from 'react-apollo';

const Container = styled.div``;

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

const Title = styled.h1`
  font-weight: 400;
  font-size: 42px;
  width: 500px;
  text-align: center;
  cursor: default;
  color: rgba(0, 0, 0, 0.8);
  text-shadow: 1px 1px white;
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
    <Container>
      <Title>{text('loginTitle')}</Title>
      <Form onSubmit={signIn}>
        {error?.graphQLErrors && <Messages.ErrorText>{text(error.graphQLErrors[0].message)}</Messages.ErrorText>}
        <Input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={text('username')}
        />
        <Input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={text('password')}
        />
        <Button type="submit">{text('signIn')}</Button>
      </Form>
    </Container>
  );
}

export default React.memo(Auth)