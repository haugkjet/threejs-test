const _FS = /*glsl*/ `

uniform vec3 sphereColor;
varying vec3 v_Normal;
uniform vec2 u_resolution;
void main() { 
  //gl_FragColor = vec4(v_Normal,1.0);
  gl_FragColor = vec4(sphereColor* v_Normal, 1.0);

}
`;
export { _FS };
