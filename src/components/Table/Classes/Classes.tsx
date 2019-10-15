import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';

import graph from '../../../graph';
import { translation } from '../../../utils';

import EditModal, { ClassProps } from './EditModal';
import { TableRow } from '../Subjects/Subjects';
import { Table, Button, Modal, Preloader } from '../../ui';

import TrashCan from '../../../images/icons/trash.svg'
import EditIcon from '../../../images/icons/edit.svg'

interface Props {
  timetable: any;
  teachers: any;
  classes: any;
}

function Classes(table: Props): React.ReactElement {
  const { id: tableId } = table;
  const [editingClass, setEditingClass] = useState<ClassProps>(null)
  const [deletingClass, setDeletingClass] = useState<ClassProps>(null)

  const { data, loading } = useQuery(graph.GetClasses, { variables: { tableId } });
  const [deleteClassRequest] = useMutation(graph.DeleteClass)

  if (loading) return <Preloader isCentered />

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
    })    

    setDeletingClass(null)
  }

  const { classes } = data

  return (
    <>
      {classes?.length ? (
        <Table.default>
          <Table.Header>
            <Table.Row>
              <Table.Head>№</Table.Head>
              <Table.Head align="left">{translation('classTitle')}</Table.Head>
              <Table.Head>{translation('isDivisibleByGroups')}</Table.Head>
              <Table.Head>{translation('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {classes.map(
              ({ id, title, isDivisible }: ClassProps, index: number) => {
                const updateFn = (): void => setEditingClass({ id, title })

                return (
                  <TableRow key={id}>
                    <Table.Cell onClick={updateFn}>{index + 1}</Table.Cell>
                    <Table.Cell align="left" onClick={updateFn}>{title}</Table.Cell>
                    <Table.Cell onClick={updateFn}>{isDivisible ? 'Bəli' : 'Xeyr'}</Table.Cell>
                    <Table.Cell>
                      <Button.Icon onClick={updateFn} src={EditIcon} />
                      <Button.Icon onClick={(): void => setDeletingClass({ id, title })} src={TrashCan} />
                    </Table.Cell>
                  </TableRow>
                )
              }
            )}
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