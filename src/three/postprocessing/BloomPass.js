import * as THREE from 'three';

import { UnrealBloomPass } from './jsm/postprocessing/UnrealBloomPass.js';
import { bayerMatrixDither } from '../../glsl/bayerMatrixDither.js';

class BloomPass extends UnrealBloomPass {

	constructor(
		strength = 1,
		radius = 0.1,
		threshold = 0.1,
		resolution = new THREE.Vector2( 256, 256 ),
	) {

		super( resolution, strength, radius, threshold );

	}

	getSeperableBlurMaterial( kernelRadius ) {

		return new THREE.ShaderMaterial( {

			defines: {
				'KERNEL_RADIUS': kernelRadius,
				'SIGMA': kernelRadius
			},

			uniforms: {
				'colorTexture': { value: null },
				'texSize': { value: new THREE.Vector2( 0.5, 0.5 ) },
				'direction': { value: new THREE.Vector2( 0.5, 0.5 ) }
			},

			vertexShader: /*glsl*/`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,

			fragmentShader: /*glsl*/`
			    #include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;

                ${ bayerMatrixDither }
				
				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}

				void main() {
					vec2 invSize = 1.0 / texSize;
					float fSigma = float(SIGMA);
					float weightSum = gaussianPdf(0.0, fSigma);
					vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianPdf(x, fSigma);
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
                    // gl_FragColor = vec4( diffuseSum/weightSum, 1.0);

                    vec3 result = diffuseSum/weightSum;
                    result = mix( result, bayerMatrixDither( result ), 0.2 );
					gl_FragColor = vec4( result, 1.0 );
				}`
		} );

	}

	getCompositeMaterial( nMips ) {

		return new THREE.ShaderMaterial( {

			defines: {
				'NUM_MIPS': nMips
			},

			uniforms: {
				'blurTexture1': { value: null },
				'blurTexture2': { value: null },
				'blurTexture3': { value: null },
				'blurTexture4': { value: null },
				'blurTexture5': { value: null },
				'dirtTexture': { value: null },
				'bloomStrength': { value: 1.0 },
				'bloomFactors': { value: null },
				'bloomTintColors': { value: null },
				'bloomRadius': { value: 0.0 }
			},

			vertexShader: /*glsl*/`
            varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,

			fragmentShader: /*glsl*/`
                varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform sampler2D dirtTexture;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];
				
				float lerpBloomFactor(const in float factor) { 
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

                ${ bayerMatrixDither }
				
				void main() {
                    vec4 result = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) + 
													 lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) + 
													 lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) + 
													 lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) + 
													 lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
					// gl_FragColor = vec4( bayerMatrixDither( result.xyz ), 1.0 );
					gl_FragColor = result;
                }
            `
		} );

	}

}

export { BloomPass };
