import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';

import EditModal, { TableProps } from './EditModal';
import { Preloader, Button, Modal, Content, Table } from '../ui';

import { translation } from '../../utils';
import graph from '../../graph';

import TrashCan from '../../images/icons/trash.svg';
import DuplicateIcon from '../../images/icons/duplicate.svg';
import EditIcon from '../../images/icons/edit.svg';

const TitleCell = styled(Table.Cell)`
  max-width: 280px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const refetchQueries = [{ query: graph.GetUser }];

function Tables(): React.ReactElement {
  const [deletingTable, setDeletingTable] = useState(null);
  const [editingTable, setEditingTable] = useState<TableProps>(null);

  const { data, loading } = useQuery(graph.GetUser);
  const [deleteTableRequest] = useMutation(graph.DeleteTable);
  const [duplicateTableRequest] = useMutation(graph.DuplicateTable);

  if (loading) return <Preloader isCentered />;

  const { user } = data;

  function deleteTable(): void {
    deleteTableRequest({
      variables: {
        id: deletingTable.id,
      },
      update(cache, { data: { deleteTable: tableId } }) {
        const { user: userData } = cache.readQuery({ query: graph.GetUser });

        console.log('userData :', userData, tableId);

        cache.writeQuery({
          query: graph.GetUser,
          data: {
            user: {
              ...userData,
              tables: userData.tables.filter(t => t.id !== tableId),
            },
          },
        });
      },
    });

    setDeletingTable(null);
  }

  function duplicateTable(id): void {
    duplicateTableRequest({
      variables: { id },
      update(cache, { data: { duplicateTable: newTable } }) {
        const { user: userData } = cache.readQuery({ query: graph.GetUser });

        console.log('userData :', userData, newTable);

        cache.writeQuery({
          query: graph.GetUser,
          data: {
            user: {
              ...userData,
              tables: [
                ...userData.tables,
                {
                  ...userData.tables.find(t => t.id === id),
                  ...newTable,
                },
              ],
            },
          },
        });
      },
    });
  }

  return (
    <Content>
      <Table.default>
        <Table.Header>
          <tr>
            <Table.Head>№</Table.Head>
            <Table.Head align="left">{translation('tableName')}</Table.Head>
            <Table.Head>{translation('classes')}</Table.Head>
            <Table.Head>{translation('teachers')}</Table.Head>
            <Table.Head>{translation('lastModified')}</Table.Head>
            <Table.Head>{translation('created')}</Table.Head>
            <Table.Head>{translation('actions')}</Table.Head>
          </tr>
        </Table.Header>
        <Table.Body>
          {user?.tables.map(
            (
              {
                id,
                slug,
                title,
                created,
                subjectsCount,
                teachersCount,
                classesCount,
                lastModified,
              },
              index: number,
            ) => {
              const link = `/cedvel/${slug}`;
              return (
                <Table.Row key={id}>
                  <Table.Cell link={link}>{index + 1}</Table.Cell>
                  <TitleCell link={link} align="left">
                    {title}
                  </TitleCell>
                  <Table.Cell link={link}>{classesCount}</Table.Cell>
                  <Table.Cell link={link}>{teachersCount}</Table.Cell>
                  <Table.Cell link={link}>{lastModified}</Table.Cell>
                  <Table.Cell link={link}>{created}</Table.Cell>
                  <Table.Cell>
                    <Button.Icon
                      onClick={(): void => setEditingTable({ id, title })}
                      src={EditIcon}
                    />
                    <Button.Icon
                      onClick={(): void => duplicateTable(id)}
                      src={DuplicateIcon}
                    />
                    <Button.Icon
                      onClick={(): void => setDeletingTable({ id, title })}
                      src={TrashCan}
                    />
                  </Table.Cell>
                </Table.Row>
              );
            },
          )}
        </Table.Body>
      </Table.default>
      <Button.Add onClick={(): void => setEditingTable({ id: 'new' })}>
        {translation('addNewTable')}
      </Button.Add>
      {deletingTable && (
        <Modal.Confirm
          text={translation('pleaseConfirmTableDelete', deletingTable.title)}
          onClose={(): void => setDeletingTable(null)}
          onConfirm={(): void => deleteTable()}
        />
      )}
      {editingTable && (
        <EditModal table={editingTable} onClose={setEditingTable} />
      )}
    </Content>
  );
}

export default React.memo(Tables);
