const random = {

	MAX: 9999,

	value: () => {

		return Math.random();

	},

	uint: ( max = random.MAX ) => {

		return random.int( 0, max );

	},

	int: ( min = 0, max = random.MAX ) => {

		return min + Math.floor( Math.random() * ( max - min + 1 ) );

	},

	float: ( min = 0, max = random.MAX, precision = 2 ) => {

		return parseFloat(  Math.min( min + ( Math.random() * ( max - min ) ), max ).toFixed( precision ) );

	},

	item: ( pool, excluded = [] ) => {

		if ( Array.isArray( pool ) ) return random.itemFromArray( pool, excluded );
		return random.itemFromObject( pool, excluded );

	},

	itemFromArray: ( array, excluded = [] ) => {

		if ( excluded.length > 0 ) {

			array = array.filter( ( item ) => ! excluded.includes( item ) );

		}

		return array[ Math.floor( Math.random() * array.length ) ];

	},

	itemFromObject: ( object, excludedKeys = [] ) => {

		let keys = Object.keys( object );
		if ( excludedKeys.length > 0 ) {

			keys = keys.filter( ( item ) => ! excludedKeys.includes( item ) );

		}

		return object[ random.item( keys ) ];


	},

	color: function ( min = 0, max = 255 ) {

		let color = '#';

		for ( let i = 0; i < 3; i ++ ) {

			color += random.int( min, max ).toString( 16 ).padStart( 2, '0' );

		}

		return color;

	}

};

export { random };
