const _VS = /* glsl */ `
uniform float uTime;

vec3 hashOld33( vec3 p )
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
			  dot(p,vec3(269.5,183.3,246.1)),
			  dot(p,vec3(113.5,271.9,124.6)));

	return fract(sin(p)*43758.5453123);
}

varying vec3 v_Normal;

void main() {
  vec3 scale = vec3 (sin(uTime),sin(uTime),sin(uTime));// hashOld33(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
  v_Normal = normal;
  
}`;

export { _VS };
