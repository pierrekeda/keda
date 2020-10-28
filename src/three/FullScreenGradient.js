import * as THREE from 'three';

import { vUv } from '../glsl/shaders/vertex/vUv.js';
import { bayerMatrixDither } from '../glsl/bayerMatrixDither.js';
import { linearGradient } from '../glsl/linearGradient.js';

class FullScreenGradient extends THREE.Mesh {

	constructor(
		color1 = 0xffffff,
		color2 = 0x000000, angle = 0,
		dither = true
	) {

		let uniforms = {
			uAngle:  { value: angle },
			uColor1: { value: new THREE.Color( color1 ) },
			uColor2: { value: new THREE.Color( color2 ) },
		};

		super(
			new THREE.PlaneGeometry( 2, 2 ),
			new THREE.ShaderMaterial( {
				vertexShader: vUv,
				uniforms: uniforms,
				depthWrite: false,
				depthTest: false,
			} )
		);

		this.dither = dither;

	}


	get angle() {

		return this.material.uniforms.uAngle.value;

	}

	set angle( value ) {

		this.material.uniforms.uAngle.value = value;

	}

	get dither() {

		return this._dither;

	}

	set dither( value ) {

		let fragmentShader = `${FullScreenGradient.frag}`;
		if ( value ) fragmentShader = fragmentShader.replace(
			'//dither//', 'color = bayerMatrixDither( color );'
		);
		this.material.fragmentShader = fragmentShader;
		this.material.needsUpdate = true;

		this._dither = value;

	}

	get color1() {

		return '#' + this.material.uniforms.uColor1.value.getHexString();

	}

	set color1( value ) {

		this.material.uniforms.uColor1.value = new THREE.Color( value );

	}

	get color2() {

		return '#' + this.material.uniforms.uColor2.value.getHexString();

	}

	set color2( value ) {

		this.material.uniforms.uColor2.value = new THREE.Color( value );

	}

}

FullScreenGradient.frag = /*glsl*/`

    uniform float uAngle;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    varying vec2 vUv;

    ${ linearGradient }
    ${ bayerMatrixDither }

    void main() {

        vec2 uv = vUv;
        
        vec2 origin = vec2( 0.5, 0.5 );
        vec2 target = uv - origin;
        vec3 color = linearGradient( 
            origin, target, uColor1, uColor2, uAngle
        );
        
        //dither//

        gl_FragColor = vec4( color, 1.0 );
        
    }

`;

export { FullScreenGradient };
