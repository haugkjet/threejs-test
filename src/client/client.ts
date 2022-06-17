import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

const params = {
  exposure: 1.0,
};

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

//Light theme
scene.background = new THREE.Color(0xdadada);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(12, 12, 7);
light.castShadow = true; // default false
scene.add(light);

/*const light = new THREE.SpotLight();
light.position.set(5, 5, 5);
scene.add(light);*/

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 4;
camera.position.y = 1.5;

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
    //texture.minFilter = LinearFilter;
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

//renderer.toneMapping = THREE.ReinhardToneMapping;
//renderer.toneMappingExposure = params.exposure;

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/*const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  wireframe: true,
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

cube.position.y = 1;*/

let redMonkey = new THREE.Mesh();
let purplecube = new THREE.Mesh();

const loader = new GLTFLoader();
loader.load(
  "models/monkey.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        //m.receiveShadow = true;
        m.castShadow = true;
        if (m.name === "Suzanne") redMonkey = m;
        if (m.name === "PurpleCube") purplecube = m;
        //console.log(m.name);
        //console.log(m.id);
      }
      if ((child as THREE.Light).isLight) {
        const l = child as THREE.Light;
        l.castShadow = true;
        l.shadow.bias = -0.003;
        l.shadow.mapSize.width = 2048;
        l.shadow.mapSize.height = 2048;
      }
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

  redMonkey.rotation.y += 0.005;
  purplecube.rotation.y -= 0.005;

  //if (scene.getObjectByName("PurpleCube")?.rotation.y)
  //scene.getObjectByName("PurpleCube")?.rotation.y += 0.005;

  controls.update();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
