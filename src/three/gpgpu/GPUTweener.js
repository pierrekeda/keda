import * as THREE from 'three';
import { GPUComputer } from './GPUComputer.js';
import { transforms } from '../../glsl/transforms.js';
import { ease } from '../../glsl/ease.js';

/*-----------------------------------------------------------------------/

	TODO

	- Clean reverse functionality
	- Control methods ( play, pause ... )
	- Full ease implementation

/-----------------------------------------------------------------------*/

class GPUTweener {

	constructor( {

		length = 16384, // 128x128
		output = new THREE.MeshBasicMaterial(),

		delay = 0,
		duration = 500, // ms
		stagger = 50,
		// easing = GPUTweener.EASE.LINEAR,

		repeat = 0,
		loop = false,
		rewind = false,

		reversed = false,
		reverseSpeed = 1,

		scale = {
			start: { x: 1, y: 1, z: 1 },
			end: { x: 1, y: 1, z: 1 }
		},
		rotate = {
			start: { x: 0, y: 0, z: 0 },
			end: { x: 0, y: 0, z: 0 }
		},
		translate = {
			start: { x: 0, y: 0, z: 0 },
			end: { x: 0, y: 0, z: 0 }
		},
		x = null,
		y = null,
		z = null,

	} = {} ) {

		const size = GPUComputer.getRequiredSize( length );
		this.length = length;
		this.size = size;

		this.delay = delay;
		this.duration = ( duration < 0 ) ? 0 : duration;
		this.stagger = stagger;

		if ( duration === 0 ) repeat = rewind = 0;
		this.repeat = ( loop ) ? 255 : ( repeat < 255 ) ? repeat : 255;
		this.rewind = rewind;
		this.reversed = reversed;
		this.reverseSpeed = reverseSpeed;

		this.gpu = {};

		this._readTransformParameters( scale, rotate, translate, x, y, z );
		this._createProgressComputers();
		this._createTransformComputers();
		this._setupOutput( output );

	}

	/*-------------------------------------------------------------------/

        PRIVATE

    /-------------------------------------------------------------------*/

	_readTransformParameters( scale, rotate, translate, x, y, z ) {

		//// ALLOW { scale: 123 }

		if ( typeof scale === 'number' ) {

			scale = {
				start: { x: 1, y: 1, z: 1 },
				end: { x: scale, y: scale, z: scale }
			};

		}

		if ( typeof rotate === 'number' ) {

			rotate = {
				start: { x: 0, y: 0, z: 0 },
				end: { x: rotate, y: rotate, z: rotate }
			};

		}

		if ( typeof translate === 'number' ) {

			translate = {
				start: { x: 0, y: 0, z: 0 },
				end: { x: translate, y: translate, z: translate }
			};

		}

		//// ALLOW { scale: { start: 123 } }

		if ( typeof scale.start === 'number' ) {

			scale.start = { x: scale.start, y: scale.start, z: scale.start };

		}

		if ( typeof rotate.start === 'number' ) {

			rotate.start = { x: rotate.start, y: rotate.start, z: rotate.start };

		}

		if ( typeof translate.start === 'number' ) {

			translate.start = { x: translate.start, y: translate.start, z: translate.start };

		}

		//// ALLOW { scale: { end: 123 } }

		if ( typeof scale.end === 'number' ) {

			scale.end = { x: scale.end, y: scale.end, z: scale.end };

		}

		if ( typeof rotate.end === 'number' ) {

			rotate.end = { x: rotate.end, y: rotate.end, z: rotate.end };

		}

		if ( typeof translate.end === 'number' ) {

			translate.end = { x: translate.end, y: translate.end, z: translate.end };

		}

		//// MAKE SURE ALL PARAMETERS ARE DEFINED

		if ( scale.start === undefined ) scale.start = { x: 1, y: 1, z: 1 };
		if ( scale.end === undefined ) scale.end = { x: 1, y: 1, z: 1 };
		if ( scale.start.x === undefined ) scale.start.x = 1;
		if ( scale.start.y === undefined ) scale.start.y = 1;
		if ( scale.start.z === undefined ) scale.start.z = 1;
		if ( scale.end.x === undefined ) scale.end.x = 1;
		if ( scale.end.y === undefined ) scale.end.y = 1;
		if ( scale.end.z === undefined ) scale.end.z = 1;

		if ( rotate.start === undefined ) rotate.start = { x: 0, y: 0, z: 0 };
		if ( rotate.end === undefined ) rotate.end = { x: 0, y: 0, z: 0 };
		if ( rotate.start.x === undefined ) rotate.start.x = 0;
		if ( rotate.start.y === undefined ) rotate.start.y = 0;
		if ( rotate.start.z === undefined ) rotate.start.z = 0;
		if ( rotate.end.x === undefined ) rotate.end.x = 0;
		if ( rotate.end.y === undefined ) rotate.end.y = 0;
		if ( rotate.end.z === undefined ) rotate.end.z = 0;

		if ( translate.start === undefined ) translate.start = { x: 0, y: 0, z: 0 };
		if ( translate.end === undefined ) translate.end = { x: 0, y: 0, z: 0 };
		if ( translate.start.x === undefined ) translate.start.x = 0;
		if ( translate.start.y === undefined ) translate.start.y = 0;
		if ( translate.start.z === undefined ) translate.start.z = 0;
		if ( translate.end.x === undefined ) translate.end.x = 0;
		if ( translate.end.y === undefined ) translate.end.y = 0;
		if ( translate.end.z === undefined ) translate.end.z = 0;

		//// ALLOW { x: 123 } AS SHORTHAND FOR { translate: { x: 123 } }

		if ( x ) translate.end.x = x;
		if ( y ) translate.end.y = y;
		if ( z ) translate.end.z = z;

		//// SET PROPERTIES

		this.scale = scale;
		this.rotate = rotate;
		this.translate = translate;

	}

