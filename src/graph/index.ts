import USER from './user.gql';
import TABLE from './table.gql';
import SUBJECT from './subject.gql';
import CLASS from './class.gql';
import TEACHER from './teacher.gql';

export default { ...TABLE, ...USER, ...SUBJECT, ...CLASS, ...TEACHER };
