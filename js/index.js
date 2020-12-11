const simStart = moment("2020-12-21T00:00:00Z");
const msPerDay = 24 * 60 * 60 * 1000;
const daysPerYear = 365;
const msPerYear = daysPerYear * msPerDay;
const simulationSpeed = 1000000;
const TAU = Math.PI * 2;

onload = () => {
    const realStart = moment();

    const panel = document.querySelector(".main");
    const dtCur = document.querySelector("#dtCur");
    const tmCur = document.querySelector("#tmCur");
    const btnHourDec = document.querySelector("#btnHourDec");
    const btnHourEnc = document.querySelector("#btnHourEnc");
    const btnDayDec = document.querySelector("#btnDayDec");
    const btnDayEnc = document.querySelector("#btnDayEnc");
    const cbAnimate = document.querySelector("#cbAnimate");

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
    cbAnimate.onchange = () => {
        if(cbAnimate.checked) tick();
    }
    dtCur.onchange = () => requestAnimationFrame(render);
    tmCur.onchange = () => requestAnimationFrame(render);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, panel.clientWidth / panel.clientHeight);
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(panel.clientWidth, panel.clientHeight);
    panel.appendChild(renderer.domElement);

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
        const millis = simNow.diff(simStart, 'milliseconds');
        const day = millis / msPerDay;
        const year = day / daysPerYear;

        // Update model
        const day_rot = new THREE.Matrix4();
        day_rot.makeRotationY(-day);

        const year_rot = new THREE.Matrix4();
        year_rot.makeTranslation(Math.cos(year * TAU) * 5, 0, Math.sin(year * TAU) * 5);
        const orb_plane = new THREE.Matrix4();
        orb_plane.makeRotationZ(-23.45 * Math.PI / 180);

        sun.matrix.identity();
        sun.applyMatrix4(year_rot);
        sun.applyMatrix4(orb_plane);
        sun.applyMatrix4(day_rot);
        sun.updateMatrix();

        light.position.set(sun.position.x, sun.position.y, sun.position.z).normalize();

        renderer.render(scene, camera);
        if(cbAnimate.checked) tick();
    }
    render();
}
