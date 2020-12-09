onload = () => {
    const start = new Date().getTime();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight);
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(innerWidth, innerHeight);
    document.body.append(renderer.domElement);

    const earth_geom = new THREE.SphereGeometry(1, 32, 32);
    const earth_mat = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
    earth_mat.map = THREE.ImageUtils.loadTexture('img/earthmap1k.jpg')
    const earth = new THREE.Mesh(earth_geom, earth_mat);
    earth.matrixAutoUpdate = false;
    scene.add(earth);

    const sun_geom = new THREE.SphereGeometry(0.2, 32, 32);
    const sun_mat = new THREE.MeshBasicMaterial({color: 0xFDB813});
    const sun = new THREE.Mesh(sun_geom, sun_mat);
    sun.matrixAutoUpdate = false;
    scene.add(sun);

    const light = new THREE.DirectionalLight(0xffffff);
    scene.add(light);

    renderer.render(scene, camera);

    const animate = () => {
        const now = new Date().getTime();
        const day = (now - start) / 1000 * Math.PI * 2;
        const year = day / 365;

        const day_rot = new THREE.Matrix4();
        day_rot.makeRotationY(day);

        const trans = new THREE.Matrix4();
        trans.makeTranslation(Math.cos(year) * 5, 0, Math.sin(year) * 5);
        const orb_plane = new THREE.Matrix4();
        orb_plane.makeRotationZ(23.45 * Math.PI / 180);

        earth.matrix.identity();
        earth.applyMatrix4(day_rot);
        earth.updateMatrix();

        sun.matrix.identity();
        sun.applyMatrix4(trans);
        sun.applyMatrix4(orb_plane);
        sun.updateMatrix();

        light.position.set(sun.position.x, sun.position.y, sun.position.z).normalize();

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}