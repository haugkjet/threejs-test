import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { mapLinear } from "three/src/math/MathUtils";

import { _VS } from "./shaders/vertex";
import { _FS } from "./shaders/fragment";

const params = {
  exposure: 1.0,
};

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

//Light theme
scene.background = new THREE.Color(0xb5e2ff);

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(12, 12, 7);
light.castShadow = true; // default false
light.shadow.normalBias = 1e-2;
light.shadow.bias = -1e-3;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;

scene.add(light);

/*const light2 = new THREE.SpotLight();
light.position.set(5, 5, 5);
scene.add(light2);*/

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 4;
camera.position.y = 4.5;

/*const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0x0016ee,

  transparent: false,
  opacity: 0.8,

  wireframe: false,
  metalness: 0.1,
  roughness: 0.4,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.position.x = -2;*/

new EXRLoader().load(
  "textures/forest.exr",
  function (texture: any, textureData: any) {
    // memorial.exr is NPOT

    //console.log( textureData );
    //console.log( texture );

    // EXRLoader sets these default settings
    //texture.generateMipmaps = false;
    //texture.minFilter = Lihttps://www.google.com/search?q=git+add&oq=git+add&aqs=chrome..69i57j0i512l6j69i60.1217j0j7&client=ubuntu&sourceid=chrome&ie=UTF-8nearFilter;
    //texture.magFilter = LinearFilter;

    /*const material = new THREE.MeshBasicMaterial({ map: texture });

    const quad = new THREE.PlaneGeometry(
      (1.5 * textureData.width) / textureData.height,
      1.5
    );

    const mesh = new THREE.Mesh(quad, material);*/
    texture.mapping = THREE.EquirectangularReflectionMapping;

    //    scene.background = texture;
    scene.environment = texture; // This do the lighting

    //scene.add(mesh);

    render();
  }
);

//

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = params.exposure;

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/*const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  wireframe: false,
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

cube.position.y = 1;*/

let redMonkey = new THREE.Mesh();
let blueMonkey = new THREE.Mesh();
let purpleMonkey = new THREE.Mesh();
let purplecube = new THREE.Mesh();
let bluecube = new THREE.Mesh();
let redcube = new THREE.Mesh();
let mymaterial = new THREE.MeshStandardMaterial();

const loader = new GLTFLoader();
loader.load(
  "models/monkey.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        if (m.name === "Plane") m.receiveShadow = true;
        m.castShadow = true;
        //m.material.;
        if (m.name === "RedMonkey") redMonkey = m;
        if (m.name === "BlueMonkey") blueMonkey = m;
        if (m.name === "PurpleMonkey") purpleMonkey = m;
        if (m.name === "PurpleCube") purplecube = m;
        if (m.name === "Redcube") redcube = m;
        if (m.name === "BlueCube") bluecube = m;
        console.log(m.name);
        sceneMeshes.push(m);
        //console.log(m.id);
      }
      /* if ((child as THREE.Light).isLight) {
        const l = child as THREE.Light;
        l.castShadow = true;
        l.shadow.bias = -0.0001;
        l.shadow.mapSize.width = 512;
        l.shadow.mapSize.height = 512;
      }*/
    });
    scene.add(gltf.scene);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

const material3 = new THREE.MeshNormalMaterial();

const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const coneGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);

const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
const points = new Array();
points.push(new THREE.Vector3(0, 0, 0));
points.push(new THREE.Vector3(0, 0, 0.25));
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometry, material3);
scene.add(line);
const arrowHelper = new THREE.ArrowHelper(
  new THREE.Vector3(),
  new THREE.Vector3(),
  0.25,
  0xffff00
);
scene.add(arrowHelper);

const s1 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
s1.position.set(1, 2, -0.5);
s1.castShadow = true;
scene.add(s1);

const s2 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  //new THREE.MeshStandardMaterial({ color: 0xffffff })
  new THREE.ShaderMaterial({
    uniforms: {
      sphereColor: {
        value: new THREE.Vector3(1, 1, 1),
      },
    },
    vertexShader: _VS,
    fragmentShader: _FS,
  })
);
s2.position.set(-1, 2, -0.5);
s2.castShadow = true;
scene.add(s2);

/*const material = new THREE.MeshNormalMaterial()
 const boxGeometry = new THREE.BoxGeometry(.2, .2, .2)
 const coneGeometry = new THREE.ConeGeometry(.05, .2, 8)*/

var outline_shader = {
  uniforms: {
    linewidth: { type: "f", value: 0.02 },
  },
  vertex_shader: [
    "uniform float linewidth;",
    "void main() {",
    "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
    "vec4 displacement = vec4( normalize( normalMatrix * normal ) * linewidth, 0.0 ) + mvPosition;",
    "gl_Position = projectionMatrix * displacement;",
    "}",
  ].join("\n"),
  fragment_shader: [
    "void main() {",
    "gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );",
    "}",
  ].join("\n"),
};

const s3 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 2),
  new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(outline_shader.uniforms),
    vertexShader: outline_shader.vertex_shader,
    fragmentShader: outline_shader.fragment_shader,
  })
);
s3.position.set(3, 2, -0.5);
s3.castShadow = true;
scene.add(s3);

const raycaster = new THREE.Raycaster();
const sceneMeshes: THREE.Object3D[] = [];

renderer.domElement.addEventListener("dblclick", onDoubleClick, false);
renderer.domElement.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(event: MouseEvent) {
  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };

  // console.log(mouse)

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false);

  if (intersects.length > 0) {
    // console.log(sceneMeshes.length + " " + intersects.length)
    // console.log(intersects[0])
    console.log(
      intersects[0].object.userData.name + " " + intersects[0].distance + " "
    );
    // console.log((intersects[0].face as THREE.Face).normal)
    // line.position.set(0, 0, 0)
    // line.lookAt((intersects[0].face as THREE.Face).normal)
    // line.position.copy(intersects[0].point)

    const n = new THREE.Vector3();
    n.copy((intersects[0].face as THREE.Face).normal);
    n.transformDirection(intersects[0].object.matrixWorld);

    arrowHelper.setDirection(n);
    arrowHelper.position.copy(intersects[0].point);
  }
}

function onDoubleClick(event: MouseEvent) {
  const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
  };
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false);

  if (intersects.length > 0) {
    const n = new THREE.Vector3();
    n.copy((intersects[0].face as THREE.Face).normal);
    n.transformDirection(intersects[0].object.matrixWorld);

    // const cube = new THREE.Mesh(boxGeometry, material)
    const cube = new THREE.Mesh(coneGeometry, material);

    cube.lookAt(n);
    cube.rotateX(Math.PI / 2);
    cube.position.copy(intersects[0].point);
    cube.position.addScaledVector(n, 0.1);

    scene.add(cube);
    sceneMeshes.push(cube);
  }
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  //cube.rotation.x += 0.001;
  //cube.rotation.y += 0.005;

  redMonkey.rotation.y += 0.002;
  blueMonkey.rotation.y -= 0.005;
  purpleMonkey.rotation.y -= 0.005;
  purplecube.rotation.y -= 0.005;
  redcube.rotation.y -= 0.005;
  bluecube.rotation.y += 0.005;

  controls.update();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
