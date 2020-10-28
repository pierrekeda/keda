import * as THREE from 'three';

import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';

class ReflectorPass extends ShaderPass {

	constructor( divisionsX = 2, divisionsY = 1 ) {

		let material = new THREE.ShaderMaterial( {
			uniforms: {
				tDiffuse: { value: null },
				uDivisions: { value: { x: divisionsX, y: divisionsY } },
			},
			vertexShader: ReflectorPass.VERT,
			fragmentShader: ReflectorPass.FRAG,
		} );

		super( material );

	}

	get divisionsX() {

		return this.material.uniforms[ 'uDivisions' ].value.x;

	}

	get divisionsY() {

		return this.material.uniforms[ 'uDivisions' ].value.y;

	}

	set divisionsX( value ) {

		if ( value < 1 ) value = 1;
		this.material.uniforms[ 'uDivisions' ].value.x = value;

	}

	set divisionsY( value ) {

		if ( value < 1 ) value = 1;
		this.material.uniforms[ 'uDivisions' ].value.y = value;

	}

}

ReflectorPass.VERT = /*glsl*/`

varying vec2 vUv;

void main() {

    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

`;

ReflectorPass.FRAG = /*glsl*/`

uniform sampler2D tDiffuse;
uniform vec2 uDivisions;

varying vec2 vUv;

void main() {

    vec2 uv = vUv;
    vec2 target = uv;

    float cellIndex, test;
    float cellWidth = 1.0 / uDivisions.x;
    
    if ( uv.x > cellWidth ) {
        cellIndex = ceil( uv.x * uDivisions.x );
        test = mod( cellIndex, 2.0 );
        if ( test == 0.0 ) target.x = cellIndex * cellWidth - uv.x;
        else  target.x = uv.x - ( cellIndex - 1.0 ) * cellWidth;
    }

    float cellHeight = 1.0 / uDivisions.y;
    
    if ( uv.y > cellHeight ) {
        cellIndex = ceil( uv.y * uDivisions.y );
        test = mod( cellIndex, 2.0 );
        if ( test == 0.0 ) target.y = cellIndex * cellHeight - uv.y;
        else  target.y = uv.y - ( cellIndex - 1.0 ) * cellHeight;
    }

    vec4 color = texture2D( tDiffuse, target );

    gl_FragColor = color;

}

`;

export { ReflectorPass };
