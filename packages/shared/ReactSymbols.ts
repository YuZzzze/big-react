const supportSymbol = typeof Symbol === 'function' && Symbol.for;

export const REACT_ELEMENT_TYPE: number | symbol = supportSymbol
	? Symbol.for('react.element')
	: 0xeac7;
