/**
 * Attempts to select an HTML element by id.
 * If it doesn't exists, the element will be created and appended to the specified container.
 * @param {String} id ID of the element to select or create ( required )
 * @param {Node} container Container element for appending ( default : document.body )
 * @param {String} type Type of the element ( default : 'div' )
 */
function getElement( id, container = document.body, type = 'div' ) {

	let element = document.getElementById( id );

	if ( ! element ) {

		document.createElement( type );
		element.setAttribute( 'id', id );
		container.appendChild( element );

	}

	return element;

}

export { getElement };
