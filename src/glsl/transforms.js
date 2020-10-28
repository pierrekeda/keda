const transforms = /*glsl*/`

	#ifndef PI180
	#define PI180 0.01745329251994329577
	#endif

	mat3 rotateX( in float angle ) {

		angle *= PI180;

		return mat3(
			vec3(   1.0,	        0.0,             0.0	    ),
			vec3(   0.0, 	        cos(angle), 	-sin(angle) ),
			vec3(   0.0, 	        sin(angle), 	 cos(angle) )
		);

	}

	mat3 rotateY( in float angle ) {

		angle *= PI180;

		return mat3(
			vec3(   cos(angle),    0.0,           sin(angle)  ),
			vec3(   0.0,           1.0,           0.0         ),
			vec3(   -sin(angle),   0.0,           cos(angle)  )
		);

	}

	mat3 rotateZ( in float angle ) {

		angle *= PI180;

		return mat3(
			vec3(   cos(angle),   -sin(angle),     0.0   ),
			vec3(   sin(angle),    cos(angle),     0.0   ),
			vec3(   0.0,           0.0,            1.0   )
		);

	}

	mat3 scale( in float x, in float y, in float z ) {

		return mat3(
			vec3(   x,      0.0,    0.0   ),
			vec3(   0.0,    y,      0.0   ),
			vec3(   0.0,    0.0,    z     )
		);
		
	}

`;

export { transforms };