	_createProgressComputers() {

		const size = this.size;
		const duration = this.duration;

		this.gpu.stagger = new GPUComputer(
			this._createStaggerData( this.stagger ),
			GPUTweener.GLSL.STAGGER,
			{ uDelta: { value: 0 }, }
		);

		this.gpu.elapsed = new GPUComputer( size, GPUTweener.GLSL.ELAPSED, {
			uDelta: { value: 0 },
			uDuration: { value: duration },
			uReverseSpeed: { value: - this.reverseSpeed },
			tStagger: { value: null },
			tLoop: { value: null },
		} );
		if ( this.reversed ) this.setElapsedTime( duration );


		this.gpu.progress = new GPUComputer( size, GPUTweener.GLSL.PROGRESS, {
			uDuration: { value: duration },
			tElapsed: { value: null }
		} );

		const rewind = ( this.rewind ) ? 1 : 0;
		const reversed = ( this.reversed ) ? 255 : 0;
		this.gpu.loop = new GPUComputer(
			this._createLoopData( this.repeat, reversed ),
			GPUTweener.GLSL.LOOP, {
				uRewind: { value: rewind },
				tProgress: { value: null },
			}, false
		);

	}

	_createTransformComputer( transform, axis ) {

		const start = this[ transform ].start[ axis ];
		const end = this[ transform ].end[ axis ];

		return new GPUComputer(
			this.size,
			GPUTweener.GLSL.TRANSFORM,
			{
				uStart: { value: start },
				uChange: { value: end - start },
				tProgress: { value: null },
			}
		);

	}

	_createTransformComputers() {

		let transforms = {};

		transforms.scaleX = this._createTransformComputer( 'scale', 'x' );
		transforms.scaleY = this._createTransformComputer( 'scale', 'y' );
		transforms.scaleZ = this._createTransformComputer( 'scale', 'z' );

		transforms.rotateX = this._createTransformComputer( 'rotate', 'x' );
		transforms.rotateY = this._createTransformComputer( 'rotate', 'y' );
		transforms.rotateZ = this._createTransformComputer( 'rotate', 'z' );

		transforms.translateX = this._createTransformComputer( 'translate', 'x' );
		transforms.translateY = this._createTransformComputer( 'translate', 'y' );
		transforms.translateZ = this._createTransformComputer( 'translate', 'z' );

		this.gpu.transforms = transforms;

	}

	_setupOutput( output ) {

		output.onBeforeCompile = this._onBeforeCompile.bind( this );

		output.uniforms = {};

		output.uniforms.tScaleX = { value: null };
		output.uniforms.tScaleY = { value: null };
		output.uniforms.tScaleZ = { value: null };

		output.uniforms.tRotateX = { value: null };
		output.uniforms.tRotateY = { value: null };
		output.uniforms.tRotateZ = { value: null };

		output.uniforms.tTranslateX = { value: null };
		output.uniforms.tTranslateY = { value: null };
		output.uniforms.tTranslateZ = { value: null };

		this.output = output;

	}

	_onBeforeCompile( shader ) {

		shader.uniforms.tScaleX = { value: null };
		shader.uniforms.tScaleY = { value: null };
		shader.uniforms.tScaleZ = { value: null };

		shader.uniforms.tRotateX = { value: null };
		shader.uniforms.tRotateY = { value: null };
		shader.uniforms.tRotateZ = { value: null };

		shader.uniforms.tTranslateX = { value: null };
		shader.uniforms.tTranslateY = { value: null };
		shader.uniforms.tTranslateZ = { value: null };

		let token, insert;

		token = '#include <common>';
		insert = GPUTweener.GLSL.OUTPUT_DECLARATIONS;
		shader.vertexShader = shader.vertexShader.replace( token, token + insert );

		token = '#include <begin_vertex>';
		insert = GPUTweener.GLSL.OUTPUT_TRANSFORM;
		shader.vertexShader = shader.vertexShader.replace( token, insert );

		this.output = shader;

	}

