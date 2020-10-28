class Updator {

	constructor( enabled = true ) {

		this.enabled = enabled;
		this.updatables = [];

	}

	add( updatable ) {

		if ( typeof updatable.update !== 'function' ) {

			console.warn( 'Updator.add( updatable ) : parameter must be an object with an update() method.' );
			return false;

		}

		if ( this.contains( updatable ) ) {

			console.warn( 'Updator.add( updatable ) : updatable already added.' );
			return false;

		}

		this.updatables.push( updatable );
		return updatable;

	}

	remove( updatable ) {

		let updatables = this.updatables;

		for ( let i = 0, l = updatables.length; i < l; i ++ ) {

			if ( updatables[ i ] === updatable ) {

				return updatables.splice( i, 1 );

			}

		}

		console.warn( 'Updator.remove( updatable ) : updatable not found.' );
		return false;

	}

	contains( updatable ) {

		const updatables = this.updatables;

		for ( let i = 0, l = updatables.length; i < l; i ++ ) {

			if ( updatables[ i ] === updatable ) {

				return true;

			}

		}

		return false;

	}

	update() {

		if ( ! this.enabled ) return;

		let updatables = this.updatables;

		for ( let i = 0, l = updatables.length; i < l; i ++ ) {

			updatables[ i ].update();

		}

	}

}

export { Updator };
