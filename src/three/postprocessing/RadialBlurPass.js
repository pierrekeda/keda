import * as THREE from 'three';

import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { vUv } from '../../glsl/shaders/vertex/vUv.js';
import { bayerMatrixDither } from '../../glsl/bayerMatrixDither.js';

class RadialBlurPass extends ShaderPass {

	constructor(
		strength = 0.2,
		origin = RadialBlurPass.CENTER,
		dither = true,
		resolution
	) {

		resolution = resolution
            || new THREE.Vector2( window.innerWidth, window.innerHeight );

		origin = origin || RadialBlurPass.CENTER;
		const mode = ( origin === RadialBlurPass.CENTER )
			? RadialBlurPass.CENTER : RadialBlurPass.FIXED;
		if ( mode === RadialBlurPass.CENTER || ! ( origin instanceof THREE.Vector2 )  )
			origin = new THREE.Vector2( resolution.x / 2, resolution.y / 2 );

		super( new THREE.ShaderMaterial( {
			uniforms: {
				tDiffuse   : { value: null },
				uOrigin    : { value: origin },
				uResolution: { value: resolution },
				uStrength  : { value: strength },
			},
			vertexShader: vUv,
			fragmentShader: RadialBlurPass.frag
		} ) );

		this.mode = mode;
		this.dither = dither;

	}

	setSize( width, height ) {

		this.material.uniforms.uResolution.value = new THREE.Vector2( width, height );

		if ( this.mode === RadialBlurPass.CENTER )
			this.material.uniforms.uOrigin.value = new THREE.Vector2(
				width / 2, height / 2
			);

	}

	get dither() {

		return this._dither;

	}

	set dither( value ) {

		let fragmentShader = `${ RadialBlurPass.frag }`;
		if ( value ) fragmentShader = fragmentShader.replace(
			'//dither//', 'color.xyz = bayerMatrixDither( color.xyz );'
		);
		this.material.fragmentShader = fragmentShader;
		this.material.needsUpdate = true;

		this._dither = value;

	}

	get strength() {

		return this.material.uniforms.uStrength.value;

	}

	set strength( value ) {

		this.material.uniforms.uStrength.value = value;

	}

	get x() {

		return this.material.uniforms.uOrigin.value.x;

	}

	set x( value ) {

		this.material.uniforms.uOrigin.value.x = value;

	}

	get y() {

		return this.material.uniforms.uOrigin.value.y;

	}

	set y( value ) {

		this.material.uniforms.uOrigin.value.y = value;

	}

}

RadialBlurPass.CENTER = 'center';
RadialBlurPass.FIXED  = 'fixed';

RadialBlurPass.frag = /*glsl*/`
        
    uniform sampler2D tDiffuse;
    uniform vec2 uOrigin;
    uniform vec2 uResolution;
    uniform float uStrength;
    varying vec2 vUv;

    ${ bayerMatrixDither }

    float random( vec3 scale, float seed ){ return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453+seed);}

    void main() {

        vec2 uv = vUv;

        vec4 color = vec4( 0.0 );
        float total = 0.0;
        vec2 toCenter = uOrigin - vUv * uResolution;
        float offset = random( vec3( 12.9898, 78.233, 151.7182 ), 0.0);
        for( float t=0.0; t <= 40.0; t++ ){
            float percent = ( t + offset ) / 40.0;
            float weight = 4.0 * ( percent - percent * percent );
            vec4 blurSample = texture2D(
                tDiffuse, 
                vUv + toCenter * percent * uStrength / uResolution
            );
            blurSample.rgb *= blurSample.a;
            color += blurSample * weight;
            total += weight;
        }
        color /= total;

        //dither//

        gl_FragColor = color;

        // gl_FragColor = color/total;
        // gl_FragColor.rgb /= gl_FragColor.a + 0.00001;

        // vec4 color = texture2D( tDiffuse, uv );
        // gl_FragColor = color;

    }

`;

export { RadialBlurPass };
