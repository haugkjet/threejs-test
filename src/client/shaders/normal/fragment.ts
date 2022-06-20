const _FS = /*glsl*/ `

vec3 hashOld33( vec3 p )
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
			  dot(p,vec3(269.5,183.3,246.1)),
			  dot(p,vec3(113.5,271.9,124.6)));

	return fract(sin(p)*43758.5453123);
}

uniform vec3 sphereColor;
varying vec3 v_Normal;
uniform vec2 u_resolution;
void main() { 
  //gl_FragColor = vec4(v_Normal,1.0);
  gl_FragColor = vec4(hashOld33 (sphereColor* v_Normal), 1.0);

}
`;
export { _FS };
