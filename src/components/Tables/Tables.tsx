import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';

import TitleModal, { TableProps } from './TitleModal';
import { Preloader, Button, Modal, Content, Table } from '../ui';

import { translation } from '../../utils';
import graph from '../../graph';

import TrashCan from '../../images/icons/trash.svg'
import DuplicateIcon from '../../images/icons/duplicate.svg'
import EditIcon from '../../images/icons/edit.svg'

const TitleCell = styled(Table.Cell)`
  max-width: 280px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const refetchQueries = [{ query: graph.GetUser }]

function Tables(): React.ReactElement {
  const [deletingTable, setDeletingTable] = useState(null)
  const [editingTable, setEditingTable] = useState<TableProps>(null)

  const { data, loading } = useQuery(graph.GetUser);
  const [deleteTableRequest] = useMutation(graph.DeleteTable)
  const [duplicateTableRequest] = useMutation(graph.DuplicateTable)
  
  if (loading) return <Preloader />;

  const { user } = data

  function deleteTable(): void {
    deleteTableRequest({
      variables: {
        id: deletingTable.id
      },
      refetchQueries,
    })    

    setDeletingTable(null)
  }

  function duplicateTable(id): void {
    duplicateTableRequest({
      variables: { id },
      refetchQueries,
    })
  }

  return (
    <Content>
      <Table.default>
        <Table.Header>
          <tr>
            <Table.Head>№</Table.Head>
            <Table.Head align="left">{translation('tableName')}</Table.Head>
            {/* <Table.Head>{translation('classes')}</Table.Head> */}
            {/* <Table.Head>{translation('teachers')}</Table.Head> */}
            <Table.Head>{translation('subjects')}</Table.Head>
            <Table.Head>{translation('lastModified')}</Table.Head>
            <Table.Head>{translation('created')}</Table.Head>
            <Table.Head>{translation('actions')}</Table.Head>
          </tr>
        </Table.Header>
        <Table.Body>
          {user?.tables.map(({ id, slug, title, created, subjectsCount, lastModified }, index) => {
            const link = `/cedvel/${slug}`
            return (
              <Table.Row key={id}>
                <Table.Cell link={link}>{index + 1}</Table.Cell>
                <TitleCell link={link} align="left">{title}</TitleCell>
                <Table.Cell link={link}>{subjectsCount}</Table.Cell>
                <Table.Cell link={link}>{lastModified}</Table.Cell>
                <Table.Cell link={link}>{created}</Table.Cell>
                <Table.Cell>
                  <Button.Icon onClick={(): void => setEditingTable({ id, title })} src={EditIcon} />
                  <Button.Icon onClick={(): void => duplicateTable(id)} src={DuplicateIcon} />
                  <Button.Icon onClick={(): void => setDeletingTable({ id, title })} src={TrashCan} />
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.default>
      <Button.Add onClick={(): void => setEditingTable({ id: 'new' })}>
        {translation('addNewTable')}
      </Button.Add>
      {deletingTable && (
        <Modal.Confirm
          text={translation('pleaseConfirmDelete', deletingTable.title)}
          onClose={(): void => setDeletingTable(null)}
          onConfirm={(): void => deleteTable()}
        />
      )}
      {editingTable && (
        <TitleModal
          table={editingTable}
          onClose={setEditingTable}
        />
      )}
    </Content>
  );
}

export default React.memo(Tables);
