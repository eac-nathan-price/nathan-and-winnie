import { Move, Space, Board, Step, Message, InitMessage, TaskMessage } from './types';
import { CIRCLE } from './circle';
import { DIAMONDS } from './diamonds';
import { HEXAGON } from './hexagon';
import { PLUS } from './plus';

export { Move, Space, Board, Step, CIRCLE, DIAMONDS, HEXAGON, PLUS, Message, InitMessage, TaskMessage };
export const BOARD = { CIRCLE: CIRCLE, DIAMONDS: DIAMONDS, HEXAGON: HEXAGON, PLUS: PLUS };
export const BOARDS = [CIRCLE, DIAMONDS, HEXAGON, PLUS];
