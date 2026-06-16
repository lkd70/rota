import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateScheduleDocument } from '../web/src/lib/data/validateSchedule.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema/schedule.schema.json'), 'utf8'));
const data = JSON.parse(readFileSync(join(root, 'data/schedule.json'), 'utf8'));

validateScheduleDocument(schema, data);
console.log('Schedule is valid.');
