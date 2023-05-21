import {
	Container,
	appendChildToContainer,
	commitUpdate,
	removeChild
} from 'hostConfig';
import { FiberNode } from './ReactFiber';
import {
	ChildDeletion,
	MutationMask,
	NoFlags,
	Placement,
	Update
} from './ReactFiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './ReactWorkTags';

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

	if ((flags & Update) !== NoFlags) {
		commitUpdate(finishedWork);
		finishedWork.flags &= ~Update;
	}

	if ((flags & ChildDeletion) !== NoFlags) {
		const deletions = finishedWork.deletions;
		if (deletions !== null) {
			deletions.forEach((childDeletion) => {
				commitDeletion(childDeletion);
			});
		}

		finishedWork.flags &= ~ChildDeletion;
	}
}

function commitPlacement(finishedWork: FiberNode) {
	if (__DEV__) {
		console.warn('执行Placement', finishedWork);
	}

	const parentFiber = getHostParentFiber(finishedWork);
	if (parentFiber !== null) {
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

function commitDeletion(childToDeletion: FiberNode) {
	let rootHostNode: FiberNode | null = null;

	commitNestedComponent(childToDeletion, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				if (rootHostNode === null) {
					rootHostNode = unmountFiber;
				}
				// TODO 解绑Ref
				break;
			case HostText:
				if (rootHostNode === null) {
					rootHostNode = unmountFiber;
				}
				break;
			case FunctionComponent:
				// TODO useEffect unmount
				break;
			default:
				if (__DEV__) {
					console.warn('未处理的unmount类型', unmountFiber);
				}

				break;
		}
	});

	if (rootHostNode !== null) {
		const hostParent = getHostParentFiber(childToDeletion);
		if (hostParent !== null) {
			removeChild(hostParent.stateNode, childToDeletion.stateNode);
		}
	}
	childToDeletion.return = null;
	childToDeletion.child = null;
}

function commitNestedComponent(
	root: FiberNode,
	onCommitUnount: (fiber: FiberNode) => void
) {
	let node = root;
	while (true) {
		onCommitUnount(node);

		if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === root) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === root) {
				return;
			}
			node = node.return;
		}

		node.sibling.return = node;
		node = node.sibling;
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
