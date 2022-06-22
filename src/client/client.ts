import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { mapLinear } from "three/src/math/MathUtils";

import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

import { _VS } from "./shaders/normal/vertex";
import { _FS } from "./shaders/normal/fragment";

import { VS_outline } from "./shaders/outline/vertex";
import { FS_outline } from "./shaders/outline/fragment";

import { gltfload } from "./gltfload";
import { ShaderMaterial } from "three";

const params = {
  exposure: 1.0,
};

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

//Light theme
//scene.background = new THREE.Color(0xb5e2ff);

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(12, 12, 7);
light.castShadow = true; // default false
light.shadow.normalBias = 1e-2;
light.shadow.bias = -1e-3;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;

// Camera
scene.add(light);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);

camera.position.z = 4;
camera.position.y = 4.5;

const SKY_COLOR = 0x0e0353;
const GROUND_COLOR = 0xd5f3ed;
const SKY_SIZE = 10000;

const vertexShader = `
      varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`;
const fragmentShader = `
      uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize( vWorldPosition).y;
                gl_FragColor = vec4( mix( bottomColor, topColor, max( h, 0.0 ) ), 1.0 );
            }`;
const uniforms = {
  topColor: { value: new THREE.Color(SKY_COLOR) },
  bottomColor: { value: new THREE.Color(GROUND_COLOR) },
};
const skyGeo = new THREE.SphereGeometry(SKY_SIZE, 32, 15);
const skyMat = new ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader,
  side: THREE.BackSide,
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// Load hdr
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

    //scene.background = texture; // Use hdr as background
    scene.environment = texture; // This do the lighting

    render();
  }
);
const size = 80;
const divisions = 40;

const gridHelper = new THREE.GridHelper(size, divisions, "#3a3b3c", "#3a3b3c");
scene.add(gridHelper);

gridHelper.position.y = -1.3;
gridHelper.position.z = -20;

// Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = params.exposure;

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRenderer.domElement);

// Orbitcontrols
const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;

//const controls = new FirstPersonControls(camera, renderer.domElement);
//controls.movementSpeed = 50;
//controls.lookSpeed = 0.9;

const pickableObjects: THREE.Mesh[] = [];
let intersectedObject: THREE.Object3D | null;
const originalMaterials: { [id: string]: THREE.Material | THREE.Material[] } =
  {};
const highlightedMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0x00ff00,
});

// Load gltf
const sceneMeshes: THREE.Object3D[] = [];

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
        switch (m.name) {
          case "Plane":
            m.receiveShadow = true;
            m.userData.ground = true;
            break;
          default:
            m.castShadow = true;
            m.userData.draggable = true;

            pickableObjects.push(m);
            sceneMeshes.push(m);
            //store reference to original materials for later
            originalMaterials[m.name] = (m as THREE.Mesh).material;
            const measurementDiv = document.createElement(
              "div"
            ) as HTMLDivElement;
            measurementDiv.className = "measurementLabel";
            measurementDiv.innerText = m.name;
            const measurementLabel = new CSS2DObject(measurementDiv);
            measurementLabel.position.x = m.position.x;
            measurementLabel.position.y = m.position.y;
            measurementLabel.position.z = m.position.z;
            //measurementLabel.position.copy(intersects[0].point)
            //measurementLabels[lineId] = measurementLabel
            scene.add(measurementLabel);
        }

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

// Helper arrow for raycaster
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

// White ball
const s1 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
s1.position.set(1, 2, -0.5);
s1.castShadow = true;
scene.add(s1);

const myshadermaterial = new THREE.ShaderMaterial({
  uniforms: {
    sphereColor: {
      value: new THREE.Vector3(1, 1, 1),
    },
    uTime: { value: 0 },
  },
  vertexShader: _VS,
  fragmentShader: _FS,
});

// Ball with normal shader
const s2 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  //new THREE.MeshStandardMaterial({ color: 0xffffff })
  myshadermaterial
);
s2.position.set(-1, 2, -0.5);
s2.castShadow = true;
scene.add(s2);

