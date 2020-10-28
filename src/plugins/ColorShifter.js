class ColorShifter {

	constructor(
		color = { h: 0, s: 0, l: 100, a: 1 },
		speed = { h: 0.001 },
		output = ColorShifter.HEX
	) {

		var hsl = ColorShifter.hsl( color );
		this.hsl = hsl;

		this.progress = {
			h: hsl.h / 360,
			s: hsl.h / 100,
			l: hsl.h / 100,
			a: hsl.a
		};

		this.speed = {};
		if ( typeof speed === 'number' ) {

			this.speed.h = speed;
			this.speed.s = this.speed.l = this.speed.a = 0;

		} else {

			this.speed.h = speed.h || 0.001;
			this.speed.s = speed.s || 0;
			this.speed.l = speed.l || 0;
			this.speed.a = speed.a || 0;

		}

		this.output = output;

	}

	_updateProperty( name, scale ) {

		const speed = this.speed[ name ];

		if ( speed > 0 ) {

			let progress = this.progress[ name ];
			progress += speed;
			if ( progress > 1 ) progress --;
			this.progress[ name ] = progress;

			this.hsl[ name ] = Math.round( progress * scale );

		}

	}

	update() {

		this._updateProperty( 'h', 360 );
		this._updateProperty( 's', 100 );
		this._updateProperty( 'l', 100 );
		this._updateProperty( 'a', 1 );

	}

	get color() {

		switch ( this.output ) {

			case ColorShifter.HEX:
				return ColorShifter.hex( this.hsl );
			case ColorShifter.RGB:
				return ColorShifter.hsl2rgb( this.hsl );
			default:
				return this.hsl;

		}

	}

	set color( color ) {

		color = ColorShifter.hsl( color );
		if ( color ) this.hsl = color;

	}

}


/*-----------------------------------------------------------------------/

    Convert from RGB

/-----------------------------------------------------------------------*/

ColorShifter.RGB = 'rgb';
ColorShifter.HSL = 'hsl';
ColorShifter.HEX = 'hex';

/*-----------------------------------------------------------------------/

    Convert from RGB

/-----------------------------------------------------------------------*/

ColorShifter.rgb2hsl = ( rgb ) => {

	let r, g, b, h, s, l, a;

	if ( ! ColorShifter.check.rgb( rgb ) ) return null;

	r = rgb.r / 255;
	g = rgb.g / 255;
	b = rgb.b / 255;
	a = rgb.a || 1;

	const max = Math.max( r, g, b ), min = Math.min( r, g, b );
	l = ( max + min ) / 2;

	if ( max == min ) {

		h = s = 0; // achromatic

	} else {

		var d = max - min;
		s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );

		switch ( max ) {

			case r: h = ( g - b ) / d + ( g < b ? 6 : 0 ); break;
			case g: h = ( b - r ) / d + 2; break;
			case b: h = ( r - g ) / d + 4; break;

		}

		h /= 6;

	}

	h = Math.round( h * 360 );
	s = Math.round( s * 100 );
	l = Math.round( l * 100 );

	return { h: h, s: s, l: l, a: a };

};

ColorShifter.rgb2hex = ( rgb ) => {

	if ( ! ColorShifter.check.rgb( rgb ) ) return null;

	let value = rgb.b | ( rgb.g << 8 ) | ( rgb.r << 16 );
	return '#' + ( 0x1000000 + value ).toString( 16 ).slice( 1 );

};


/*-----------------------------------------------------------------------/

    Convert To RGB

/-----------------------------------------------------------------------*/

ColorShifter.hex2rgb = ( hex ) => {

	var rgba = {};

	if ( typeof hex === 'string' ) {

		const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace( rgx, ( m, r, g, b ) => r + r + g + g + b + b );
		const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
		rgba.r = parseInt( rgb[ 1 ], 16 );
		rgba.g = parseInt( rgb[ 2 ], 16 );
		rgba.b = parseInt( rgb[ 3 ], 16 );

	} else if ( typeof hex === 'number' ) {

		// Expecting 0xffffff format
		rgba.r = ( hex >> 16 ) & 255;
		rgba.g = ( hex >> 8 ) & 255;
		rgba.b = hex & 255;

	} else return null;

	rgba.a = 1;

	return rgba;

};

ColorShifter.hsl2rgb = ( hsl ) => {

	let h, s, l, a;

	if ( ! ColorShifter.check.hsl( hsl ) ) return null;

	h = hsl.h / 360;
	s = hsl.s / 100;
	l = hsl.l / 100;
	a = hsl.a || 1;

	function hue2rgb( p, q, t ) {

		if ( t < 0 ) t += 1;
		if ( t > 1 ) t -= 1;
		if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
		if ( t < 1 / 2 ) return q;
		if ( t < 2 / 3 ) return p + ( q - p ) * ( 2 / 3 - t ) * 6;
		return p;

	}

	let r, g, b;
	if ( s == 0 ) {

		r = g = b = l;

	} else {

		const q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb( p, q, h + 1 / 3 );
		g = hue2rgb( p, q, h );
		b = hue2rgb( p, q, h - 1 / 3 );

	}

	r = Math.round( r * 255 );
	g = Math.round( g * 255 );
	b = Math.round( b * 255 );

	return { r: r, g: g, b: b, a: a };

};


/*-----------------------------------------------------------------------/

    Shorthands

/-----------------------------------------------------------------------*/

ColorShifter.check = {
	rgb: color => color.r !== undefined && color.g !== undefined && color.b !== undefined,
	hsl: color => color.h !== undefined && color.s !== undefined && color.l !== undefined,
	hex: color => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test( color ),
};

ColorShifter.rgb = ( color ) => {

	if ( ColorShifter.check.hsl( color ) )
		return ColorShifter.hsl2rgb( color );

	if ( ColorShifter.check.hex( color ) )
		return ColorShifter.hex2rgb( color );

	if ( ColorShifter.check.rgb( color ) )
		return color;

	return null;

};

ColorShifter.hsl = ( color ) => {

	if ( ColorShifter.check.rgb( color ) )
		return ColorShifter.rgb2hsl( color );

	if ( ColorShifter.check.hex( color ) ) {

		color = ColorShifter.hex2rgb( color );
		return ColorShifter.rgb2hsl( color );

	}

	if ( ColorShifter.check.hsl( color ) )
		return color;

	return null;

};

ColorShifter.hex = ( color ) => {

	if ( ColorShifter.check.rgb( color ) )
		return ColorShifter.rgb2hex( color );

	if ( ColorShifter.check.hsl( color ) ) {

		color = ColorShifter.hsl2rgb( color );
		return ColorShifter.rgb2hex( color );

	}

	if ( ColorShifter.check.hex( color ) )
		return color;

	return null;

};


/*-----------------------------------------------------------------------/

    Export

/-----------------------------------------------------------------------*/

export { ColorShifter };
