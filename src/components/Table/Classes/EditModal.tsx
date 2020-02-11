import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import styled from 'styled-components';

import { Button, Modal, Selector as DefaultSelector } from '../../ui';
import { Class } from '../../../models';

import { translation, constants, classesSortFn } from '../../../utils';
import graph from '../../../graph';

const EditClassModal = styled(Modal.default)`
  width: 300px;
  padding: 50px 70px;
`;

const Title = styled.p`
  font-size: 20px;
  font-weight: 400;
  margin-top: 0;
  text-align: center;
`;

const ClassesContainer = styled.div`
  display: flex;
  justify-content: space-between;

  & > div {
    flex-basis: 45%;
  }
`;

const Selector = styled(DefaultSelector).attrs(() => ({
  isClearable: false,
}))`
  margin-bottom: 20px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
`;

const CreateClassButton = styled(Button.Add)`
  margin: 0;
`;

const letters = constants.letters.map(letter => ({
  value: letter,
  label: letter,
}));

interface Props {
  slug: string;
  classIndex: number;
  onClose: () => void;
  onDeleteClick: React.Dispatch<React.SetStateAction<Class>>;
  classes: Class[];
}

function EditModal({
  classIndex,
  slug,
  onClose,
  onDeleteClick,
  classes,
}: Props): React.ReactElement {
  const { data, loading: loadingTable } = useQuery(graph.GetTable, {
    variables: { slug },
  });

  const isNewClass = classIndex === -1;
  const theClass = isNewClass ? { shift: 1 } : data?.table.classes[classIndex];

  const [modalClass, setModalClass] = useState<Class>(theClass);

  const [updateClassRequest] = useMutation(graph.UpdateClass);
  const [createClassRequest] = useMutation(graph.CreateClass, {
    update(cache, { data: { createClass: newClass } }) {
      const { table } = cache.readQuery({
        query: graph.GetTable,
        variables: { slug },
      });

      cache.writeQuery({
        query: graph.GetTable,
        data: {
          table: {
            ...table,
            classes: [
              ...table.classes.sort(classesSortFn),
              {
                ...newClass,
                teachers: 0,
                subjects: 0,
                lessons: 0,
              },
            ],
          },
        },
      });

      // Scroll down
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 300);
    },
  });

  const createClass = useCallback(() => {
    const query = {
      variables: {
        ...modalClass,
        tableId: data?.table.id,
      },
    };

    if (isNewClass) {
      createClassRequest(query);
    } else {
      updateClassRequest(query);
    }

    onClose();
  }, [modalClass]);

  if (loadingTable) return null;

  const isModalFilled =
    modalClass &&
    modalClass.sector &&
    modalClass.shift &&
    modalClass.letter &&
    modalClass.number;

  return (
    <EditClassModal onClose={onClose}>
      <Title>{translation('classInfo')}</Title>
      <ClassesContainer>
        <Selector
          placeholder={translation('class')}
          options={constants.classes}
          value={modalClass.number}
          onChange={(number): void => {
            setModalClass({
              ...modalClass,
              number,
            });
            const classNumberExists = classes.find(c => c.number === number);
            let letterChoiceIndex = 0;

            if (classNumberExists) {
              const foundClassLetterIndex = constants.letters.indexOf(
                classNumberExists.letter,
              );
              if (foundClassLetterIndex !== 0) {
                letterChoiceIndex = 0;
              } else {
                const lastFoundClass = classes
                  .reverse()
                  .find(c => c.number === number);
                const lastFoundClassLetterIndex = constants.letters.indexOf(
                  lastFoundClass.letter,
                );
                letterChoiceIndex = lastFoundClassLetterIndex + 1;
              }
            }

            setModalClass({
              ...modalClass,
              number,
              letter: constants.letters[letterChoiceIndex],
            });
          }}
        />
        <Selector
          placeholder={translation('letter')}
          options={letters}
          value={modalClass.letter}
          onChange={(letter): void => {
            setModalClass({
              ...modalClass,
              letter,
            });
          }}
        />
      </ClassesContainer>
      <Selector
        placeholder={translation('shift')}
        options={constants.shifts}
        value={modalClass.shift}
        useSwitcherForOptionsCount={3}
        onChange={(shift): void => {
          setModalClass({
            ...modalClass,
            shift,
          });
        }}
      />
      <Selector
        placeholder={translation('sector')}
        options={constants.sectors}
        value={modalClass.sector}
        useSwitcherForOptionsCount={3}
        onChange={(sector): void => {
          setModalClass({
            ...modalClass,
            sector,
          });
        }}
      />
      <ActionButtonsContainer>
        <CreateClassButton disabled={!isModalFilled} onClick={createClass}>
          {translation('save')}
        </CreateClassButton>
        {!isNewClass && (
          <CreateClassButton
            color="red"
            onClick={(): void => {
              onClose();
              onDeleteClick(modalClass);
            }}
          >
            {translation('delete')}
          </CreateClassButton>
        )}
      </ActionButtonsContainer>
    </EditClassModal>
  );
}

export default React.memo(EditModal);
