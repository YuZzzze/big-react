// import { Props } from 'shared/ReactTypes';

import { FiberNode } from 'react-reconciler/src/ReactFiber';
import { HostText } from 'react-reconciler/src/ReactWorkTags';

export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

// export const createInstance = (type: string, props: Props): Instance => {
export const createInstance = (type: string): Instance => {
	const element = document.createElement(type);
	return element;
};

export function appendInitialChild(
	parentInstance: Instance | Container,
	child: Instance
) {
	parentInstance.appendChild(child);
}

export function removeChild(
	parentInstance: Instance,
	child: Instance | TextInstance
): void {
	parentInstance.removeChild(child);
}

export function createTextInstance(text: string) {
	return document.createTextNode(text);
}

export const appendChildToContainer = appendInitialChild;

export function commitUpdate(finishedWork: FiberNode): void {
	switch (finishedWork.tag) {
		case HostText:
			const textInstance: TextInstance = finishedWork.stateNode;
			const newText: string = finishedWork.memoizedProps.children;
			return commitTextUpdate(textInstance, newText);

		default:
			if (__DEV__) {
				console.warn('未实现的update类型');
			}
			break;
	}
}

export function commitTextUpdate(
	textInstance: TextInstance,
	newText: string
): void {
	textInstance.nodeValue = newText;
}
