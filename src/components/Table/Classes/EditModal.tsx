import React, { useState } from 'react';
import { useMutation } from 'react-apollo';

import { Modal } from '../../ui';
import { Input, InputLabel } from '../../Tables/EditModal';
import { Checkbox } from '../Subjects/EditModal';

import { translation } from '../../../utils';
import graph from '../../../graph';

export interface ClassProps {
  id: string;
  title?: string;
  isDivisible?: boolean;
}

interface Props {
  tableId: string;
  class: ClassProps;
  onClose: React.Dispatch<React.SetStateAction<ClassProps>>;
}

function EditModal({
  tableId,
  class: { id, title: classTitle, isDivisible: classIsDivisible },
  onClose,
}: Props): React.ReactElement {
  const isNewClass = id === 'new';
  const [title, setTitle] = useState<string>(classTitle || '');
  const [isDivisible, setIsDivisible] = useState<boolean>(!!classIsDivisible);
  const [createClassRequest] = useMutation(graph.CreateClass);
  const [updateClassRequest] = useMutation(graph.UpdateClass);

  function updateTitle(inputTitle): void {
    const newTitle = inputTitle.trimStart().replace(/\s+/g, ' ');

    if (newTitle.length > 30) return;

    setTitle(newTitle);
  }

  function updateClass(e: React.MouseEvent): void {
    e.preventDefault();

    const saveTitle = title.trim();

    if (!saveTitle) return;

    if (isNewClass) {
      createClassRequest({
        variables: { title: saveTitle, isDivisible, tableId },
        refetchQueries: [
          { query: graph.GetClasses, variables: { tableId } },
          { query: graph.GetUser },
        ],
      });
    } else {
      updateClassRequest({
        variables: { title: saveTitle, isDivisible, id, tableId },
      });
    }

    onClose(null);
  }

  return (
    <Modal.default
      onClose={(): void => onClose(null)}
      buttons={[
        {
          color: 'green',
          text: translation(isNewClass ? 'create' : 'edit'),
          onClick: updateClass,
          type: 'submit',
        },
      ]}
    >
      <InputLabel>
        {isNewClass ? translation('newClass') : classTitle}
      </InputLabel>
      <Input
        onChange={(e): void => updateTitle(e.target.value)}
        value={title}
        autoFocus
        placeholder={translation('exampleClassPlaceholder')}
      />
      <Checkbox
        onChange={(value: boolean): void => setIsDivisible(value)}
        checked={isDivisible}
        label={translation('isDivisibleByGroups')}
      />
    </Modal.default>
  );
}

export default React.memo(EditModal);