// Box with (unfinished) outline shader
const s3 = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 2),
  new THREE.ShaderMaterial({
    uniforms: { linewidth: { value: 0.05 } }, // linewidth: { type: "f", value: 0.02 },
    vertexShader: VS_outline,
    fragmentShader: FS_outline,
  })
);
s3.position.set(3, 2, -0.5);
s3.castShadow = true;
scene.add(s3);

// Sphere with outline effect (not shader based)
let sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20);
let sphere = new THREE.Mesh(
  sphereGeometry,
  new THREE.MeshStandardMaterial({ roughness: 0.242, color: 0x6b302c })
);
sphere.position.set(-3, 2, 0);
scene.add(sphere);
let outlineMaterial1 = new THREE.MeshStandardMaterial({
  color: 0x570861,
  side: THREE.BackSide,
});
let outlineMesh1 = new THREE.Mesh(sphereGeometry, outlineMaterial1);
//outlineMesh1.position = sphere.position;
outlineMesh1.scale.multiplyScalar(1.04);
scene.add(outlineMesh1);
outlineMesh1.position.x = sphere.position.x;
outlineMesh1.position.y = sphere.position.y;
outlineMesh1.position.z = sphere.position.z;

// Raycaster code
const raycaster = new THREE.Raycaster();
let intersects: THREE.Intersection[];

renderer.domElement.addEventListener("dblclick", onDoubleClick, false);
renderer.domElement.addEventListener("click", onClick, false);
renderer.domElement.addEventListener("mousemove", onMouseMove, false);
renderer.domElement.addEventListener("dblclick", onDoubleClick, false);

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

//document.addEventListener("mousemove", onDocumentMouseMove, false);
function onClick(event: MouseEvent) {
  raycaster.setFromCamera(
    {
      x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
      y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    },
    camera
  );
  intersects = raycaster.intersectObjects(pickableObjects, false);

  if (intersects.length > 0) {
    intersectedObject = intersects[0].object;
  } else {
    intersectedObject = null;
  }
  pickableObjects.forEach((o: THREE.Mesh, i) => {
    if (intersectedObject && intersectedObject.name === o.name) {
      pickableObjects[i].material = myshadermaterial;
    } else {
      pickableObjects[i].material = originalMaterials[o.name];
    }
  });
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

const clickMouse = new THREE.Vector2(); // create once
const moveMouse = new THREE.Vector2(); // create once
var draggable: THREE.Object3D;

function intersect(pos: THREE.Vector2) {
  raycaster.setFromCamera(pos, camera);
  return raycaster.intersectObjects(scene.children);
}

window.addEventListener("click", (event) => {
  if (draggable != null) {
    console.log(`dropping draggable ${draggable.userData.name}`);
    draggable = null as any;
    return;
  }

  // THREE RAYCASTER
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const found = intersect(clickMouse);
  if (found.length > 0) {
    if (found[0].object.userData.draggable) {
      draggable = found[0].object;
      console.log(`found draggable ${draggable.userData.name}`);
    }
  }
});

window.addEventListener("mousemove", (event) => {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function dragObject() {
  if (draggable != null) {
    const found = intersect(moveMouse);
    if (found.length > 0) {
      for (let i = 0; i < found.length; i++) {
        if (!found[i].object.userData.ground) continue;

        let target = found[i].point;
        draggable.position.x = target.x;
        draggable.position.z = target.z;
      }
    }
  }
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

var clock = new THREE.Clock();
const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  dragObject();

  const elapsedTime = clock.getElapsedTime();
  myshadermaterial.uniforms.uTime.value = elapsedTime;

  controls.update();
  dragObject();

  render();

  stats.update();
}

function render() {
  labelRenderer.render(scene, camera);
  renderer.render(scene, camera);
  //controls.update(clock.getDelta());
}

animate();
