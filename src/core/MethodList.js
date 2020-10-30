/**
 * Utility class for managing multiple objects with the same method.
 * For example, if you need to call a resize method on several objects
 * that may or may not exist, insted of having to do :
 *
 * 		if ( foo ) foo.resize( width, height );
 * 		if ( bar ) bar.resize( width, height );
 *
 * You can instead create a methodlist :
 *
 * 		var resizeList = new MethodList( 'resize' );
 * 		resizeList.add( foo, bar );
 * 		resizeList.resize( width, height );
 *
 * This is useful if you experiment with many objects and don't want
 * to add/remove calls every time you add/remove an object.
 *
 * You can also use method chaining.
 * For example, if you need to resize the bar object only once, you can do :
 *
 * 		var resizeList = new MethodList( 'resize );
 * 		resizeList.add( foo )
 * 			.add( bar )
 * 			.resize( width, height )
 * 			.remove( bar );
 *
 */
class MethodList {

	/**
	 * Creates a new MethodList.
	 * @param {String} methodName The name of the targeted method, e.g. 'update' for update().
	 */
	constructor( methodName ) {

		this.methodName = methodName;
		this.items = [];
		this.enabled = true;
		this[ methodName ] = this._apply;

	}

	/**
	 * Adds an item, multiple items or array(s) of items to this list.
	 * The item(s) must implement the method specified in the constructor.
	 * @param  {...Object} items Items to add to the MethodList.
	 */
	add( ...items ) {

		for ( let i in items ) {

			let item = items[ i ];

			if ( Array.isArray( item ) ) {

				for ( let j in item ) {

					this._addItem( item[ j ] );

				}

			} else {

				this._addItem( items[ i ] );

			}

		}

		return this;

	}

	/**
	 * Removes an item, multiple items or array(s) of items from this list.
	 * @param  {...Object} items Items to remove from the MethodList.
	 */
	remove( ...items ) {

		for ( let i in items ) {

			let item = items[ i ];

			if ( Array.isArray( item ) ) {

				for ( let j in item ) {

					this._removeItem( item[ j ] );

				}

			} else {

				this._removeItem( items[ i ] );

			}

		}

		return this;

	}

	/*-------------------------------------------------------------------/

		PRIVATE

    /-------------------------------------------------------------------*/

	/**
	 * Adds an item to this list.
	 * @param {Object} item Item to add to the MethodList.
	 */
	_addItem( item ) {

		if ( typeof item[ this.methodName ] !== 'function' ) {

			console.warn( 'MethodList.add( item ) : parameter must be an object with the methodlist method.' );
			return this;

		}

		if ( this._contains( item ) ) {

			console.warn( 'MethodList.add( item ) : item was already added.' );
			return this;

		}

		this.items.push( item );

		return this;

	}

	/**
	 * Removes an item from this list.
	 * @param {Object} item Item to remove from the MethodList.
	 */
	_removeItem( item ) {

		let items = this.items;

		for ( let i = 0, l = items.length; i < l; i ++ ) {

			if ( items[ i ] === item ) {

				items.splice( i, 1 );
				return this;

			}

		}

		console.warn( 'MethodList.remove( item ) : item not found.' );

		return this;

	}

	/**
	 * Checks if an item was already added to the list.
	 * @param {Object} item Item to check.
	 */
	_contains( item ) {

		const items = this.items;

		for ( let i = 0, l = items.length; i < l; i ++ ) {

			if ( items[ i ] === item ) {

				return true;

			}

		}

		return false;

	}

	/**
	 * Applies the targeted method to all the items of this list.
	 * Note that the targeted method is automatically added to the MethodList.
	 * E.g. var updateList = new MethodList( 'update' ) will create an updateList.update()
	 * method, which is an alias of this updateList.apply(), and should be used instead.
	 * @param  {...any} args The arguments
	 */
	_apply( ...args ) {

		if ( ! this.enabled ) return this;

		let items = this.items;
		const methodName = this.methodName;

		for ( let i = 0, l = items.length; i < l; i ++ ) {

			let item = items[ i ];
			item[ methodName ].apply( item, args );

		}

		return this;

	}

}

export { MethodList };
