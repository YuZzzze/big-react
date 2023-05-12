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
		console.warn('执行Placement', finishedWork);
	}

	const parentFiber = getHostParentFiber(finishedWork);
	if (parentFiber !== null) {
		// const parent = parentFiber.stateNode;
		// appendPlacementNodeIntoContainer(finishedWork, parent);
		let parent;
		switch (parentFiber.tag) {
			case HostComponent:
				parent = parentFiber.stateNode;
				appendPlacementNodeIntoContainer(finishedWork, parent);
				return;
			case HostRoot:
				parent = parentFiber.stateNode;
				appendPlacementNodeIntoContainer(finishedWork, parent.container);
				return;
		}
	}
}

function getHostParentFiber(fiber: FiberNode) {
	let parent = fiber.return;

	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent || parentTag === HostRoot) {
			return parent;
		} else {
			parent = parent.return;
		}
	}
	return null;
}

function appendPlacementNodeIntoContainer(node: FiberNode, parent: Container) {
	const { tag } = node;
	if (tag === HostComponent || tag === HostText) {
		appendChildToContainer(parent, node.stateNode);
	} else {
		const child = node.child;
		if (child !== null) {
			appendPlacementNodeIntoContainer(child, parent);
			let sibling = child.sibling;
			while (sibling !== null) {
				appendPlacementNodeIntoContainer(child, parent);
				sibling = sibling.sibling;
			}
		}
	}
}