	_createStaggerData( stagger ) {

		let data = new Float32Array( this.size * this.size );

		for ( let i = 0, l = data.length; i < l; i ++ ) {

			data[ i ] = stagger * i;

		}

		return data;

	}

	_createLoopData( repeat, reversed ) {

		let data = new Uint8Array( this.size * this.size * 4 );

		for ( let i = 0, l = data.length; i < l; i += 4 ) {

			data[ i ] = repeat;
			data[ i + 1 ] = reversed; // reversed
			// data[ i + 2 ] = 0; // reset
			// data[ i + 3 ] = 0; //

		}

		return data;

	}

	_compute() {

		let output = this.output;
		let transforms = this.gpu.transforms;
		let progress = this.gpu.progress.texture;

		for ( let i in transforms ) {

			let transform = transforms[ i ];
			transform.update( 'tProgress', progress );
			transform.compute();

		}

		output.uniforms.tScaleX.value = transforms.scaleX.texture;
		output.uniforms.tScaleY.value = transforms.scaleY.texture;
		output.uniforms.tScaleZ.value = transforms.scaleZ.texture;

		output.uniforms.tRotateX.value = transforms.rotateX.texture;
		output.uniforms.tRotateY.value = transforms.rotateY.texture;
		output.uniforms.tRotateZ.value = transforms.rotateZ.texture;

		output.uniforms.tTranslateX.value = transforms.translateX.texture;
		output.uniforms.tTranslateY.value = transforms.translateY.texture;
		output.uniforms.tTranslateZ.value = transforms.translateZ.texture;

	}

	/*-------------------------------------------------------------------/

        PUBLIC

    /-------------------------------------------------------------------*/

	update( delta = 16.67 ) {

		if ( this.delay > 0 ) {

			this.delay -= delta;
			if ( this.delay > 0 ) return;

		}

		if ( this.delay < 0 ) {

			delta += this.delay;
			this.delay = 0;

		}

		let stagger = this.gpu.stagger;
		let elapsed = this.gpu.elapsed;
		let loop = this.gpu.loop;
		let progress = this.gpu.progress;

		stagger.update( 'uDelta', delta );
		elapsed.update( 'uDelta', delta );

		stagger.compute();
		elapsed.update( 'tStagger', stagger.texture );

		loop.compute();
		elapsed.update( 'tLoop', loop.texture );

		elapsed.compute();
		progress.update( 'tElapsed', elapsed.texture );

		progress.compute();
		loop.update( 'tProgress', progress.texture );

		this._compute();

	}

	setElapsedTime( time ) {

		let data = [ time ];
		let buffer = new Uint8Array( 4 );
		GPUComputer.pack( data, buffer );

		let target = this.elapsed.tData.image.data;
		for ( let i = 0, l = target.length; i < l; i += 4 ) {

			target[ i ] = data[ 0 ];
			target[ i + 1 ] = data[ 1 ];
			target[ i + 2 ] = data[ 2 ];
			target[ i + 3 ] = data[ 3 ];

		}

	}

}


/*-----------------------------------------------------------------------/

	GLSL

/-----------------------------------------------------------------------*/

GPUTweener.GLSL = {};

GPUTweener.GLSL.OUTPUT_DECLARATIONS = /* glsl */`

	attribute vec2 reference;

	uniform sampler2D tScaleX;
	uniform sampler2D tScaleY;
	uniform sampler2D tScaleZ;

	uniform sampler2D tRotateX;
	uniform sampler2D tRotateY;
	uniform sampler2D tRotateZ;

	uniform sampler2D tTranslateX;
	uniform sampler2D tTranslateY;
	uniform sampler2D tTranslateZ;

	${GPUComputer.FLOAT_PACKING}

	${transforms}

`;

GPUTweener.GLSL.OUTPUT_TRANSFORM = /* glsl */`

	float gpgpuScaleX = unpack( texture2D( tScaleX, reference.xy ) );
	float gpgpuScaleY = unpack( texture2D( tScaleY, reference.xy ) );
	float gpgpuScaleZ = unpack( texture2D( tScaleZ, reference.xy ) );

	float gpgpuRotateX = unpack( texture2D( tRotateX, reference.xy ) );
	float gpgpuRotateY = unpack( texture2D( tRotateY, reference.xy ) );
	float gpgpuRotateZ = unpack( texture2D( tRotateZ, reference.xy ) );

	float gpgpuTranslateX = unpack( texture2D( tTranslateX, reference.xy ) );
	float gpgpuTranslateY = unpack( texture2D( tTranslateY, reference.xy ) );
	float gpgpuTranslateZ = unpack( texture2D( tTranslateZ, reference.xy ) );

	vec3 gpgpuPosition = position;

	gpgpuPosition *= scale( gpgpuScaleX, gpgpuScaleY, gpgpuScaleZ );

	gpgpuPosition *= rotateX( gpgpuRotateX );
	gpgpuPosition *= rotateY( gpgpuRotateY );
	gpgpuPosition *= rotateZ( gpgpuRotateZ );

	gpgpuPosition += vec3( gpgpuTranslateX, gpgpuTranslateY, gpgpuTranslateZ );

	vec3 transformed = gpgpuPosition;

`;

