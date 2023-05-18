import { jsx, isValidElement as isValidElementFn } from './src/jsx';

export {
	__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
	useState
} from './src/React';

export const version = '0.0.0';
export const createElement = jsx;
export const isValidElement = isValidElementFn;
