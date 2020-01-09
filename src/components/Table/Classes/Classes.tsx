import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import styled from 'styled-components';

import graph from '../../../graph';
import { translation } from '../../../utils';

import EditModal from './EditModal';
import { TableRow } from '../Subjects/Subjects';
import { Table, Button, Modal, Selector as DefaultSelector } from '../../ui';
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

const Selector = styled(DefaultSelector).attrs(() => ({
  isClearable: false,
}))`
  margin-bottom: 20px;
`;

const CreateClassButton = styled(Button.Add)`
  margin-top: 20px;
  margin-bottom: 0;
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
  slug,
  id: tableId,
}: Props): React.ReactElement {
  const [modalClass, setModalClass] = useState<Class>(null);
  const [deletingClass, setDeletingClass] = useState<Class>(null);

  const [deleteClassRequest] = useMutation(graph.DeleteClass, {
    update(cache, { data: { deleteClass: classId } }) {
      console.log('cache :', cache.readQuery({ query: graph.GetTable }));
      if (cache.readQuery) {
        // const data = cache.readQuery({
        //   query: graph.GetTable,
        //   variables: { slug },
        // });
        // console.log('data :', data);
        // cache.writeQuery({
        //   query: graph.GetTable,
        //   data: {
        //     table: {
        //       ...table,
        //       classes: table.classes.filter(c => c.id !== classId),
        //     },
        //   },
        // });
      }
    },
  });
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
  }, [deletingClass]);

  const createClass = useCallback(() => {
    const data = {
      variables: {
        ...modalClass,
        tableId,
      },
    };

    if (modalClass.id === 'new') {
      createClassRequest(data);
    } else {
      updateClassRequest(data);
    }

    setModalClass(null);
  }, [modalClass]);

  const isModalReady =
    modalClass &&
    modalClass.sector &&
    modalClass.shift &&
    modalClass.letter &&
    modalClass.number;

  console.log('modalClass :', modalClass);

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
            {classes.map((theClass: Class, index: number) => {
              const { id, number, letter, shift } = theClass;
              const updateFn = (): void => setModalClass(theClass);

              return (
                <TableRow key={id}>
                  <Table.Cell onClick={updateFn}>{index + 1}</Table.Cell>
                  <Table.Cell align="left" onClick={updateFn}>
                    {number}
                    {letter}
                  </Table.Cell>
                  <Table.Cell onClick={updateFn}>{shift}</Table.Cell>
                  <Table.Cell>
                    <Button.Icon onClick={updateFn} src={EditIcon} />
                    <Button.Icon
                      onClick={(): void => setDeletingClass(theClass)}
                      src={TrashCan}
                    />
                  </Table.Cell>
                </TableRow>
              );
            })}
          </Table.Body>
        </Table.default>
      ) : null}
      <Button.Add onClick={(): void => setModalClass({ id: 'new' })}>
        {translation('addNewClass')}
      </Button.Add>

      {deletingClass && (
        <Modal.Confirm
          text={translation(
            'pleaseConfirmClassDelete',
            `${deletingClass.number}${deletingClass.letter}`,
          )}
          onClose={(): void => setDeletingClass(null)}
          onConfirm={deleteClass}
        />
      )}

      {modalClass && (
        <EditClassModal onClose={(): void => setModalClass(null)}>
          <Title>{translation('classInfo')}</Title>
          <ClassesContainer>
            <Selector
              placeholder={translation('class')}
              options={classesList}
              value={modalClass.number}
              onChange={(option): void => {
                setModalClass({
                  ...modalClass,
                  number: option?.value,
                });
              }}
            />
            <Selector
              placeholder={translation('letter')}
              options={letters}
              value={modalClass.letter}
              onChange={(option): void => {
                setModalClass({
                  ...modalClass,
                  letter: option?.value,
                });
              }}
            />
          </ClassesContainer>
          <Selector
            placeholder={translation('shift')}
            options={shifts}
            value={modalClass.shift}
            onChange={(option): void => {
              setModalClass({
                ...modalClass,
                shift: option?.value,
              });
            }}
          />
          <Selector
            placeholder={translation('sector')}
            options={sectors}
            value={modalClass.sector}
            onChange={(option): void => {
              setModalClass({
                ...modalClass,
                sector: option?.value,
              });
            }}
          />
          <ClassesContainer>
            <CreateClassButton disabled={!isModalReady} onClick={createClass}>
              {translation('save')}
            </CreateClassButton>
            {modalClass.id !== 'new' && (
              <CreateClassButton
                color="red"
                onClick={(): void => {
                  setModalClass(null);
                  setDeletingClass(modalClass);
                }}
              >
                {translation('delete')}
              </CreateClassButton>
            )}
          </ClassesContainer>
        </EditClassModal>
      )}
    </>
  );
}

export default React.memo(Classes);
