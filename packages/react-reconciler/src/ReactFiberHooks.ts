import { Dispatch, Dispatcher } from './ReactInternalTypes';
import { FiberNode } from './ReactFiber';
import ReactSharedInternals from 'shared/ReactSharedInternals';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './ReactFiberUpdateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';

const { ReactCurrentDispatcher } = ReactSharedInternals;

export interface Hook {
	memoizedState: any;
	queue: unknown;
	next: Hook | null;
}

let currentlyRenderingFiber: FiberNode | null = null;
let workInProgressHook: Hook | null = null;

export function renderWithHooks(workInProgress: FiberNode) {
	currentlyRenderingFiber = workInProgress;
	workInProgress.memoizedState = null;

	const current = workInProgress.alternate;

	if (current !== null) {
		// update
	} else {
		// mount
		ReactCurrentDispatcher.current = HooksDispatcherOnMount;
	}

	const Component = workInProgress.type;
	const props = workInProgress.pendingProps;
	const children = Component(props);

	currentlyRenderingFiber = null;
	return children;
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		queue: null,
		next: null
	};
	if (workInProgressHook === null) {
		// mount时，第一个Hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// mount时，不是第一个Hook
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	const hook = mountWorkInProgressHook();

	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}

	const queue = createUpdateQueue<State>();
	hook.queue = queue;
	hook.memoizedState = memoizedState;

	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
	queue.dispatch = dispatch;

	return [memoizedState, dispatch];
}

function dispatchSetState<State>(
	fiber: FiberNode,
	queue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(queue, update);
	scheduleUpdateOnFiber(fiber);
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};
