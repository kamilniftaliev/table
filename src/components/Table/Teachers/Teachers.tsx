import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';

import graph from '../../../graph';
import { translation } from '../../../utils';

import EditModal, { TeacherProps } from './EditModal';
import { TableRow } from '../Subjects/Subjects';
import { Table, Button, Modal, Preloader } from '../../ui';
import { Table as TableType, Teacher } from '../../../models';

import TrashCan from '../../../images/icons/trash.svg';
import EditIcon from '../../../images/icons/edit.svg';

interface Props {
  id: TableType['id'];
  teachers: Teacher[];
}

function Teachers({ id: tableId, teachers }: Props): React.ReactElement {
  const [editingTeacher, setEditingTeacher] = useState<TeacherProps>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<TeacherProps>(null);

  const [deleteTeacherRequest] = useMutation(graph.DeleteTeacher);

  useEffect(() => {
    document.title = translation('teachers');
    return (): void => {
      document.title = 'Table.az';
    };
  }, []);

  function deleteTeacher(): void {
    deleteTeacherRequest({
      variables: {
        id: deletingTeacher.id,
        tableId,
      },
    });

    setDeletingTeacher(null);
  }

  return (
    <>
      {teachers?.length ? (
        <Table.default>
          <Table.Header>
            <Table.Row>
              <Table.Head>№</Table.Head>
              <Table.Head align="left">{translation('teacherName')}</Table.Head>
              <Table.Head>{translation('workloadTitle')}</Table.Head>
              <Table.Head>{translation('workhoursTitle')}</Table.Head>
              <Table.Head>{translation('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teachers.map(
              (
                { id, name, workloadAmount, workhoursAmount }: Teacher,
                index: number,
              ) => {
                const link = `muellimler/${id}`;
                return (
                  <TableRow key={id}>
                    <Table.Cell link={link}>{index + 1}</Table.Cell>
                    <Table.Cell align="left" link={link}>
                      {name}
                    </Table.Cell>
                    <Table.Cell link={link}>
                      {`${workloadAmount} ${translation('hour')}`}
                    </Table.Cell>
                    <Table.Cell link={link}>
                      {`${workhoursAmount} ${translation('hour')}`}
                    </Table.Cell>
                    <Table.Cell>
                      <Button.Icon
                        onClick={(): void => setEditingTeacher({ id, name })}
                        src={EditIcon}
                      />
                      <Button.Icon
                        onClick={(): void => setDeletingTeacher({ id, name })}
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

      <Button.Add onClick={(): void => setEditingTeacher({ id: 'new' })}>
        {translation('addNewTeacher')}
      </Button.Add>

      {deletingTeacher && (
        <Modal.Confirm
          text={translation('pleaseConfirmTeacherDelete', deletingTeacher.name)}
          onClose={(): void => setDeletingTeacher(null)}
          onConfirm={(): void => deleteTeacher()}
        />
      )}

      {editingTeacher && (
        <EditModal
          tableId={tableId}
          teacher={editingTeacher}
          onClose={setEditingTeacher}
        />
      )}
    </>
  );
}

export default React.memo(Teachers);
