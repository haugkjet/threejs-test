import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function gltfload(scene: THREE.Scene, sceneMeshes: THREE.Object3D[]) {
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

  return true;
}

export { gltfload };
