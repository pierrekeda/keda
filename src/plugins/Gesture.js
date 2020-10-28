class Gesture {

	constructor( {
		callback = null,
		cursor = null,
		debug = false,
		dispatcher = document.body,
		enabled = true,
		padding = 20,
		paddingBottom = null,
		paddingLeft = null,
		paddingRight = null,
		paddingTop = null,
		precision = null,
	} = {} ) {

		this.callback = ( typeof callback === 'function' )
			? callback
			: debug ? this.log.bind( this ) : null;

		this.precision = precision;
		this.enabled = enabled;
		this.x = 0;
		this.y = 0;

		// SIZE

		this.setSize( window.innerWidth, window.innerHeight, false );

		this.padding = padding;
		if ( paddingBottom ) this.padding.bottom = paddingBottom;
		if ( paddingLeft ) this.padding.left = paddingLeft;
		if ( paddingRight ) this.padding.right = paddingRight;
		if ( paddingTop ) this.padding.top = paddingTop;

		const center = { x: this.width / 2, y: this.height / 2 };
		this.cursor = Object.assign( {}, center );
		this.target = Object.assign( {}, center );

		// ACTIVATE

		if ( cursor && dispatcher ) dispatcher.style[ 'cursor' ] = cursor;
		this.dispatcher = dispatcher;

	}

	activate( event ) {

		if ( this.enabled ) {

			event.preventDefault();
			this.active = true;
			this.track( event );

		}

	}

	deactivate( event ) {

		if ( this.enabled ) {

			event.preventDefault();
			this.track( event );
			this.active = false;

		}

	}

	track( event ) {

		if ( this.enabled && this.active ) {

			event.preventDefault();

			if ( event.type.match( /touch/gi ) ) {

				const touch = event.touches[ 0 ];
				this.target.x = touch.clientX;
				this.target.y = touch.clientY;

			} else {

				this.target.x = event.clientX;
				this.target.y = event.clientY;

			}

			if (
				this.cursor.x !== this.target.x ||
				this.cursor.y !== this.target.y
			) {

				this.setCursor( this.target.x, this.target.y );

			}

		}

	}

	updateHitbox() {

		const padding = this._padding;

		let width = this.width - padding.left - padding.right;
		let height = this.height - padding.top - padding.bottom;

		if ( width < 1 ) width = 1;
		if ( height < 1 ) height = 1;

		this.hitbox = {
			width: width,
			height: height
		};

	}

	setCursor( x, y ) {

		this.cursor.x = x;
		this.cursor.y = y;

		const padding = this._padding;
		const hitbox = this.hitbox;
		x = ( x - padding.left ) / hitbox.width;
		y = ( y - padding.top ) / hitbox.height;

		if ( x < 0 ) x = 0;
		else if ( x > 1 ) x = 1;

		if ( y < 0 ) y = 0;
		else if ( y > 1 ) y = 1;

		y = 1 - y;

		if ( this.precision ) {

			x = x.toPrecision( this.precision );
			y = y.toPrecision( this.precision );

		}

		this.x = x;
		this.y = y;

		if ( this.callback ) this.callback.call();

	}

	setSize(
		width = window.innerWidth,
		height = window.innerHeight,
		updateHitbox = true
	) {

		this.width = width;
		this.height = height;

		if ( updateHitbox ) this.updateHitbox();

	}

	log() {

		console.log( `Gesture: { x: ${this.x}, y: ${this.y} }` );

	}

	dispose() {

		this._dispatcher.removeEventListener( 'pointerenter', this.activate.bind( this ), false );
		this._dispatcher.removeEventListener( 'pointerleave', this.deactivate.bind( this ), false );
		this._dispatcher.removeEventListener( 'pointermove', this.track.bind( this ), false );

		this._dispatcher.removeEventListener( 'touchstart', this.activate.bind( this ), false );
		this._dispatcher.removeEventListener( 'touchend', this.deactivate.bind( this ), false );
		this._dispatcher.removeEventListener( 'touchmove', this.track.bind( this ), false );

		this._dispatcher = null;

	}

	get dispatcher() {

		return this._dispatcher;

	}

	set dispatcher( value ) {

		if ( this._dispatcher ) this.dispose();
		this._dispatcher = value;

		this._dispatcher.addEventListener( 'pointerenter', this.activate.bind( this ), false );
		this._dispatcher.addEventListener( 'pointerleave', this.deactivate.bind( this ), false );
		this._dispatcher.addEventListener( 'pointermove', this.track.bind( this ), false );

		this._dispatcher.addEventListener( 'touchstart', this.activate.bind( this ), false );
		this._dispatcher.addEventListener( 'touchend', this.deactivate.bind( this ), false );
		this._dispatcher.addEventListener( 'touchmove', this.track.bind( this ), false );

	}

	get padding() {

		return this._padding;

	}

	set padding( value ) {

		this._padding = {
			bottom: value,
			left: value,
			right: value,
			top: value,
		};

		this.updateHitbox();

	}

	get xy() {

		return ( this.x + this.y ) / 2;

	}

}

Gesture.compute = ( value, min, max ) => {

	return min + ( max - min ) * value;

};

export { Gesture };
