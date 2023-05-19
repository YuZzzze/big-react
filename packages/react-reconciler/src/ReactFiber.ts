import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './ReactWorkTags';
import { Flags, NoFlags } from './ReactFiberFlags';

export class FiberNode {
	tag: WorkTag;
	key: Key;
	type: any;
	stateNode: any;
	ref: Ref;

	return: FiberNode | null;
	child: FiberNode | null;
	sibling: FiberNode | null;
	index: number;

	pendingProps: Props | null;
	memoizedProps: Props | null;
	memoizedState: any;

	updateQueue: any;

	flags: Flags;
	subtreeFlags: Flags;
	deletions: FiberNode[] | null;

	alternate: FiberNode | null;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		this.type = null;
		this.stateNode = null;

		// Fiber
		this.return = null;
		this.child = null;
		this.sibling = null;
		this.index = 0;

		this.ref = null;

		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;
		this.updateQueue = null;

		// Effect
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
		this.deletions = null;

		this.alternate = null;
	}
}

export function createWorkInProgress(
	current: FiberNode,
	pendingProps: Props
): FiberNode {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
	}
	wip.type = current.type;

	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
}

export function createFiberFromElement(element: ReactElementType) {
	const { type, props, key } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型');
	}

	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