GPUTweener.GLSL.TRANSFORM = /*glsl*/`

	uniform float uStart;
	uniform float uChange;
	uniform sampler2D tProgress;

	${ GPUComputer.FLOAT_PACKING }

	void main() {

		vec2 uv = gl_FragCoord.xy / resolution.xy;
		float progress = unpack( texture2D( tProgress, uv ) );

		float data = uStart + uChange * progress;

		gl_FragColor = pack( data );

	}

`;

GPUTweener.GLSL.STAGGER = /*glsl*/`

	uniform float uDelta;
	uniform sampler2D tData;

	${ GPUComputer.FLOAT_PACKING }

	void main() {

		vec2 uv = gl_FragCoord.xy / resolution.xy;
		float data = unpack( texture2D( tData, uv ) );

		if ( data > 0.0 ) data -= uDelta;
		else if ( data < 0.0 ) data = 0.0;

		gl_FragColor = pack( data );

	}

`;

GPUTweener.GLSL.ELAPSED = /*glsl*/`

	uniform float uDelta;
	uniform float uDuration;
	uniform float uReverseSpeed;
	uniform sampler2D tData;
	uniform sampler2D tStagger;
	uniform sampler2D tLoop;

	${ GPUComputer.FLOAT_PACKING }

	void main() {

		vec2 uv = gl_FragCoord.xy / resolution.xy;
		float data = unpack( texture2D( tData, uv ) );
		float stagger = unpack( texture2D( tStagger, uv ) );

		vec4 loop = texture2D( tLoop, uv );
		float reversed = loop.y;
		float reset = loop.z;

		if ( stagger < 0.0 ) {

			data -= stagger;

		} else if ( stagger == 0.0 ) {

			if ( reset == 1.0 ) {

				data = 0.0;

			} else if ( reversed == 0.0 ) {

				data += uDelta;

			} else {

				data += uDelta * uReverseSpeed;
				if ( data < 0.0 ) data = 0.0;

			}

		}

		if ( data > uDuration ) data = uDuration;

		gl_FragColor = pack( data );

	}

`;

GPUTweener.GLSL.PROGRESS = /*glsl*/`

	uniform float uDuration;
	uniform sampler2D tData;
	uniform sampler2D tElapsed;

	${ GPUComputer.FLOAT_PACKING }
	${ ease.circOut }

	void main() {

		vec2 uv = gl_FragCoord.xy / resolution.xy;
		float data = unpack( texture2D( tData, uv ) );

		if ( uDuration == 0.0 ) data = 1.0;
		else {
			float elapsed = unpack( texture2D( tElapsed, uv ) );
			data = circOut( elapsed / uDuration );
		}

		gl_FragColor = pack( data );

	}

`;

GPUTweener.GLSL.LOOP = /*glsl*/`
    
	uniform float uRewind;
	uniform sampler2D tData;
	uniform sampler2D tProgress;

	${ GPUComputer.FLOAT_PACKING }

    void main () {

        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float progress = unpack( texture2D( tProgress, uv ) );

        vec4 loop = texture2D( tData, uv );
        float repeat = loop.x * 255.0;
        float reversed = loop.y;
        float reset = loop.z;
		
		if ( uRewind == 1.0 ) {

			if ( progress == 1.0 ) {

				reversed = 1.0;

			} else if ( progress == 0.0 && reversed == 1.0 ) {

				if ( repeat > 0.0 && repeat < 255.0 ) repeat -= 1.0;
				reversed = ( repeat > 0.0 ) ? 0.0 : 1.0;

			}

		} else {

			if ( progress == 1.0 && reset == 0.0 ) {

				if ( repeat > 0.0 && repeat < 255.0 ) repeat -= 1.0;
				reset = ( repeat > 0.0 ) ? 1.0 : 0.0;

			} else if ( reset == 1.0 ) {

				reset = 0.0;

			}

		}

		repeat /= 255.0;

        gl_FragColor = vec4( repeat, reversed, reset, 1.0 );

    }

`;

GPUTweener.EASE = {

	LINEAR: 'linear',

};

export { GPUTweener };
