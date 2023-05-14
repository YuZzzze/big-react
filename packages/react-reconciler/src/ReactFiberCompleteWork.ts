import { FiberNode } from './ReactFiber';
import { NoFlags } from './ReactFiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './ReactWorkTags';
import {
	Instance,
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';

export const completeWork = (workInProgress: FiberNode) => {
	const newProps = workInProgress.pendingProps;
	const current = workInProgress.alternate;

	switch (workInProgress.tag) {
		case HostComponent:
			if (current !== null && workInProgress.stateNode) {
				// update
			} else {
				const instance = createInstance(workInProgress.type);
				appendAllChildren(instance, workInProgress);
				workInProgress.stateNode = instance;
			}
			bubbleProperties(workInProgress);
			return null;
		case HostText:
			if (current !== null && workInProgress.stateNode) {
				// update
			} else {
				const instance = createTextInstance(newProps.children);
				workInProgress.stateNode = instance;
			}
			bubbleProperties(workInProgress);
			return null;
		case HostRoot:
			bubbleProperties(workInProgress);
			return null;
		case FunctionComponent:
			bubbleProperties(workInProgress);
			return null;
		default:
			if (__DEV__) {
				console.warn('未处理的completeWork情况', workInProgress);
			}
	}
};

function appendAllChildren(parent: Instance, workInProgress: FiberNode) {
	let node = workInProgress.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === workInProgress) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === workInProgress) {
				return;
			}
			node = node.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

function bubbleProperties(workInProgress: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = workInProgress.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = workInProgress;
		child = child.sibling;
	}

	workInProgress.subtreeFlags |= subtreeFlags;
}
