import React, { useState } from 'react';
import { useMutation } from 'react-apollo';

import { Modal } from '../../ui';
import { Input, InputLabel } from '../../Tables/EditModal';

import { translation, text } from '../../../utils';
import graph from '../../../graph';

export interface TeacherProps {
  id: string;
  name: string;
  slug: string;
  workloadAmount: number;
  workhoursAmount: number;
}

interface Props {
  tableId: string;
  teacher: TeacherProps;
  onClose: React.Dispatch<React.SetStateAction<TeacherProps>>;
}

function EditModal({ tableId, teacher, onClose }: Props): React.ReactElement {
  const isNewTeacher = teacher.id === 'new';
  const [name, setName] = useState<string>(teacher.name || '');
  const [createTeacherRequest] = useMutation(graph.CreateTeacher);
  const [updateTeacherRequest] = useMutation(graph.UpdateTeacher);

  function updateName(inputName): void {
    const newName = inputName.trimStart().replace(/\s+/g, ' ');

    const regExp = /^[a-zа-яöüşiİıIğəç0-9\s]*$/gi;

    if (!regExp.test(newName) || newName.length > 30) return;

    setName(newName);
  }

  function updateTeacher(e: React.MouseEvent): void {
    e.preventDefault();

    const saveName = name.trim();

    if (!saveName) return;

    const slug = text.generateSlug(saveName);

    if (isNewTeacher) {
      createTeacherRequest({
        variables: { name: saveName, tableId, slug },
        refetchQueries: [
          { query: graph.GetTeachers, variables: { tableId } },
          { query: graph.GetUser },
        ],
      });
    } else {
      updateTeacherRequest({
        variables: { name: saveName, id: teacher.id, tableId, slug },
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
          text: translation(isNewTeacher ? 'create' : 'edit'),
          onClick: updateTeacher,
          type: 'submit',
        },
      ]}
    >
      <InputLabel>
        {isNewTeacher ? translation('newTeacher') : teacher.name}
      </InputLabel>
      <Input
        onChange={(e): void => updateName(e.target.value)}
        value={name}
        autoFocus
        placeholder={translation('exampleTeacherPlaceholder')}
      />
    </Modal.default>
  );
}

export default React.memo(EditModal);
