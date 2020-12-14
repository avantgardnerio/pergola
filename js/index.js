const simStart = moment("2020-12-21T00:00:00Z");
const msPerDay = 24 * 60 * 60 * 1000;
const daysPerYear = 365;
const msPerYear = daysPerYear * msPerDay;
const simulationSpeed = 1000000;
const TAU = Math.PI * 2;

onload = () => {
    const realStart = moment();

    const canvas = document.querySelector(".main");
    const dtCur = document.querySelector("#dtCur");
    const tmCur = document.querySelector("#tmCur");
    const btnHourDec = document.querySelector("#btnHourDec");
    const btnHourEnc = document.querySelector("#btnHourEnc");
    const btnDayDec = document.querySelector("#btnDayDec");
    const btnDayEnc = document.querySelector("#btnDayEnc");
    const btnMonthDec = document.querySelector("#btnMonthDec");
    const btnMonthEnc = document.querySelector("#btnMonthEnc");
    const btnWeekDec = document.querySelector("#btnWeekDec");
    const btnWeekEnc = document.querySelector("#btnWeekEnc");
    const cbAnimate = document.querySelector("#cbAnimate");
    const btnCameraReset = document.querySelector("#btnCameraReset");

    const getSimNow = () => {
        const dtText = dtCur.getAttribute("value");
        const tmText = tmCur.getAttribute("value");
        return moment(`${dtText}T${tmText}Z`);
    }
    const setSimNow = (instant) => {
        dtCur.setAttribute("value", instant.utc().format("YYYY-MM-DD"));
        tmCur.setAttribute("value", instant.utc().format("HH:mm:ss"));
        render();
    }
    btnHourDec.onclick = () => setSimNow(getSimNow().subtract(1, 'hours'));
    btnHourEnc.onclick = () => setSimNow(getSimNow().add(1, 'hours'));
    btnDayDec.onclick = () => setSimNow(getSimNow().subtract(1, 'days'));
    btnDayEnc.onclick = () => setSimNow(getSimNow().add(1, 'days'));
    btnWeekDec.onclick = () => setSimNow(getSimNow().subtract(1, 'weeks'));
    btnWeekEnc.onclick = () => setSimNow(getSimNow().add(1, 'weeks'));
    btnMonthDec.onclick = () => setSimNow(getSimNow().subtract(1, 'months'));
    btnMonthEnc.onclick = () => setSimNow(getSimNow().add(1, 'months'));
    cbAnimate.onchange = () => {
        if(cbAnimate.checked) tick();
    }
    btnCameraReset.onclick = () => {
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 10;
        controls.update();
    }
    dtCur.onchange = () => requestAnimationFrame(render);
    tmCur.onchange = () => requestAnimationFrame(render);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight);
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    canvas.appendChild(renderer.domElement);
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.update();

    // sun
    const sun_geom = new THREE.SphereGeometry(0.2, 32, 32);
    const sun_mat = new THREE.MeshBasicMaterial({color: 0xFDB813});
    const sun = new THREE.Mesh(sun_geom, sun_mat);
    sun.matrixAutoUpdate = false;
    scene.add(sun);

    // ground
    const geometry = new THREE.BoxGeometry( 10, .1, 10 );
    const material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
    material.map = THREE.ImageUtils.loadTexture('img/compass-rose.png')
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = -0.2;
    scene.add( cube );

    // pergola
    const loader = new THREE.STLLoader();
    loader.load( './model/pergola.stl', function ( geometry ) {
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const mesh = new THREE.Mesh( geometry, material );
        // mesh.position.set( 0, - 0.25, 0.6 );
        mesh.rotation.set( - Math.PI / 2, 0, 0 );
        // mesh.scale.set( 0.5, 0.5, 0.5 );
        scene.add( mesh );
    } );

    const light = new THREE.DirectionalLight(0xffffff);
    scene.add(light);

    renderer.render(scene, camera);

    const tick = () => {
        const realNow = moment();
        const realElapsed = realNow.diff(realStart, 'milliseconds');
        const simElapsed = (realElapsed * simulationSpeed) % msPerYear;
        const simNowWrite = simStart.clone().add(simElapsed, 'milliseconds');
        setSimNow(simNowWrite);
    }
    const render = () => {
        // Get simulation now
        const simNow = getSimNow();

        // suncalc
        const lat = 39.7;
        const lon = -105;
        const sunrisePos = SunCalc.getPosition(simNow.toDate(), lat, lon);

        // Update model
        const dist = new THREE.Matrix4();
        dist.makeTranslation(0, 0, -10);
        const altitude = new THREE.Matrix4();
        altitude.makeRotationX(sunrisePos.altitude);
        const azimuth = new THREE.Matrix4();
        azimuth.makeRotationY(-sunrisePos.azimuth + Math.PI);
        sun.matrix.identity();
        sun.applyMatrix4(dist);
        sun.applyMatrix4(altitude);
        sun.applyMatrix4(azimuth);
        sun.updateMatrix();

        light.position.set(sun.position.x, sun.position.y, sun.position.z).normalize();

        renderer.render(scene, camera);
        if(cbAnimate.checked) tick();
        requestAnimationFrame(render);
    }
    render();
}
