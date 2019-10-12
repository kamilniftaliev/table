import USER from './user.gql';
import TABLE from './table.gql';
import SUBJECT from './subject.gql';
import CLASS from './class.gql';

export default { ...TABLE, ...USER, ...SUBJECT, ...CLASS };
