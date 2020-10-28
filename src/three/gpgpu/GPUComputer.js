import * as THREE from 'three';

class GPUComputer {

	constructor( data, shader = GPUComputer.DEFAULT_FRAGMENT,
		uniforms = {}, dataNeedsPacking = true ) {

		//// Init Check

		if ( ! GPUComputer.renderer ) {

			throw new Error( 'GPUComputer : use GPUComputer.init( renderer ) before instancing.' );

		}

		//// DataTexture

		const dataIsArray = ( data.length !== undefined );
		const dataLength = dataIsArray
			? dataNeedsPacking ? data.length : data.length / 4
			: data;
		const size = ( dataIsArray )
			? GPUComputer.getRequiredSize( dataLength )
			: data;
		this._size = size;

		this.tData = GPUComputer.createTexture( size );
		uniforms.tData = { value: this.tData };

		this._buffer = this.tData.image.data;
		this._data = ( dataIsArray ) ? data : new Float32Array( size * size );
		this._dataIsPacked = true;

		if ( dataIsArray ) {

			if ( dataNeedsPacking ) {

				GPUComputer.pack( data, this.tData.image.data );

			} else {

				this.tData.image.data = data;
				this._dataIsPacked = false;

			}

		}

		//// ShaderMaterial

		this.material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: GPUComputer.DEFAULT_VERTEX,
			fragmentShader: shader
		} );
		const floatSize = size.toFixed( 1 );
		this.material.defines.resolution =
			/*glsl*/`vec2( ${floatSize}, ${floatSize} )`;

		//// RenderTarget

		function createRenderTarget() {

			return new THREE.WebGLRenderTarget( size, size, {
				wrapS: THREE.ClampToEdgeWrapping,
				wrapT: THREE.ClampToEdgeWrapping,
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				stencilBuffer: false,
				depthBuffer: false,
				format: THREE.RGBAFormat,
				type: THREE.UnsignedByteType,
			} );

		}

		//// Toggling between 2 RenderTargets to avoid framebuffer feedback loop

		this._rt1 = createRenderTarget();
		this._rt2 = createRenderTarget();
		this.renderTarget = this._rt1;

	}

	compute() {

		GPUComputer.render( this.material, this.renderTarget );

		this.material.uniforms.tData.value = this.renderTarget.texture;

		this.renderTarget = ( this.renderTarget === this._rt1 ) ?
			this._rt2 : this._rt1;

	}

	update( uniform, value ) {

		this.material.uniforms[ uniform ].value = value;

	}

	/*-------------------------------------------------------------------/

        GETTER / SETTERS

    /-------------------------------------------------------------------*/

	// TODO size setter

	get size() {

		return this._size;

	}

	get texture() {

		return this.material.uniforms.tData.value;

	}

	get data() {

		// This is slow and intended for debugging only

		GPUComputer.renderer.readRenderTargetPixels(
			this.renderTarget, 0, 0, this._size, this._size, this._buffer
		);

		if ( this._dataIsPacked ) {

			GPUComputer.unpack( this._buffer, this._data );
			return this._data;

		}

		return this._buffer;

	}

}


/*-----------------------------------------------------------------------/

    STATIC CORE

/-----------------------------------------------------------------------*/

GPUComputer.init = ( renderer ) => {

	GPUComputer.isCompatible = false;

	if ( ! GPUComputer.renderer ) {

		GPUComputer.renderer = renderer;

		GPUComputer.scene = new THREE.Scene();
		GPUComputer.camera = new THREE.Camera();
		GPUComputer.mesh = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 2, 2 )
		);
		GPUComputer.scene.add( GPUComputer.mesh );

		// Compatibility check

		if ( renderer.capabilities.maxVertexTextures === 0 ) {

			console.warn( 'GPUComputer.init(): No support for vertex shader textures.' );
			return GPUComputer.isCompatible;

		}

		GPUComputer.isCompatible = true;

	}

	if ( ! GPUComputer.isCompatible ) {

		window.alert( 'Your hardware is not compatible with this app.' );

	}

	return GPUComputer.isCompatible;

};

GPUComputer.render = ( material, renderTarget ) => {

	GPUComputer.mesh.material = material;
	GPUComputer.renderer.setRenderTarget( renderTarget );
	GPUComputer.renderer.render( GPUComputer.scene, GPUComputer.camera );
	GPUComputer.renderer.setRenderTarget( null );

};


/*-----------------------------------------------------------------------/

    STATIC FLOAT PACKING / UNPACKING

/-----------------------------------------------------------------------*/

