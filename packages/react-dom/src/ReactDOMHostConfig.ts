// import { Props } from 'shared/ReactTypes';

export type Container = Element;
export type Instance = Element;

// export const createInstance = (type: string, props: Props): Instance => {
export const createInstance = (type: string): Instance => {
	const element = document.createElement(type);
	return element;
};

export const appendInitialChild = (
	parentInstance: Instance | Container,
	child: Instance
) => {
	parentInstance.appendChild(child);
};

export const createTextInstance = (text: string) => {
	return document.createTextNode(text);
};

export const appendChildToContainer = appendInitialChild;
