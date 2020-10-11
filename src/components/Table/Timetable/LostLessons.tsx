import React, { ReactElement } from 'react';
import styled from 'styled-components';

import { translation } from '../../../utils';

const Container = styled.section`
  display: inline-block;
  margin: 20px auto;
`;

const LostLessonsTitle = styled.h3`
  text-align: center;
  font-weight: 400;
  font-size: 26px;
`;

const LostLesson = styled.div`
  padding: 10px 16px;
  border-radius: 5px;
  background-color: #fff1f0;
  border: 1px solid #ffc5c1;
  margin-bottom: 15px;
`;

interface Props {
  lessons: object[];
}

export default function LostLessons({ lessons }: Props): ReactElement {
  return (
    <Container>
      <LostLessonsTitle>
        {translation('lostLessonsTitle', lessons.length)}
      </LostLessonsTitle>
      {lessons.map((lesson, index) => (
        <LostLesson>
          {`${index + 1}. ${translation('lostLesson', lesson)}`}
        </LostLesson>
      ))}
    </Container>
  );
}
