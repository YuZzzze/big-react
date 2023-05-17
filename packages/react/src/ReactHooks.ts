import { Dispatcher } from 'react-reconciler/src/ReactInternalTypes';
import ReactCurrentDispatcher from './ReactCurrentDispatcher';

function resolveDispatcher(): Dispatcher {
	const dispatcher = ReactCurrentDispatcher.current;
	if (dispatcher === null) {
		throw new Error('hooks只能在函数组件中执行');
	}
	return dispatcher;
}

export const useState: Dispatcher['useState'] = (initialState) => {
	const dispatcher = resolveDispatcher();
	return dispatcher.useState(initialState);
};
