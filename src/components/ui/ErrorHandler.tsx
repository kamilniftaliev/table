import React, { Component } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
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
`;

interface InitState {
  hasError?: boolean;
}

interface Props {
  children: React.ReactElement;
}

class ErrorHandler extends Component<Props> {
  state: InitState = {};

  componentDidCatch(): void {
    // console.log('error :', error);
    // console.log('errorInfo :', errorInfo);
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
