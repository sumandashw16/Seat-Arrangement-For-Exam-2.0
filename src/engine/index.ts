// Engine public API
export { generateSeating } from './seating';
export { validateInput } from './validate';
export {
  resolveSection,
  resolveCategory,
  expandRange,
  parseRollList,
  isValidRollNumber,
  compareRollNumbers,
} from './resolveStudents';
export { ENGINE_CONFIG } from './config';
export type * from './types';
