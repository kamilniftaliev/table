import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-apollo';

import graph from '../../../graph';
import { translation } from '../../../utils';

import NewTeacherModal from './NewTeacherModal';
import { Table, Button, Modal } from '../../ui';
import { Table as TableType, Teacher } from '../../../models';

import TrashCan from '../../../images/icons/trash.svg';
interface Props {
  id: TableType['id'];
  teachers: Teacher[];
  slug: string;
}

function Teachers({ id: tableId, teachers, slug }: Props): React.ReactElement {
  const [showNewTeacherModal, setShowNewTeacherModal] = useState<boolean>(null);
  const [deletingTeacherIndex, setDeletingTeacherIndex] = useState<number>(
    null,
  );

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
        id: teachers[deletingTeacherIndex].id,
        tableId,
      },
      update(cache, { data: { deleteTeacher: teacherId } }) {
        const { table } = cache.readQuery({
          query: graph.GetTable,
          variables: { slug },
        });

        console.log('teacherId :', teacherId);

        cache.writeQuery({
          query: graph.GetTable,
          data: {
            table: {
              ...table,
              teachers: teachers.filter(t => t.id !== teacherId),
            },
          },
        });
      },
    });

    setDeletingTeacherIndex(null);
  }

  return (
    <>
      {teachers?.length ? (
        <Table.default>
          <Table.Header>
            <Table.Row>
              <Table.Head>№</Table.Head>
              <Table.Head align="left">{translation('teacherName')}</Table.Head>
              <Table.Head>{translation('subjects')}</Table.Head>
              <Table.Head>{translation('classes')}</Table.Head>
              <Table.Head>{translation('workloadTitle')}</Table.Head>
              <Table.Head>{translation('workhoursTitle')}</Table.Head>
              <Table.Head>{translation('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teachers.map(
              (
                {
                  id,
                  name,
                  workloadAmount = 0,
                  workhoursAmount = 0,
                  classes = 0,
                  subjects = 0,
                },
                index,
              ) => {
                const link = `muellimler/${id}`;
                return (
                  <Table.Row key={id}>
                    <Table.Cell link={link}>{index + 1}</Table.Cell>
                    <Table.Cell align="left" link={link}>
                      {name}
                    </Table.Cell>
                    <Table.Cell link={link}>
                      {translation('subjectCount', subjects)}
                    </Table.Cell>
                    <Table.Cell link={link}>
                      {translation('classCount', classes)}
                    </Table.Cell>
                    <Table.Cell link={link}>
                      {translation('hour', workloadAmount)}
                    </Table.Cell>
                    <Table.Cell link={link}>
                      {translation('hour', workhoursAmount)}
                    </Table.Cell>
                    <Table.Cell>
                      <Button.Icon
                        onClick={(): void => setDeletingTeacherIndex(index)}
                        src={TrashCan}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              },
            )}
          </Table.Body>
        </Table.default>
      ) : null}

      <Button.Add onClick={(): void => setShowNewTeacherModal(true)}>
        {translation('addNewTeacher')}
      </Button.Add>

      {deletingTeacherIndex && (
        <Modal.Confirm
          text={translation(
            'pleaseConfirmTeacherDelete',
            teachers[deletingTeacherIndex].name,
          )}
          onClose={(): void => setDeletingTeacherIndex(null)}
          onConfirm={(): void => deleteTeacher()}
        />
      )}

      {showNewTeacherModal && (
        <NewTeacherModal
          tableSlug={slug}
          tableId={tableId}
          onClose={setShowNewTeacherModal}
        />
      )}
    </>
  );
}

export default React.memo(Teachers);
