import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  padding-left: 20px;
  padding-right: 20px;

  text-align: center;
  background-color: #fff;
`;

const Text = styled.p`
  font-size: 20px;
  margin-bottom: 0;
`;

const Link = styled.a`
  color: blue;
  border-bottom: 1px solid blue;
  text-decoration: none;
`;

interface InitState {
  hasError?: boolean;
}

class ErrorHandler extends Component<React.ReactElement> {
  state: InitState = {};

  componentDidCatch(error, errorInfo): void {
    this.setState({ hasError: true });
  }

  render(): React.ReactNode {
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Container>
          <Text>Bu xəta üzərində artıq işləyirik</Text>
          <Text>Müvəqqəti narahatçılığa görə üzr istəyirik.</Text>
          <Text>
            <Link href="/">TABLE.AZ</Link>
          </Text>
        </Container>
      );
    }

    return children;
  }
}

export default React.memo(ErrorHandler);
