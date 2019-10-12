import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-apollo';

import { Modal, Input as DefaultInput } from '../ui';
import { translation, text } from '../../utils';
import graph from '../../graph';

const InputLabel = styled.p`
  text-align: center;
  font-size: 22px;
  font-weight: 400;
`;

const Input = styled(DefaultInput)`
  width: 400px;
`;

const refetchQueries = [{ query: graph.GetUser }];

export interface TableProps {
  id: string;
  title?: string;
}

interface Props {
  table: TableProps;
  onClose: React.Dispatch<React.SetStateAction<TableProps | null>>;
}

export default function TitleModal({
  table,
  onClose,
}: Props): React.ReactElement {
  const isNewTable = table.id === 'new';
  const [title, setTitle] = useState(table.title || '');
  const [createTableRequest] = useMutation(graph.CreateTable);
  const [updateTableRequest] = useMutation(graph.UpdateTable);

  function updateTitle(inputTitle): void {
    const newTitle = inputTitle.trimStart().replace(/\s+/g, ' ');

    const regExp = /^[a-zа-яöüşiİıIğəç0-9\s]*$/gi;

    if (!regExp.test(newTitle) || newTitle.length > 30) return;

    setTitle(newTitle);
  }

  function updateTable(e): undefined {
    e.preventDefault();

    const saveTitle = title.trim();

    if (!saveTitle) return;

    const slug = text.generateSlug(saveTitle);

    if (isNewTable) {
      createTableRequest({
        variables: { title: saveTitle, slug },
        refetchQueries,
      });
    } else {
      updateTableRequest({
        variables: { title: saveTitle, slug, id: table?.id },
      });
    }

    onClose(null);
  }

  return (
    <Modal.default
      onClose={onClose}
      buttons={[
        {
          color: 'green',
          text: translation(isNewTable ? 'create' : 'edit'),
          onClick: updateTable,
          type: 'submit',
        },
      ]}
    >
      <InputLabel>
        {translation(isNewTable ? 'newTableTitle' : 'editTableTitle')}
      </InputLabel>
      <Input
        onChange={(e): void => updateTitle(e.target.value)}
        value={title}
        autoFocus
        placeholder={translation('exampleTablePlaceholder')}
      />
    </Modal.default>
  );
}
