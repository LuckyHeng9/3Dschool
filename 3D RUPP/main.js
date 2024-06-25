/**
 * Base
 */
const canvas = document.querySelector('.canvas');
const card = document.querySelector('.card');
const labelLine = document.querySelector('.vertical-line');

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
let Fov = 75;
/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(Fov, sizes.width / sizes.height, 1, 10000);
camera.position.set(0, 25, 45);
camera.lookAt(scene.position);
scene.add(camera);

// Store the initial camera position and target
const initialCameraPosition = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
const initialCameraTarget = new THREE.Vector3(0, 35, 55);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);

/**
 * OrbitControls
 */
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxDistance = 50;
controls.minDistance = 18;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;
controls.mouseButtons = {
    RIGHT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    LEFT: THREE.MOUSE.PAN
};

// Arrays to hold loaded models and button labels
const cubes = [];
const btnLabels = [];
// Example ambient light setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
scene.add(ambientLight);


// Example directional light setup
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);


// Initialize GLTFLoader instance
const loader = new THREE.GLTFLoader();
//const modelPath = '/asset/scene.gltf';
const modelPath = '/asset/test.glb';

const createCube = (x, y, z, labelText) => {
    loader.load(modelPath, function (gltf) {
        const model = gltf.scene;
        
        model.position.set(x, y, z);
        scene.add(model);
        cubes.push(model);

        const btn = document.createElement('div');
        btn.className = 'btnlabel';
        btn.innerHTML = labelText; // Set the text on the button label
        document.body.appendChild(btn);
        btnLabels.push(btn);

        btn.addEventListener('click', (event) => onBtnLabelClick(event, model), true);
    });
};

// Add some cubes to the scene
createCube(0, 1, 1, 'Building A');
//createCube(-20, 12, 11, 'Building T');
//createCube(40, 1, -51, 'Building B');

animate();

/**
 * Animation
 */
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    updateButtonLabelPositions(); // Update button label positions in the animation loop
    controls.update(); // Update OrbitControls every frame
}

/**
 * Ground
 */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/**
 * Toggle Info
 */
let zoomedIn = false;
let zoomTarget = null;

gsap.set(card, { opacity: 0, display: 'none' });

function toggleInfo() {
    if (zoomedIn) {
        gsap.to(card, { opacity: 1, duration: 0.3, onComplete: () => card.style.display = 'block' });
    } else {
        gsap.to(card, { opacity: 0, duration: 0.3, onComplete: () => card.style.display = 'none' });
    }
}

/**
 * Mouse Events
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let startMouseX = 0;
let startMouseY = 0;
const movementScale = 0.002; // Adjust the factor as needed

// Update the window center on resize
window.addEventListener('resize', function() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

document.addEventListener('mousedown', function(event) {
    if (event.button === 0) {
        startMouseX = event.clientX;
        startMouseY = event.clientY;
    }
});

document.addEventListener('mousemove', function(event) {
    if (event.buttons === 1) { // 1 corresponds to the left mouse button
        let deltaX = (event.clientX - startMouseX) * movementScale;
        let deltaY = (event.clientY - startMouseY) * movementScale;
        
        camera.position.x -= deltaX;
        camera.position.z -= deltaY;
        
        controls.update();
        
        startMouseX = event.clientX;
        startMouseY = event.clientY;
    }
});


function zoomAt(target) {
    const aabb = new THREE.Box3().setFromObject(target);
    const center = aabb.getCenter(new THREE.Vector3());
    const size = aabb.getSize(new THREE.Vector3());

    // Adjust newPosition to not center exactly on the target
    const newPosition = new THREE.Vector3(center.x + size.x * 0.5, center.y + size.y * 1.5, center.z + size.z * 2.5);

    gsap.to(camera.position, {
        duration: 1,
        x: newPosition.x,
        y: newPosition.y - 15, // Adjust if needed
        z: newPosition.z - 20, // Adjust if needed
        onUpdate: function () {
            // Adjust lookAt position to be slightly offset from the center
            const lookAtPosition = new THREE.Vector3(center.x + 5, center.y, center.z);
            camera.lookAt(lookAtPosition);
            controls.target.copy(lookAtPosition);
        },
        onComplete: function () {
            const lookAtPosition = new THREE.Vector3(center.x + 5, center.y, center.z);
            camera.lookAt(lookAtPosition);
            controls.update();
            controls.enabled = false;
        }
    });
}


function resetCamera() {
    gsap.to(camera.position, {
        duration: 1,
        x: initialCameraPosition.x,
        y: initialCameraPosition.y + 15,
        z: initialCameraPosition.z + 20,
        onUpdate: function () {
            camera.lookAt(initialCameraTarget);
            controls.target.copy(initialCameraTarget);
        },
        onComplete: function () {
            zoomedIn = false;
            zoomTarget = null;
            toggleInfo();
            btnLabels.forEach(btn => btn.style.display = 'block');
            controls.update();
            controls.enabled = true;
        }
    });
}

window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && !zoomedIn) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject !== ground) {
            zoomTarget = intersectedObject;
            zoomAt(intersectedObject);
            zoomedIn = true;
            toggleInfo();
            btnLabels.forEach(btn => btn.style.display = 'none');
        }
    } else {
        resetCamera();
    }
}

function updateButtonLabelPositions() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const halfWidth = windowWidth / 2;
    const halfHeight = windowHeight / 2;
    let scale = 1.2;

    cubes.forEach((cube, index) => {
        const vector = cube.position.clone().project(camera);
        const btn = btnLabels[index];
        const btnWidth = btn.offsetWidth;
        const btnHeight = btn.offsetHeight;
        const x = (vector.x * halfWidth) + halfWidth - (btnWidth / 2);
        const y = -(vector.y * halfHeight) + halfHeight - (btnHeight / 2);

        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.getCenter = 

        btn.style.scale = `${scale - 0.01}`;
    });
}

function onBtnLabelClick(event, cube) {
    event.stopPropagation();
    if (!zoomedIn) {
        zoomTarget = cube;
        zoomAt(cube);
        zoomedIn = true;
        toggleInfo();
        btnLabels.forEach(btn => btn.style.display = 'none');
    } else if (zoomTarget === cube) {
        resetCamera();
    } else {
        zoomTarget = cube;
        zoomAt(cube);
    }
}
