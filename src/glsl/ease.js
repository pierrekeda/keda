let ease = {};

ease.linear = /*glsl*/`

	float linear( float t ) {

		return t;

	}

`;

ease.quadInOut = /*glsl*/`

	float quadInOut( float t ) {

		return t < 0.5
            ? pow( t * 2.0, 2.0 ) / 2.0
            : 1.0 - pow( t * -2.0 + 2.0, 2.0 ) / 2.0;

	}

`;

ease.cubicInOut = /*glsl*/`

	float cubicInOut( float t ) {

		return t < 0.5
            ? pow( t * 2.0, 3.0 ) / 2.0
            : 1.0 - pow( t * -2.0 + 2.0, 3.0 ) / 2.0;

	}

`;

ease.quartInOut = /*glsl*/`

	float quartInOut( float t ) {

		return t < 0.5
            ? pow( t * 2.0, 4.0 ) / 2.0
            : 1.0 - pow( t * -2.0 + 2.0, 4.0 ) / 2.0;

	}

`;

ease.quintInOut = /*glsl*/`

	float quintInOut( float t ) {

		return t < 0.5
            ? pow( t * 2.0, 5.0 ) / 2.0
            : 1.0 - pow( t * -2.0 + 2.0, 5.0 ) / 2.0;

	}

`;

ease.circInOut = /*glsl*/`

	float circInOut( float t ) {

		return t < 0.5
            ? ( 1.0 - sqrt( 1.0 - t * t * 4.0 ) ) / 2.0
            : ( sqrt( ( 3.0 - 2.0 * t ) * ( 2.0 * t - 1.0 ) ) + 1.0 ) / 2.0;

	}

`;

ease.expoInOut = /*glsl*/`

	float expoInOut( float t ) {

		return t == 0.0 || t == 1.0
            ? t
            : t < 0.5
            ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
            : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;

	}

`;

ease.sineInOut = /*glsl*/`

	#ifndef PI
	#define PI 3.141592653589793
	#endif

	float sineInOut( float t ) {

		return -0.5 * (cos(PI * t) - 1.0);

	}

`;

ease.backInOut = /*glsl*/`

	#ifndef PI
	#define PI 3.141592653589793
	#endif

	float backInOut( float t ) {

		float f = t < 0.5
            ? 2.0 * t
            : 1.0 - ( 2.0 * t - 1.0 );

        float g = pow( f, 3.0 ) - f * sin( f * PI );

        return t < 0.5
            ? 0.5 * g
            : 0.5 * ( 1.0 - g ) + 0.5;

	}

`;



ease.circOut = /*glsl*/`

	float circOut(float t) {

		return sqrt( ( 2.0 - t ) * t );

	}

`;

ease.expoOut = /*glsl*/`

	float expoOut(float t) {

		return t == 1.0 ? t : 1.0 - pow( 2.0, -10.0 * t );

  	}
  

`;

export { ease };
