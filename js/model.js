onload = () => {
    const canvas = document.querySelector(".main");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight);
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    canvas.appendChild(renderer.domElement);
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.update();

    // load
    const loader = new THREE.STLLoader();
    loader.load( './model/pergola.stl', function ( geometry ) {
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( 0, - 0.25, 0.6 );
        mesh.rotation.set( 0, - Math.PI / 2, 0 );
        mesh.scale.set( 0.5, 0.5, 0.5 );
        scene.add( mesh );
    } );

    // render
    renderer.render(scene, camera);
    const render = () => {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}