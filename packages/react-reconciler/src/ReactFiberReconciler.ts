import { Container } from 'hostConfig';
import { FiberNode } from './ReactFiber';
import { HostRoot } from './ReactWorkTags';
import { FiberRootNode } from './ReactFiberRoot';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './ReactFiberUpdateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';

// 创建FiberRootNode
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}

// 更新
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const update = createUpdate<ReactElementType | null>(element);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);

	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
