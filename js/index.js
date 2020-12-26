const simStart = moment("2020-12-21T00:00:00Z");
const msPerDay = 24 * 60 * 60 * 1000;
const daysPerYear = 365;
const msPerYear = daysPerYear * msPerDay;
const simulationSpeed = 1000000;
const TAU = Math.PI * 2;

onload = () => {
    const lat = 39.7;
    const lon = -105;
    const realStart = moment();

    const speed = 0.1;
    const keyState = {};
    const temps = {
        "#b05b5a": 90,
        "#c77560": 80,
        "#e9cc77": 70,
        "#8dbf71": 60,
        "#74a877": 50,
        "#679568": 40,
        "#83c2d5": 20,
    };

    const svgNs = "http://www.w3.org/2000/svg";
    const rbWall = document.querySelector("#rbWall");
    const rbOrbit = document.querySelector("#rbOrbit");
    const spnTemp = document.querySelector("#spnTemp");
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
    const obj = document.querySelector("object");
    const svg = obj.getSVGDocument();
    const g = svg.querySelector("g");
    const rect = svg.querySelectorAll("rect")[1];
    const left = parseFloat(rect.getAttribute("x"));
    const top = parseFloat(rect.getAttribute("y"));
    const width = parseFloat(rect.getAttribute("width"));
    const height = parseFloat(rect.getAttribute("height"));
    const point = svg.documentElement.createSVGPoint();
    let circle = svg.createElementNS(svgNs, "circle");
    circle.setAttribute("r", "40");
    circle.setAttribute("fill", "red");
    g.appendChild(circle);

    const getSimNow = () => {
        const dtText = dtCur.getAttribute("value");
        const tmText = tmCur.getAttribute("value");
        return moment(`${dtText}T${tmText}`);
    }
    const setSimNow = (instant) => {
        dtCur.setAttribute("value", instant.format("YYYY-MM-DD"));
        tmCur.setAttribute("value", instant.format("HH:mm:ss"));

        const simNow = getSimNow();
        const dayOfYear = simNow.dayOfYear();
        const minutes = simNow.get('hours') * 60 + simNow.get('minutes');
        point.x = left + (dayOfYear / 365) * width;
        point.y = top + (1.0 - (minutes / (60 * 24))) * height;
        circle.setAttribute("cx", `${point.x}`);
        circle.setAttribute("cy", `${point.y}`);
        const fill = Array.from(g.childNodes).filter(el => el.nodeName === "path")
            .filter(path => path.isPointInFill(point))
            .map(path => path.getAttribute("fill"))[0];
        const temp = temps[fill];
        spnTemp.innerHTML = `${temp}&deg;F`;

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
        headCam.position.x = 0;
        headCam.position.y = 0;
        headCam.position.z = 10;
        controls.update();
    }
    dtCur.onchange = () => requestAnimationFrame(render);
    tmCur.onchange = () => requestAnimationFrame(render);

    const scene = new THREE.Scene();
    const near = 0.00001;
    const far = 1000;
    let wallCam = new THREE.OrthographicCamera( -0.01, canvas.clientWidth / 256, canvas.clientHeight / 256, -0.01, near, far );
    wallCam.position.x = -Math.PI;
    wallCam.position.y = 0;
    wallCam.position.z = Math.PI;
    wallCam.rotation.x = 0;
    wallCam.rotation.y = -Math.PI / 4;
    wallCam.rotation.z = 0;
    const headCam = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight);
    headCam.position.x = 0;
    headCam.position.y = 1.5;
    headCam.position.z = 0;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;
    canvas.appendChild(renderer.domElement);
    const controls = new THREE.PointerLockControls( headCam, renderer.domElement );
    controls.connect();
    canvas.onclick = () => controls.lock();
    window.onkeydown = (e) => keyState[e.code] = true;
    window.onkeyup = (e) => delete keyState[e.code];

    let camera = headCam;
    const camChange = (e) => {
        if(e.target.value === "wall") camera = wallCam;
        if(e.target.value === "orbit") camera = headCam;
    }
    rbWall.onclick = camChange;
    rbOrbit.onclick = camChange;
    
    // sun
    const sun_geom = new THREE.SphereGeometry(0.2, 32, 32);
    const start = moment("2020-12-21T00:00");
    const end = start.clone().add(1, 'year');
    for(let day = start; end.diff(day) > 0; day.add(1, 'months')) {
        const times = SunCalc.getTimes(start.toDate(), lat, lon);
        const sunriseStr = `${moment(times.sunrise).format('HH')}:00`;
        const hour = `${times.sunset.getHours() + 1}`;
        const sunsetStr = `${hour.padStart(2, '0')}:00`;
        const sunset = moment(`${day.format('YYYY-MM-DD')}T${sunsetStr}`);
        const nowStr = `${day.format('YYYY-MM-DD')}T${sunriseStr}`;
        for(let now = moment(nowStr); sunset.diff(now) > 0; now.add(1, 'hour')) {
            const dayOfYear = now.dayOfYear();
            const minutes = now.get('hours') * 60 + now.get('minutes');
            point.x = left + (dayOfYear / 365) * width;
            point.y = top + (1.0 - (minutes / (60 * 24))) * height;
            circle.setAttribute("cx", `${point.x}`);
            circle.setAttribute("cy", `${point.y}`);
            const fill = Array.from(g.childNodes).filter(el => el.nodeName === "path")
                .filter(path => path.isPointInFill(point))
                .map(path => path.getAttribute("fill"))[0];
            const temp = temps[fill];
            // if(temp >= 80) {
            //     continue;
            // }

            const sun_mat = new THREE.MeshBasicMaterial({color: fill});
            const sunPos = SunCalc.getPosition(now.toDate(), lat, lon);
            // console.log(sunPos);
            const sun = new THREE.Mesh(sun_geom, sun_mat);
            sun.matrixAutoUpdate = false;

            const dist = new THREE.Matrix4();
            dist.makeTranslation(0, 0, -10);
            const altitude = new THREE.Matrix4();
            altitude.makeRotationX(sunPos.altitude);
            const azimuth = new THREE.Matrix4();
            azimuth.makeRotationY(-sunPos.azimuth + Math.PI);
            sun.matrix.identity();
            sun.applyMatrix4(dist);
            sun.applyMatrix4(altitude);
            sun.applyMatrix4(azimuth);
            sun.updateMatrix();

            scene.add(sun);
        }
    }

    // ground
    const geometry = new THREE.BoxGeometry( 20, .1, 20 );
    const material = new THREE.MeshPhongMaterial({color: 0x888888});
    material.map = THREE.ImageUtils.loadTexture('img/compass-rose.png')
    const cube = new THREE.Mesh( geometry, material );
    cube.receiveShadow = true;
    cube.position.y = -0.2;
    scene.add( cube );

    // pergola
    // const loader = new THREE.STLLoader();
    // loader.load( './model/pergola.stl.txt', function ( geometry ) {
    //     const material = new THREE.MeshPhongMaterial( { color: 0x888888 } );
    //     const mesh = new THREE.Mesh( geometry, material );
    //     mesh.rotation.set( - Math.PI / 2, 0, 0 );
    //     mesh.castShadow = true;
    //     mesh.receiveShadow = true;
    //     scene.add( mesh );
    // } );

    // roof
    const roofGeometry = new THREE.BoxGeometry( 5.6896, 0.152, 2.8956 );
    const roofMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const roof = new THREE.Mesh( roofGeometry, roofMaterial );
    roof.receiveShadow = true;
    roof.position.y = 3.23;
    roof.rotation.y = -Math.PI / 4;
    scene.add( roof );


    const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( ambientLight );

    // directional
    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.left = -10;
    light.shadow.camera.top = 10;
    light.shadow.camera.right = 10;
    light.shadow.camera.bottom = -10;
    scene.add(light);

    // scene.add(new THREE.CameraHelper(light.shadow.camera));

    renderer.render(scene, camera);

    const tick = () => {
        const realNow = moment();
        const realElapsed = realNow.diff(realStart, 'milliseconds');
        const simElapsed = (realElapsed * simulationSpeed) % msPerYear;
        const simNow = simStart.clone().add(simElapsed, 'milliseconds');
        setSimNow(simNow);
    }
    const render = () => {
        if(keyState['KeyW']) controls.moveForward(speed); // TODO: speed * time
        if(keyState['KeyS']) controls.moveForward(-speed); // TODO: speed * time
        if(keyState['KeyD']) controls.moveRight(speed); // TODO: speed * time
        if(keyState['KeyA']) controls.moveRight(-speed); // TODO: speed * time
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}
