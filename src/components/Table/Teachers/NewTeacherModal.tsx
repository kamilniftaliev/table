import React, { useState, useCallback } from 'react';
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
  tableSlug: string;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}

function NewTeacherModal({
  tableId,
  onClose,
  tableSlug,
}: Props): React.ReactElement {
  const [name, setName] = useState<string>('');
  const [createTeacherRequest] = useMutation(graph.CreateTeacher);

  const updateName = useCallback((e: React.ChangeEvent): void => {
    const inputName = e.target.value;
    const newName = inputName.trimStart().replace(/\s+/g, ' ');

    const regExp = /^[a-zа-яöüşiİıIğəç0-9\s]*$/gi;

    if (!regExp.test(newName) || newName.length > 30) return;

    setName(newName);
  }, []);

  const updateTeacher = useCallback(
    (e: React.MouseEvent): void => {
      e.preventDefault();

      const saveName = name.trim();

      if (!saveName) return;

      const slug = text.generateSlug(saveName);

      createTeacherRequest({
        variables: { name: saveName, tableId, slug },
        update(cache, { data: { createTeacher: newTeacher } }) {
          const { table } = cache.readQuery({
            query: graph.GetTable,
            variables: { slug: tableSlug },
          });

          cache.writeQuery({
            query: graph.GetTable,
            data: {
              table: {
                ...table,
                teachers: [
                  ...table.teachers,
                  {
                    ...newTeacher,
                    workload: [],
                    workhours: [],
                  },
                ],
              },
            },
          });
        },
      });

      onClose(null);
    },
    [name],
  );

  return (
    <Modal.default
      onClose={(): void => onClose(null)}
      buttons={[
        {
          color: 'green',
          text: translation('create'),
          onClick: updateTeacher,
          type: 'submit',
        },
      ]}
    >
      <InputLabel>{translation('newTeacher')}</InputLabel>
      <Input
        onChange={updateName}
        value={name}
        autoFocus
        placeholder={translation('exampleTeacherPlaceholder')}
      />
    </Modal.default>
  );
}

export default React.memo(NewTeacherModal);
