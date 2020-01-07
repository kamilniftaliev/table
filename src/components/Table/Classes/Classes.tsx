import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import styled from 'styled-components';

import graph from '../../../graph';
import { translation } from '../../../utils';

import EditModal from './EditModal';
import { TableRow } from '../Subjects/Subjects';
import { Table, Button, Modal, Selector } from '../../ui';
import { Class, Teacher } from '../../../models';

import TrashCan from '../../../images/icons/trash.svg';
import EditIcon from '../../../images/icons/edit.svg';

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

interface Props {
  table: object;
}

const shifts = [
  {
    value: 1,
    label: 1,
  },
  {
    value: 2,
    label: 2,
  },
];

const classesList = [
  { value: 1, label: 1 },
  { value: 2, label: 2 },
  { value: 3, label: 3 },
  { value: 4, label: 4 },
  { value: 5, label: 5 },
  { value: 6, label: 6 },
  { value: 7, label: 7 },
  { value: 8, label: 8 },
  { value: 9, label: 9 },
  { value: 10, label: 10 },
  { value: 11, label: 11 },
];

const letters = [
  'a',
  'b',
  'c',
  'ç',
  'd',
  'e',
  'ə',
  'f',
  'g',
  'ğ',
  'h',
  'x',
  'ı',
  'i',
  'j',
  'k',
  'q',
  'l',
  'm',
  'n',
  'n',
  'o',
  'ö',
  'p',
  'r',
  's',
  'ş',
  't',
  'u',
  'ü',
  'v',
  'y',
  'z',
].map(letter => ({
  value: letter,
  label: letter,
}));

const sectors = [
  {
    value: 'az',
    label: translation('az'),
  },
  {
    value: 'ru',
    label: translation('ru'),
  },
];

function Classes({
  classes,
  subjects, // @TODO How many subjects in a class
  teachers, // @TODO how many teachers have workload in a class
  id: tableId,
}: Props): React.ReactElement {
  const [modalClass, setModalClass] = useState<Class>(null);
  const [deletingClass, setDeletingClass] = useState<Class>(null);

  const [deleteClassRequest] = useMutation(graph.DeleteClass);
  const [createClassRequest] = useMutation(graph.CreateClass);
  const [updateClassRequest] = useMutation(graph.UpdateClass);

  useEffect(() => {
    document.title = translation('classes');
    return (): void => {
      document.title = 'Table.az';
    };
  }, []);

  const deleteClass = useCallback(() => {
    deleteClassRequest({
      variables: {
        id: deletingClass.id,
        tableId,
      },
    });

    setDeletingClass(null);
  }, [modalClass]);

  const createClass = useCallback(() => {
    const variables = {
      ...modalClass,
      tableId,
    };

    console.log('variables :', variables);

    if (modalClass.id === 'new') {
      createClassRequest({ variables });
    } else {
      updateClassRequest({ variables });
    }

    setDeletingClass(null);
  }, [modalClass]);

  return (
    <>
      {classes?.length ? (
        <Table.default>
          <Table.Header>
            <Table.Row>
              <Table.Head>№</Table.Head>
              <Table.Head align="left">{translation('classTitle')}</Table.Head>
              <Table.Head>{translation('shift')}</Table.Head>
              <Table.Head>{translation('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {classes.map(
              ({ id, number, letter, shift }: Class, index: number) => {
                const title = `${number}${letter}`;
                const updateFn = (): void => setModalClass({ id, title });

                return (
                  <TableRow key={id}>
                    <Table.Cell onClick={updateFn}>{index + 1}</Table.Cell>
                    <Table.Cell align="left" onClick={updateFn}>
                      {title}
                    </Table.Cell>
                    <Table.Cell onClick={updateFn}>{shift}</Table.Cell>
                    <Table.Cell>
                      <Button.Icon onClick={updateFn} src={EditIcon} />
                      <Button.Icon
                        onClick={(): void => setDeletingClass({ id, title })}
                        src={TrashCan}
                      />
                    </Table.Cell>
                  </TableRow>
                );
              },
            )}
          </Table.Body>
        </Table.default>
      ) : null}
      <Button.Add onClick={(): void => setModalClass({ id: 'new' })}>
        {translation('addNewClass')}
      </Button.Add>

      {deletingClass && (
        <Modal.Confirm
          text={translation('pleaseConfirmClassDelete', deletingClass.title)}
          onClose={(): void => setDeletingClass(null)}
          onConfirm={(): void => deleteClass()}
        />
      )}

      {modalClass && (
        <EditClassModal
          onClose={(): void => setModalClass(null)}
          steps={[
            (nextStep): React.ReactElement => (
              <>
                <Title>{translation('selectClass')}</Title>
                <ClassesContainer>
                  <Selector
                    key="0"
                    placeholder={translation('class')}
                    options={classesList}
                    onChange={({ value: number }): void => {
                      setModalClass({
                        ...modalClass,
                        number,
                      });
                    }}
                  />
                  <Selector
                    key="1"
                    placeholder={translation('letter')}
                    options={letters}
                    onChange={({ value: letter }): void => {
                      setModalClass({
                        ...modalClass,
                        letter,
                      });
                      nextStep();
                    }}
                  />
                </ClassesContainer>
              </>
            ),
            (nextStep): React.ReactElement => (
              <>
                <Title>{translation('shift')}</Title>
                <Selector
                  key="2"
                  placeholder={translation('shift')}
                  options={shifts}
                  onChange={({ value: shift }): void => {
                    setModalClass({
                      ...modalClass,
                      shift,
                    });
                    nextStep();
                  }}
                />
              </>
            ),
            (nextStep): React.ReactElement => (
              <>
                <Title>{translation('selectSector')}</Title>
                <Selector
                  key="3"
                  placeholder={translation('sector')}
                  options={sectors}
                  onChange={({ value: sector }): void => {
                    setModalClass({
                      ...modalClass,
                      sector,
                    });
                    setTimeout(() => {
                      createClass();
                      nextStep();
                    }, 500);
                  }}
                />
              </>
            ),
          ]}
        />
      )}
    </>
  );
}

export default React.memo(Classes);
