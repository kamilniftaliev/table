import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';

import graph from '../../../graph';
import { translation } from '../../../utils';

import EditModal, { SubjectProps } from './EditModal';
import { Table, Button, Modal, Preloader } from '../../ui';

import TrashCan from '../../../images/icons/trash.svg'
import EditIcon from '../../../images/icons/edit.svg'

interface Props {
  timetable: any;
  teachers: any;
  subjects: any;
}

export const TableRow = styled(Table.Row)`
  cursor: pointer;
`;

function Subjects(table: Props): React.ReactElement {
  const { id: tableId } = table;
  const [editingSubject, setEditingSubject] = useState<SubjectProps>(null)
  const [deletingSubject, setDeletingSubject] = useState<SubjectProps>(null)

  const { data, loading } = useQuery(graph.GetSubjects, { variables: { tableId } });
  const [deleteSubjectRequest] = useMutation(graph.DeleteSubject)

  useEffect(() => {
    document.title = translation('subjects');
    return (): void => {
      document.title = 'Table.az';
    };
  }, []);

  if (loading) return <Preloader isCentered />

  function deleteSubject(): void {
    deleteSubjectRequest({
      variables: {
        id: deletingSubject.id,
        tableId,
      },
      refetchQueries: [
        { query: graph.GetSubjects, variables: { tableId } },
        { query: graph.GetUser },
      ],
    })    

    setDeletingSubject(null)
  }

  const { subjects } = data

  return (
    <>
      {subjects?.length ? (
        <Table.default>
          <Table.Header>
            <Table.Row>
              <Table.Head>№</Table.Head>
              <Table.Head align="left">{translation('subjectTitle')}</Table.Head>
              <Table.Head>{translation('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {subjects.map(
              ({ id, title }: SubjectProps, index: number) => {
                const updateFn = (): void => setEditingSubject({ id, title })

                return (
                  <TableRow key={id}>
                    <Table.Cell onClick={updateFn}>{index + 1}</Table.Cell>
                    <Table.Cell align="left" onClick={updateFn}>{title}</Table.Cell>
                    <Table.Cell>
                      <Button.Icon onClick={updateFn} src={EditIcon} />
                      <Button.Icon onClick={(): void => setDeletingSubject({ id, title })} src={TrashCan} />
                    </Table.Cell>
                  </TableRow>
                )
              }
            )}
          </Table.Body>
        </Table.default>
      ) : null}
      
      <Button.Add onClick={(): void => setEditingSubject({ id: 'new' })}>
        {translation('addNewSubject')}
      </Button.Add>

      {deletingSubject && (
        <Modal.Confirm
          text={translation('pleaseConfirmSubjectDelete', deletingSubject.title)}
          onClose={(): void => setDeletingSubject(null)}
          onConfirm={(): void => deleteSubject()}
        />
      )}

      {editingSubject && (
        <EditModal
          tableId={tableId}
          subject={editingSubject}
          onClose={setEditingSubject}
        />
      )}
    </>
  );
}

export default React.memo(Subjects);
