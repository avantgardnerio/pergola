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
        if (cbAnimate.checked) tick();
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
    const near = 0.001;
    const sunRadius =          696340000; // 696.34 million m
    const earthSunDist =    149600000000; // 149.6 million km = 149.6 billion m
    const far =             200000000000;
    let wallCam = new THREE.OrthographicCamera(-0.01, canvas.clientWidth / 256, canvas.clientHeight / 256, -0.01, near, far);
    wallCam.position.x = -Math.PI;
    wallCam.position.y = 0;
    wallCam.position.z = Math.PI;
    wallCam.rotation.x = 0;
    wallCam.rotation.y = -Math.PI / 4;
    wallCam.rotation.z = 0;
    const headCam = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, near, far);
    headCam.position.x = 0;
    headCam.position.y = 1.5;
    headCam.position.z = 0;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMapSoft = true;
    canvas.appendChild(renderer.domElement);
    const controls = new THREE.PointerLockControls(headCam, renderer.domElement);
    controls.connect();
    canvas.onclick = () => controls.lock();
    window.onkeydown = (e) => keyState[e.code] = true;
    window.onkeyup = (e) => delete keyState[e.code];

    let camera = headCam;
    const camChange = (e) => {
        if (e.target.value === "wall") camera = wallCam;
        if (e.target.value === "orbit") camera = headCam;
    }
    rbWall.onclick = camChange;
    rbOrbit.onclick = camChange;

    // sun
    const sun_geom = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sun_mat = new THREE.MeshBasicMaterial({color: 0xFDB813});
    const sun = new THREE.Mesh(sun_geom, sun_mat);
    sun.matrixAutoUpdate = false;
    scene.add(sun);

    // roof
    const deckWidth = 5.6896;
    const deckLength = 2.8956;
    const storyHeight = 3.23;
    const roofGeometry = new THREE.BoxGeometry(deckWidth, 0.152, deckLength);
    const roofMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.receiveShadow = true;
    roof.position.y = storyHeight;
    roof.rotation.y = -Math.PI / 4;
    roof.updateMatrix();
    scene.add(roof);

    // floor
    const floorGeometry = new THREE.BoxGeometry(deckWidth, 0.013, deckLength);
    const floorMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.y = -Math.PI / 4;
    floor.updateMatrix();
    scene.add(floor);

    // backWall
    const backWallGeometry = new THREE.BoxGeometry(deckWidth, 0.013, deckLength);
    const backWallMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.receiveShadow = true;
    const backWallOrigin = new THREE.Matrix4();
    backWallOrigin.makeTranslation(0, 0, deckLength / 2);
    const backWallVertical = new THREE.Matrix4();
    backWallVertical.makeRotationX(Math.PI / -2);
    const backWallBack = new THREE.Matrix4();
    backWallBack.makeTranslation(0, 0, deckLength / 2);
    const backWallSw = new THREE.Matrix4();
    backWallSw.makeRotationY(Math.PI / -4 + Math.PI);
    backWall.matrix.identity();
    backWall.applyMatrix4(backWallOrigin);
    backWall.applyMatrix4(backWallVertical);
    backWall.applyMatrix4(backWallBack);
    backWall.applyMatrix4(backWallSw);
    backWall.updateMatrix();
    scene.add(backWall);

    // frontRailing
    const railingHeight = 1.07;
    const frontRailingGeometry = new THREE.BoxGeometry(deckWidth, 0.013, railingHeight);
    const frontRailingMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const frontRailing = new THREE.Mesh(frontRailingGeometry, frontRailingMaterial);
    frontRailing.receiveShadow = true;
    const frontRailingOrigin = new THREE.Matrix4();
    frontRailingOrigin.makeTranslation(0, 0, railingHeight / 2);
    const frontRailingFront = new THREE.Matrix4();
    frontRailingFront.makeTranslation(0, 0, deckLength / -2);
    frontRailing.matrix.identity();
    frontRailing.applyMatrix4(frontRailingOrigin);
    frontRailing.applyMatrix4(backWallVertical);
    frontRailing.applyMatrix4(frontRailingFront);
    frontRailing.applyMatrix4(backWallSw);
    frontRailing.updateMatrix();
    scene.add(frontRailing);

    // rightRailing
    const rightRailingGeometry = new THREE.BoxGeometry(deckLength, 0.013, railingHeight);
    const rightRailingMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const rightRailing = new THREE.Mesh(rightRailingGeometry, rightRailingMaterial);
    rightRailing.receiveShadow = true;
    const rightRailingRight = new THREE.Matrix4();
    rightRailingRight.makeTranslation(0, 0, deckWidth / -2);
    const rightRailingSw = new THREE.Matrix4();
    rightRailingSw.makeRotationY(Math.PI / -4 + Math.PI / 2);
    rightRailing.matrix.identity();
    rightRailing.applyMatrix4(frontRailingOrigin);
    rightRailing.applyMatrix4(backWallVertical);
    rightRailing.applyMatrix4(rightRailingRight);
    rightRailing.applyMatrix4(rightRailingSw);
    rightRailing.updateMatrix();
    scene.add(rightRailing);

    // leftRailing
    const leftRailingGeometry = new THREE.BoxGeometry(deckLength, 0.013, railingHeight);
    const leftRailingMaterial = new THREE.MeshPhongMaterial({color: 0x888888});
    const leftRailing = new THREE.Mesh(leftRailingGeometry, leftRailingMaterial);
    leftRailing.receiveShadow = true;
    const leftRailingRight = new THREE.Matrix4();
    leftRailingRight.makeTranslation(0, 0, deckWidth / 2);
    const leftRailingSw = new THREE.Matrix4();
    leftRailingSw.makeRotationY(Math.PI / -4 + Math.PI / 2);
    leftRailing.matrix.identity();
    leftRailing.applyMatrix4(frontRailingOrigin);
    leftRailing.applyMatrix4(backWallVertical);
    leftRailing.applyMatrix4(leftRailingRight);
    leftRailing.applyMatrix4(leftRailingSw);
    leftRailing.updateMatrix();
    scene.add(leftRailing);

    // suns
    const roofPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.895);
    const start = moment("2020-12-21T00:00");
    const end = start.clone().add(1, 'year');
    const headPos = new THREE.Vector3(0, 0, 0);
    for (let day = start; end.diff(day) > 0; day.add(2, 'weeks')) {
        const times = SunCalc.getTimes(start.toDate(), lat, lon);
        const sunriseStr = `${moment(times.sunrise).format('HH')}:00`;
        const hour = `${times.sunset.getHours() + 1}`;
        const sunsetStr = `${hour.padStart(2, '0')}:00`;
        const sunset = moment(`${day.format('YYYY-MM-DD')}T${sunsetStr}`);
        const nowStr = `${day.format('YYYY-MM-DD')}T${sunriseStr}`;
        let lastPos = undefined;
        for (let now = moment(nowStr); sunset.diff(now) > 0; now.add(30, 'minutes')) {
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

            const sun_mat = new THREE.MeshBasicMaterial({color: fill});
            const sunPos = SunCalc.getPosition(now.toDate(), lat, lon);
            // console.log(sunPos);
            const sun = new THREE.Mesh(sun_geom, sun_mat);
            sun.matrixAutoUpdate = false;

            const dist = new THREE.Matrix4();
            dist.makeTranslation(0, 0, -earthSunDist);
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

            const dir = sun.position.sub(headPos);
            dir.normalize();
            const ray = new THREE.Ray(headPos, dir);
            const isec3 = new THREE.Vector3();
            if (ray.intersectPlane(roofPlane, isec3) === null) continue;
            const inv = roof.matrix.clone().invert();
            const isec2 = isec3.clone();
            isec2.applyMatrix4(inv);
            if (isec2.x >= deckWidth / -2 && isec2.x <= deckWidth / 2) {
                if (isec2.z >= deckLength / -2 && isec2.z <= deckLength / 2) {
                    if(lastPos !== undefined) {
                        const lineMaterial = new THREE.LineBasicMaterial({color: fill});
                        const lineGeometry = new THREE.Geometry();
                        lineGeometry.vertices.push(lastPos);
                        lineGeometry.vertices.push(isec3);
                        const line = new THREE.Line(lineGeometry, lineMaterial);
                        scene.add(line);
                    }
                }
            }
            lastPos = isec3;
        }
    }

    // ground
    const geometry = new THREE.BoxGeometry(20, .1, 20);
    const material = new THREE.MeshPhongMaterial({color: 0x888888});
    material.map = THREE.ImageUtils.loadTexture('img/compass-rose.png')
    const cube = new THREE.Mesh(geometry, material);
    cube.receiveShadow = true;
    cube.position.y = -0.2;
    scene.add(cube);

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

    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

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
        if (keyState['KeyW']) controls.moveForward(speed); // TODO: speed * time
        if (keyState['KeyS']) controls.moveForward(-speed); // TODO: speed * time
        if (keyState['KeyD']) controls.moveRight(speed); // TODO: speed * time
        if (keyState['KeyA']) controls.moveRight(-speed); // TODO: speed * time
        if (keyState['KeyQ']) headCam.position.sub(new THREE.Vector3(0, speed, 0));
        if (keyState['KeyE']) headCam.position.add(new THREE.Vector3(0, speed, 0));

        // Get simulation now
        const simNow = getSimNow();

        // suncalc
        const lat = 39.7;
        const lon = -105;
        const sunrisePos = SunCalc.getPosition(simNow.toDate(), lat, lon);

        // Update model
        const dist = new THREE.Matrix4();
        dist.makeTranslation(0, 0, -earthSunDist);
        const altitude = new THREE.Matrix4();
        altitude.makeRotationX(sunrisePos.altitude);
        const azimuth = new THREE.Matrix4();
        azimuth.makeRotationY(-sunrisePos.azimuth + Math.PI);
        sun.matrix.identity();
        sun.applyMatrix4(dist);
        sun.applyMatrix4(altitude);
        sun.applyMatrix4(azimuth);
        sun.updateMatrix();

        light.position.x = sun.position.x;
        light.position.y = sun.position.y;
        light.position.z = sun.position.z;

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();
}
