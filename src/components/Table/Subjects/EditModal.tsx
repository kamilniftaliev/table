import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-apollo';

import { Modal, Checkbox as DefaultCheckbox } from '../../ui';
import { Input, InputLabel } from '../../Tables/EditModal';

import { translation } from '../../../utils';
import graph from '../../../graph';

export const Checkbox = styled(DefaultCheckbox)`
  display: block;
  margin-top: 20px;
`;

export interface SubjectProps {
  id: string;
  title?: string;
  isDivisible?: boolean;
}

interface Props {
  tableId: string;
  subject: SubjectProps;
  onClose: React.Dispatch<React.SetStateAction<SubjectProps>>;
}

function EditModal({ tableId, subject, onClose }: Props): React.ReactElement {
  const isNewSubject = subject.id === 'new';
  const [title, setTitle] = useState<string>(subject.title || '');
  const [isDivisible, setIsDivisible] = useState<boolean>(
    !!subject.isDivisible,
  );
  const [createSubjectRequest] = useMutation(graph.CreateSubject);
  const [updateSubjectRequest] = useMutation(graph.UpdateSubject);

  function updateTitle(inputTitle): void {
    const newTitle = inputTitle.trimStart().replace(/\s+/g, ' ');

    if (newTitle.length > 30) return;

    setTitle(newTitle);
  }

  function updateSubject(e: React.MouseEvent): void {
    e.preventDefault();

    const saveTitle = title.trim();

    if (!saveTitle) return;

    if (isNewSubject) {
      createSubjectRequest({
        variables: { title: saveTitle, isDivisible, tableId },
        refetchQueries: [
          { query: graph.GetSubjects, variables: { tableId } },
          { query: graph.GetUser },
        ],
      });
    } else {
      updateSubjectRequest({
        variables: { title: saveTitle, isDivisible, id: subject.id, tableId },
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
          text: translation(isNewSubject ? 'create' : 'edit'),
          onClick: updateSubject,
          type: 'submit',
        },
      ]}
    >
      <InputLabel>
        {isNewSubject ? translation('newSubject') : subject.title}
      </InputLabel>
      <Input
        onChange={(e): void => updateTitle(e.target.value)}
        value={title}
        autoFocus
        placeholder={translation('exampleSubjectPlaceholder')}
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
