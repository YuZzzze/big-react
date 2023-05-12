import { Container, appendChildToContainer } from 'hostConfig';
import { FiberNode } from './ReactFiber';
import { MutationMask, NoFlags, Placement } from './ReactFiberFlags';
import { HostComponent, HostRoot, HostText } from './ReactWorkTags';

let nextEffect: FiberNode | null = null;

export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;

	while (nextEffect !== null) {
		const child: FiberNode | null = nextEffect.child;

		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			nextEffect.child !== null
		) {
			nextEffect = child;
		} else {
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;

				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};

function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
	const flags = finishedWork.flags;

	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
}

function commitPlacement(finishedWork: FiberNode) {
	if (__DEV__) {
		console.log('执行Placement');
	}

	const parentFiber = getHostParentFiber(finishedWork);
	switch (parentFiber.tag) {
		case HostComponent:
			const parent = parentFiber.stateNode;
			appendPlacementNodeIntoContainer(parent, finishedWork);
	}
}

function getHostParentFiber(fiber: FiberNode) {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent || parentTag === HostRoot) {
			return parent.stateNode;
		} else {
			parent = parent.return;
		}
	}
}

function appendPlacementNodeIntoContainer(node: FiberNode, parent: Container) {
	const { tag } = node;
	if (tag === HostComponent || tag === HostText) {
		appendChildToContainer(parent, node.stateNode);
	} else {
		const child = node.child;
		if (child !== null) {
			appendPlacementNodeIntoContainer(parent, child);
			let sibling = child.sibling;
			while (sibling !== null) {
				appendPlacementNodeIntoContainer(parent, sibling);
				sibling = sibling.sibling;
			}
		}
	}
}
