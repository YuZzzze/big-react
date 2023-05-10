import { FiberNode, createWorkInProgress } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { completeWork } from './ReactFiberCompleteWork';
import { FiberRootNode } from './ReactFiberRoot';
import { HostRoot } from './ReactWorkTags';

let workInProgress: FiberNode | null = null;

function prepareRefreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 调度功能
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// fiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareRefreshStack(root);

	do {
		try {
			workLoop();
			break;
		} catch (e) {
			workInProgress = null;
			if (__DEV__) {
				console.warn('workLoop出现错误', e);
			}
		}
	} while (true);
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = next && next.pendingProps;

	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		const sibling = node.sibling;

		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
