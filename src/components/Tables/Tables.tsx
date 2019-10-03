import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';
import { Link } from 'react-router-dom'

import { Preloader, Button, Modal, Input } from '../ui';

import { translation } from '../../utils';
import { USER, TABLE } from '../../queries';

import TrashCan from '../../images/icons/trash.svg'
import DuplicateIcon from '../../images/icons/duplicate.svg'

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

const TableCell = styled.td`
  border-bottom: 1px solid #f2f2f2;

  &:first-of-type {
    width: 30px;
  }
  
  ${({ alignLeft }) => alignLeft && 'text-align: left;'}
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

const NewTableButton = styled(Button.default).attrs(() => ({
  color: 'green'
}))`
  display: block;
  margin: 100px auto;
`

const NewTableInputText = styled.p`
  text-align: center;
  font-size: 22px;
  font-weight: 400;
`

const NewTableInput = styled(Input)`
  width: 400px;
`

const refetchQueries = [{ query: USER.GET }]

function Tables() {
  const [isNewTableModalVisible, setIsNewTableModalVisible] = useState(false)
  const [newTableTitle, setNewTableTitle] = useState('')
  const [deletingTable, setDeletingTable] = useState(null)

  const { data: { user }, loading } = useQuery(USER.GET);
  const [createTableRequest] = useMutation(TABLE.CREATE)
  const [deleteTableRequest] = useMutation(TABLE.DELETE)
  const [duplicateTableRequest] = useMutation(TABLE.DUPLICATE)
  
  if (loading) return <Preloader />;

  function deleteTable() {
    deleteTableRequest({
      variables: {
        id: deletingTable.id
      },
      refetchQueries,
    })    

    setDeletingTable(null)
  }

  function createTable(e) {
    e.preventDefault()
    if (!newTableTitle) return

    createTableRequest({
      variables: {
        title: newTableTitle
      },
      refetchQueries
    })
    setIsNewTableModalVisible(false)
    setNewTableTitle('')
  }

  function duplicateTable(id) {
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
            <TableHead>{translation('lastEdited')}</TableHead>
            <TableHead>{translation('created')}</TableHead>
            <TableHead></TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {user?.tables.map(({ id, slug, title, created, lastEdited }, index) => (
            <TableRow key={id}>
              <TableCell>
                <TableLink to={`/table/${slug}`}>{index + 1}</TableLink>
              </TableCell>
              <TableCell alignLeft>
                <TableLink to={`/table/${slug}`}>
                  {title}
                </TableLink>
              </TableCell>
              <TableCell>
                <TableLink to={`/table/${slug}`}>
                {lastEdited}
                </TableLink>
              </TableCell>
              <TableCell>
                <TableLink to={`/table/${slug}`}>
                  {created}
                </TableLink>
              </TableCell>
              <TableCell>
                <Button.Icon onClick={() => duplicateTable(id)} src={DuplicateIcon} />
                <Button.Icon onClick={() => setDeletingTable({ id, title })} src={TrashCan} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <NewTableButton onClick={() => setIsNewTableModalVisible(true)}>{translation('addNewTable')}</NewTableButton>
      {deletingTable && (
        <Modal.Confirm
          text={translation('pleaseConfirmDelete', deletingTable.title)}
          onClose={() => void setDeletingTable(null)}
          onConfirm={() => void deleteTable()}
        />
      )}
      {isNewTableModalVisible && (
        <Modal.default
          onClose={() => void setIsNewTableModalVisible(false)}
          buttons={[{
            color: 'green',
            text: translation('create'),
            onClick: createTable,
            type: 'submit',
          }]}
        >
          <NewTableInputText>{translation('newTableTitle')}</NewTableInputText>
          <NewTableInput
            onChange={e => setNewTableTitle(e.target.value)}
            value={newTableTitle}
            autoFocus
            placeholder={translation('exampleTablePlaceholder')}
          />
        </Modal.default>
      )}
    </Container>
  );
}

export default React.memo(Tables);
