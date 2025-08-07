document.addEventListener('DOMContentLoaded', function() {

    // --- PARTIE 1: ANIMATION 3D "CERVEAU IA" ---
    
    // S'assure que Three.js est bien chargé avant de continuer
    if (typeof THREE === 'undefined') {
        console.error("Three.js n'est pas chargé. L'animation 3D ne peut pas démarrer.");
        return;
    }

    const container = document.getElementById('ai-canvas-container');
    if (!container) return;

    let scene, camera, renderer, brainGroup, mouseX = 0, mouseY = 0;
    let particles, dataFlows = [];

    // Initialisation de la scène 3D
    function init3D() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 250;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        brainGroup = new THREE.Group();
        scene.add(brainGroup);

        // Création du noyau central (le "cerveau")
        const coreGeometry = new THREE.IcosahedronGeometry(40, 3);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        brainGroup.add(core);

        // Création des particules environnantes (neurones)
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1500;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Positionnement aléatoire dans une sphère plus grande
            const phi = Math.acos((2 * Math.random()) - 1);
            const theta = Math.sqrt(particleCount * Math.PI) * phi;
            const radius = 100 + Math.random() * 50;
            positions[i3] = radius * Math.cos(theta) * Math.sin(phi);
            positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i3 + 2] = radius * Math.cos(phi);
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff006e,
            size: 1.5,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.7
        });
        particles = new THREE.Points(particleGeometry, particleMaterial);
        brainGroup.add(particles);

        // Création des flux de données (particules qui voyagent)
        const flowGeometry = new THREE.BufferGeometry();
        const flowCount = 100;
        const flowPositions = new Float32Array(flowCount * 3);
        for(let i=0; i<flowCount; i++) {
            const i3 = i * 3;
            flowPositions[i3] = (Math.random() - 0.5) * 300;
            flowPositions[i3+1] = (Math.random() - 0.5) * 300;
            flowPositions[i3+2] = (Math.random() - 0.5) * 300;
        }
        flowGeometry.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
        const flowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const dataFlow = new THREE.Points(flowGeometry, flowMaterial);
        dataFlow.userData.velocity = new THREE.Vector3(0,0,0);
        dataFlows.push(dataFlow);
        scene.add(dataFlow);

        // Ajout des écouteurs d'événements
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
    }

    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - window.innerWidth / 2) / 100;
        mouseY = (event.clientY - window.innerHeight / 2) / 100;
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.0001;

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Animation du groupe "cerveau"
        brainGroup.rotation.y = time * 0.5;
        brainGroup.rotation.x = time * 0.2;

        // Animation des flux de données
        dataFlows.forEach(flow => {
            const positions = flow.geometry.attributes.position.array;
            for(let i=0; i < positions.length; i+=3) {
                positions[i+1] -= 0.5; // Déplacement vers le bas
                if(positions[i+1] < -150) {
                    positions[i+1] = 150; // Réapparaît en haut
                }
            }
            flow.geometry.attributes.position.needsUpdate = true;
        });

        renderer.render(scene, camera);
    }

    init3D();
    animate();

    // --- PARTIE 2: ANIMATION AU SCROLL (AOS) ---
    AOS.init({
        duration: 800,
        once: true,
        offset: 50,
    });

    // --- PARTIE 3: BARRES DE COMPÉTENCES ---
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        const level = card.getAttribute('data-level');
        card.style.setProperty('--level', level);
    });
});