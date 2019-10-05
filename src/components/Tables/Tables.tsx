import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';
import { Link } from 'react-router-dom'

import TitleModal, { TableProps } from './TitleModal';
import { Preloader, Button, Modal } from '../ui';

import { translation } from '../../utils';
import graph from '../../graph';

import TrashCan from '../../images/icons/trash.svg'
import DuplicateIcon from '../../images/icons/duplicate.svg'
import EditIcon from '../../images/icons/edit.svg'

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: 500px;
  width: 100%;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 5px rgba(0,0,0,.1);
`;

const Table = styled.table`
  width: 100%;
  text-align: center;
  border-spacing: 0;
`

const TableHeader = styled.thead`
  
`

const TableBody = styled.tbody`

`

const TableRow = styled.tr`
  &:hover {
    background-color: rgba(0,0,0,.02);
    cursor: pointer;
  }

  &:last-of-type td {
    border: none;
  }
`

interface CellProps {
  alignLeft?: boolean;
}

const TableCell = styled.td<CellProps>`
  border-bottom: 1px solid #f2f2f2;

  &:first-of-type {
    width: 30px;
  }
  
  &:last-of-type {
    padding-right: 10px;
  }
  
  ${({ alignLeft }): string => alignLeft && 'text-align: left;'}
`

const TableHead = styled(TableCell).attrs(() => ({
  as: 'th',
}))`
  padding: 15px;
  font-weight: 500;
`

const TableLink = styled(Link)`
  display: block;
  padding: 15px;
  color: #000;
`

const TableTitleLink = styled(TableLink)`
  max-width: 280px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`

const NewTableButton = styled(Button.default).attrs(() => ({
  color: 'green'
}))`
  display: block;
  margin: 100px auto;
`

const refetchQueries = [{ query: graph.GetUser }]

function Tables(): React.ReactElement {
  const [deletingTable, setDeletingTable] = useState(null)
  const [editingTable, setEditingTable] = useState<TableProps | string>('')

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
    <Container>
      <Table>
        <TableHeader>
          <tr>
            <TableHead>№</TableHead>
            <TableHead alignLeft>{translation('tableName')}</TableHead>
            {/* <TableHead>{translation('classes')}</TableHead> */}
            {/* <TableHead>{translation('teachers')}</TableHead> */}
            <TableHead>{translation('lastModified')}</TableHead>
            <TableHead>{translation('created')}</TableHead>
            <TableHead />
          </tr>
        </TableHeader>
        <TableBody>
          {user?.tables.map(({ id, slug, title, created, lastModified }, index) => (
            <TableRow key={id}>
              <TableCell>
                <TableLink to={`/cedvel/${slug}`}>{index + 1}</TableLink>
              </TableCell>
              <TableCell alignLeft>
                <TableTitleLink to={`/cedvel/${slug}`}>
                  {title}
                </TableTitleLink>
              </TableCell>
              <TableCell>
                <TableLink to={`/cedvel/${slug}`}>
                  {lastModified}
                </TableLink>
              </TableCell>
              <TableCell>
                <TableLink to={`/cedvel/${slug}`}>
                  {created}
                </TableLink>
              </TableCell>
              <TableCell>
                <Button.Icon onClick={(): void => setEditingTable({ id, title })} src={EditIcon} />
                <Button.Icon onClick={(): void => duplicateTable(id)} src={DuplicateIcon} />
                <Button.Icon onClick={(): void => setDeletingTable({ id, title })} src={TrashCan} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <NewTableButton onClick={(): void => setEditingTable('new')}>
        {translation('addNewTable')}
      </NewTableButton>
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
    </Container>
  );
}

export default React.memo(Tables);