GPUComputer.pack = ( data, buffer ) => {

	if ( ! buffer ) buffer = new Uint8Array( data.length * 4 );

	let value, mag, exponent, exp2, mantissa, g, b;

	for ( let i = 0, j = 0, l = data.length; i < l; i ++ ) {

		value = data[ i ];

		if ( value !== 0 ) {

			mag = Math.abs( value );

			exponent = Math.floor( Math.log2( mag ) );
			exp2 = Math.pow( 2, exponent );
			exponent += ( exp2 <= mag / 2 );
			exponent -= ( exp2 > mag );

			mantissa = ( exponent > 100 )
				? mag / 1024 / Math.pow( 2, exponent - 10 ) - 1
				: mag / exp2 - 1;

			buffer[ j ] = exponent + 127;
			mantissa *= 256;

			g = Math.floor( mantissa );
			buffer[ j + 1 ] = g;
			mantissa = ( mantissa - g ) * 256;

			b = Math.floor( mantissa );
			buffer[ j + 2 ] = b;
			mantissa = ( mantissa - b ) * 128;

			buffer[ j + 3 ] = Math.floor( mantissa ) * 2 + ( value < 0 );

		}

		j += 4;

	}

	return buffer;

};

GPUComputer.unpack = ( buffer, data ) => {

	let r, g, b, a, exponent, sign, mantissa, float;

	if ( ! data ) data = new Float32Array( buffer.length / 4 );

	for ( let i = 0, j = 0, l = buffer.length; i < l; i += 4 ) {

		r = buffer[ i ];
		g = buffer[ i + 1 ];
		b = buffer[ i + 2 ];
		a = buffer[ i + 3 ];

		exponent = r - 127;
		sign = 1 - ( a % 2 ) * 2;
		mantissa = ( r > 0.0 ) + g / 256 + b / 65536 + Math.floor( a / 2.0 )
            / 8388608;

		float = sign * mantissa * Math.pow( 2, exponent );

		data[ j ] = float;

		j ++;

	}

};

GPUComputer.FLOAT_PACKING = /*glsl*/`

    vec4 pack( float value ) {

        if ( value == 0.0 ) return vec4( 0.0, 0.0, 0.0, 0.0 );

        float mag = abs( value );
        
        float exponent = floor( log2( mag ) );
        exponent += float( exp2( exponent ) <= mag / 2.0 );
        exponent -= float( exp2( exponent ) > mag );

        float mantissa = ( exponent > 100.0 )
            ? mag / 1024.0 / exp2( exponent - 10.0 ) - 1.0
            : mag / float( exp2( exponent ) ) - 1.0;

        float r = exponent + 127.0;
        mantissa *= 256.0;

        float g = floor( mantissa );
        mantissa -= g;
        mantissa *= 256.0;

        float b = floor( mantissa );
        mantissa -= b;
        mantissa *= 128.0;

        float a = floor( mantissa ) * 2.0 + float( value < 0.0 );

        return vec4( r, g, b, a ) / 255.0;

    }

    float unpack( vec4 value ) {

        float r = floor( value.r * 255.0 + 0.5 );
        float g = floor( value.g * 255.0 + 0.5 );
        float b = floor( value.b * 255.0 + 0.5 );
        float a = floor( value.a * 255.0 + 0.5 );

        float exponent = r - 127.0;
        float sign = 1.0 - mod( a, 2.0 ) * 2.0;
        float mantissa = float( r > 0.0 ) + g / 256.0 + b / 65536.0
            + floor( a / 2.0 ) / 8388608.0;
        return sign * mantissa * exp2( exponent );

    }

`;


/*-----------------------------------------------------------------------/

    STATIC MISC

/-----------------------------------------------------------------------*/

GPUComputer.DEFAULT_VERTEX = /*glsl*/`

    void main() {

        gl_Position = vec4( position, 1.0 );

    }

`;

GPUComputer.DEFAULT_FRAGMENT = /*glsl*/`

    uniform sampler2D tData;

    ${ GPUComputer.FLOAT_PACKING }

    void main() {
        
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float data = unpack( texture2D( tData, uv ) );

        // edit data...

        gl_FragColor = pack( data );

    }

`;

GPUComputer.createTexture = ( size ) => {

	return new THREE.DataTexture(
		new Uint8Array( size * size * 4 ),
		size, size, THREE.RGBAFormat, THREE.UnsignedByteType
	);

};

GPUComputer.getRequiredSize = ( length ) => {

	if ( length <= 0 || length === Infinity ) {

		throw new RangeError( 'GPUComputer.getRequiredSize(): length must be a positive integer.' );

	}

	let n = 1;
	let size = 2;

	while ( size * size < length ) {

		size = Math.pow( 2, n );
		n ++;

	}

	return size;

};

GPUComputer.cleanFloat = ( float ) => {

	return Math.round( float * 1e6 ) / 1e6;

};


/*-----------------------------------------------------------------------/

    MODULE EXPORT

/-----------------------------------------------------------------------*/

export { GPUComputer };
