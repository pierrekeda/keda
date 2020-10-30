/**
 * Sets both the width/height attribute, and width/height style
 * on an element.
 * @param {Element} element
 * @param {Number} width
 * @param {Number} height
 */
function setElementSize( element, width, height ) {


	element.setAttribute( 'width', width );
	element.setAttribute( 'height', height );
	element.style.width = `${width}px`;
	element.style.height = `${height}px`;

}

export { setElementSize };
