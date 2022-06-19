const _VS = /* glsl */ `

varying vec3 v_Normal;
void main() {
  vec3 scale = vec3(0.5, 0.5, 0.5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * scale, 1.0);
  v_Normal = normal;
  
}`;

export { _VS };
