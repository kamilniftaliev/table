import React, { useState, useEffect, useCallback } from 'react';
import { useMutation } from 'react-apollo';

import graph from '../../../graph';
import { translation } from '../../../utils';

import EditModal from './EditModal';
import { Table, Button, Modal } from '../../ui';
import { Class, Table as TableType } from '../../../models';

import TrashCan from '../../../images/icons/trash.svg';

interface Props {
  classes: Class[];
  slug: TableType['slug'];
  tableId: TableType['id'];
}

function Classes({ classes, slug, tableId }: Props): React.ReactElement {
  const [modalClassIndex, setModalClassIndex] = useState<number>(null);
  const [deletingClass, setDeletingClass] = useState<Class>(null);

  useEffect(() => {
    document.title = translation('classes');
    return (): void => {
      document.title = 'Table.az';
    };
  }, []);

  const [deleteClassRequest] = useMutation(graph.DeleteClass, {
    update(cache, { data: { deleteClass: classId } }) {
      const { table } = cache.readQuery({
        query: graph.GetTable,
        variables: { slug },
      });

      cache.writeQuery({
        query: graph.GetTable,
        data: {
          table: {
            ...table,
            classes: table.classes.filter(c => c.id !== classId),
          },
        },
      });
    },
  });

  const deleteClass = useCallback((): void => {
    deleteClassRequest({
      variables: {
        id: deletingClass.id,
        tableId,
      },
    });

    setDeletingClass(null);
  }, [deletingClass]);

  return (
    <>
      {classes.length ? (
        <Table.default>
          <Table.Header>
            <Table.Row>
              <Table.Head>№</Table.Head>
              <Table.Head align="left">{translation('class')}</Table.Head>
              <Table.Head>{translation('teachers')}</Table.Head>
              <Table.Head>{translation('subjects')}</Table.Head>
              <Table.Head>{translation('lessonHours')}</Table.Head>
              <Table.Head>{translation('sector')}</Table.Head>
              <Table.Head>{translation('shift')}</Table.Head>
              <Table.Head>{translation('actions')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {classes.map((theClass, index: number) => {
              const {
                id,
                number,
                letter,
                shift,
                sector,
                teachers = 0,
                subjects = 0,
                lessons = 0,
              } = theClass;
              const updateFn = (): void => setModalClassIndex(index);

              return (
                <Table.Row key={id}>
                  <Table.Cell onClick={updateFn}>{index + 1}</Table.Cell>
                  <Table.Cell align="left" onClick={updateFn}>
                    {number}
                    {letter}
                  </Table.Cell>
                  <Table.Cell onClick={updateFn}>
                    {translation('teacherCount', teachers)}
                  </Table.Cell>
                  <Table.Cell onClick={updateFn}>
                    {translation('subjectCount', subjects)}
                  </Table.Cell>
                  <Table.Cell onClick={updateFn}>
                    {translation('hour', lessons)}
                  </Table.Cell>
                  <Table.Cell onClick={updateFn}>
                    {translation(sector)}
                  </Table.Cell>
                  <Table.Cell onClick={updateFn}>
                    {translation('shift', shift)}
                  </Table.Cell>
                  <Table.Cell>
                    <Button.Icon
                      onClick={(): void => setDeletingClass(theClass)}
                      src={TrashCan}
                    />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.default>
      ) : null}
      <Button.Add onClick={(): void => setModalClassIndex(-1)}>
        {translation('addNewClass')}
      </Button.Add>

      {deletingClass && (
        <Modal.Confirm
          text={translation(
            'pleaseConfirmClassDelete',
            `${deletingClass.number}${deletingClass.letter}`,
          )}
          onClose={(): void => setDeletingClass(null)}
          onConfirm={deleteClass}
        />
      )}
      {modalClassIndex !== null && (
        <EditModal
          slug={slug}
          classes={classes}
          classIndex={modalClassIndex}
          onClose={(): void => setModalClassIndex(null)}
          onDeleteClick={setDeletingClass}
        />
      )}
    </>
  );
}

export default React.memo(Classes);
