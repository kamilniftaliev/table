import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-apollo';

import graph from '../../../graph';
import { translation } from '../../../utils';

import EditModal from './EditModal';
import { TableRow } from '../Subjects/Subjects';
import { Table, Button, Modal, Preloader } from '../../ui';
import { Class, Teacher } from '../../../models';

import TrashCan from '../../../images/icons/trash.svg';
import EditIcon from '../../../images/icons/edit.svg';

interface Props {
  timetable: any;
  teachers: [Teacher];
  classes: [Class];
  id: string;
}

function Classes(table: Props): React.ReactElement {
  const { id: tableId } = table;
  const [editingClass, setEditingClass] = useState<Class>(null);
  const [deletingClass, setDeletingClass] = useState<Class>(null);

  const { data, loading } = useQuery(graph.GetClasses, {
    variables: { tableId },
  });
  const [deleteClassRequest] = useMutation(graph.DeleteClass);

  useEffect(() => {
    document.title = translation('classes');
    return (): void => {
      document.title = 'Table.az';
    };
  }, []);

  if (loading) return <Preloader isCentered />;

  function deleteClass(): void {
    deleteClassRequest({
      variables: {
        id: deletingClass.id,
        tableId,
      },
      refetchQueries: [
        { query: graph.GetClasses, variables: { tableId } },
        { query: graph.GetUser },
      ],
    });

    setDeletingClass(null);
  }

  const { classes } = data;

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
            {classes.map(({ id, title, shift }: Class, index: number) => {
              const updateFn = (): void => setEditingClass({ id, title });

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
            })}
          </Table.Body>
        </Table.default>
      ) : null}
      <Button.Add onClick={(): void => setEditingClass({ id: 'new' })}>
        {translation('addNewClass')}
      </Button.Add>

      {deletingClass && (
        <Modal.Confirm
          text={translation('pleaseConfirmClassDelete', deletingClass.title)}
          onClose={(): void => setDeletingClass(null)}
          onConfirm={(): void => deleteClass()}
        />
      )}

      {editingClass && (
        <EditModal
          tableId={tableId}
          class={editingClass}
          onClose={setEditingClass}
        />
      )}
    </>
  );
}

export default React.memo(Classes);
