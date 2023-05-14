import { ReactElementType } from 'shared/ReactTypes';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './ReactWorkTags';
import { FiberNode } from './ReactFiber';
import { processUpdateQueue } from './ReactFiberUpdateQueue';
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber';
import { renderWithHooks } from './ReactFiberHooks';

function reconcileChildren(
	workInProgress: FiberNode,
	children?: ReactElementType
) {
	const current = workInProgress.alternate;
	if (current !== null) {
		// update
		workInProgress.child = reconcileChildFibers(
			workInProgress,
			current.child,
			children
		);
	} else {
		// mount
		workInProgress.child = mountChildFibers(workInProgress, null, children);
	}
}

export const beginWork = (workInProgress: FiberNode) => {
	switch (workInProgress.tag) {
		case HostRoot:
			return updateHostRoot(workInProgress);
		case HostComponent:
			return updateHostComponent(workInProgress);
		case HostText:
			return null;
		case FunctionComponent:
			return updateFunctionComponent(workInProgress);
		default:
			if (__DEV__) {
				console.error('beginWork未处理的情况');
			}
			return null;
	}
};

function updateHostRoot(workInProgress: FiberNode) {
	const baseState = workInProgress.memoizedState;
	const updateQueue = workInProgress.updateQueue;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	workInProgress.memoizedState = memoizedState;

	const nextChildren = workInProgress.memoizedState;
	reconcileChildren(workInProgress, nextChildren);
	return workInProgress.child;
}

function updateHostComponent(workInProgress: FiberNode) {
	const nextProps = workInProgress.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(workInProgress, nextChildren);
	return workInProgress.child;
}

function updateFunctionComponent(workInProgress: FiberNode) {
	const nextChildren = renderWithHooks(workInProgress);
	reconcileChildren(workInProgress, nextChildren);
	return workInProgress.child;
}
