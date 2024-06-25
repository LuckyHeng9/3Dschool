const scene = new THREE.Scene(); // Create a new Three.js scene

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}; // Define size

const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    1,
    10000
); // Create a perspective camera
camera.position.set(0, 150, 200);
camera.lookAt(new THREE.Vector3(0, 20, 0));

const renderer = new THREE.WebGLRenderer({
    antialias: true
}); // Create a WebGL renderer
renderer.setSize(sizes.width, sizes.height); // Set renderer size
document.body.appendChild(renderer.domElement); // Append renderer to the document body

const cubeGeometry = new THREE.BoxGeometry(15, 15, 15); // Create cube geometry
const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00
}); // Create cube material
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial); // Create cube mesh
scene.add(cube); // Add cube to the scene

// Ground
const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 1, 1);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2; // Rotate the ground to be flat
ground.position.set(0, -4, 0);
scene.add(ground);

const animate = function () {
    requestAnimationFrame(animate);

    

    renderer.render(scene, camera);
};

animate();
