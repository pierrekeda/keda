const linearGradient = /*glsl*/`

    vec3 linearGradient( vec2 origin, vec2 target, vec3 color1, vec3 color2, float angle ) {

        angle = radians( angle ) + atan( target.y, target.x );
        float length = length( target );
        vec2 progress = vec2( cos( angle ) * length, sin( angle ) * length ) + origin;
        return mix( color1, color2, smoothstep( 0.0, 1.0, progress.x ) );

    }

`;

export { linearGradient };
