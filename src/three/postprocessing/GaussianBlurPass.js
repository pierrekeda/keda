import * as THREE from 'three';

import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { vUv } from '../../glsl/shaders/vertex/vUv.js';
import { bayerMatrixDither } from '../../glsl/bayerMatrixDither.js';

class GaussianBlurPass extends ShaderPass {

	constructor(
		size = 8,
		quality = 4,
		direction = 16,
		dither = true,
		resolution,
	) {

		resolution = resolution
            || new THREE.Vector2( window.innerWidth, window.innerHeight );

		super( new THREE.ShaderMaterial( {
			uniforms: {
				tDiffuse   : { value: null },
				uResolution: { value: resolution },
				uSize  : { value: size * window.devicePixelRatio },
				uQuality  : { value: quality },
				uDirection  : { value: direction },
			},
			vertexShader: vUv,
			fragmentShader: GaussianBlurPass.frag
		} ) );

		this.dither = dither;

	}

	setSize( width, height ) {

		this.material.uniforms.uResolution.value = new THREE.Vector2( width, height );


	}

	get dither() {

		return this._dither;

	}

	set dither( value ) {

		let fragmentShader = `${ GaussianBlurPass.frag }`;
		if ( value ) fragmentShader = fragmentShader.replace(
			'//dither//', 'color.xyz = bayerMatrixDither( color.xyz );'
		);
		this.material.fragmentShader = fragmentShader;
		this.material.needsUpdate = true;

		this._dither = value;

	}

	get size() {

		return this.material.uniforms.uSize.value;

	}

	get quality() {

		return this.material.uniforms.uQuality.value;

	}

	get direction() {

		return this.material.uniforms.uDirection.value;

	}

	set size( value ) {

		this.material.uniforms.uSize.value = value * window.devicePixelRatio;

	}

	set quality( value ) {

		this.material.uniforms.uQuality.value = value;

	}

	set direction( value ) {

		this.material.uniforms.uDirection.value = value;

	}

}

GaussianBlurPass.frag = /*glsl*/`
        
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uDirection;
    uniform float uQuality;
    uniform float uSize;
    varying vec2 vUv;

    ${ bayerMatrixDither }

    void main() {

        vec2 uv = vUv;
        vec4 color = texture2D( tDiffuse, uv );

        // Gaussian Blur Shader
        // by existical - https://www.shadertoy.com/view/Xltfzj
        // edited by Pierre Keda

        const float PI_2 = 6.28318530718; // Pi*2
        float piStep = PI_2 / uDirection;
        float qualityStep = 1.0 / uQuality;
        vec2 radius = uSize / uResolution.xy;
        
        for( float d = 0.0; d < PI_2; d += piStep ) {

            for( float i = qualityStep; i <= 1.0; i += qualityStep ) {

                color += texture2D(
                    tDiffuse, uv + vec2( cos( d ), sin( d ) ) * radius * i
                );

            }

        }
        
        color /= uQuality * uDirection - 15.0;

        //

        //dither//
        
        gl_FragColor =  color;

    }

`;

export { GaussianBlurPass };
