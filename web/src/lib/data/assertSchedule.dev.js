import schema from '../../../../schema/schedule.schema.json';
import { schedule } from './schedule.js';
import { validateScheduleDocument } from './validateSchedule.js';

validateScheduleDocument(schema, schedule);
