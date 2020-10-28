/**
 *	Seminario GPC #2. FormaBasica
 *	Dibujar formas basicas con animacion
 *
 * https://threejsfundamentals.org/threejs/lessons/threejs-custom-geometry.html
 *
 */

// Variables imprescindibles
let renderer, scene, camera;
let cameraController;
let alzado, planta, perfil;
// Global GUI
let effectController;
// Materiales y Texturas
let path = "images/";
let materiales = [], textures = [];

// Variables globales
let suelo, robot, base;
let brazo, eje, esparrago, rutula;
let antebrazo, disco, nervios = [];
let mano, dedos = [], pinzas = [];
let x = [1, 1, -1, -1], z = [-1, 1, 1, -1], angulo = 0;
let l = b = -70;
let r = t = -l;

// Acciones
init();
loadScene();
setupGUI();
render();

function init() {
    // Crear el motor, la escena y la camara

    // Motor de render
    renderer = new THREE.WebGLRenderer();
    //Tamaño dela area donde vamos a dibujar
    renderer.setSize(window.innerWidth,window.innerHeight);
    //Color con el que se formatea el contenedor
    renderer.setClearColor(new THREE.Color(0x6b8bba));
    renderer.shadowMap.enabled = true;
    //Agregamos el elemento canvas de renderer al contenedor
    document.getElementById('container').appendChild(renderer.domElement);
    renderer.autoClear = false; //Para que no borre cada vez que defino un ViewPort

    // Escena
    scene = new THREE.Scene();

    // Camara
    let ar = window.innerWidth / window.innerHeight;// Razón de aspecto
    setCameras(ar);

    // Controlador de camara
    cameraController = new THREE.OrbitControls( camera, renderer.domElement );
    cameraController.target.set(0,0,0);

    // Captura de eventos
    window.addEventListener('resize', updateAspectRatio);

    addStats();
    generateLights();
}

function loadScene() {
    // Cargar la escena con objetos
    generateTextures();
    generateMaterials();
    // Geometrias
    const geosuelo = new THREE.PlaneGeometry(1000, 1000, 50, 50);
    const geobase = new THREE.CylinderGeometry(50, 50, 15, 50);
    const geoeje = new THREE.CylinderGeometry(20, 20, 18, 40);
    const geoesparrago = new THREE.BoxGeometry(18, 120, 12);
    const georotula = new THREE.SphereGeometry(20, 32, 32);
    const geodisco = new THREE.CylinderGeometry(22, 22, 6, 40);
    const geonervios = new THREE.BoxGeometry(4, 80, 4);
    const geomano = new THREE.CylinderGeometry(15, 15, 40, 40);
    const ancho = 19, alto = 20, fondo = 4, mueve = ancho;
    const geopalma = new THREE.BoxGeometry(ancho, alto, fondo);
    const geopinza = buildPinzas(ancho/2, alto/2, fondo/2, mueve);

    // Objetos
    suelo = new THREE.Mesh(geosuelo, materiales[0]);
    suelo.rotation.x += -1 * Math.PI/2;
    //suelo.position.y = -20;
    suelo.receiveShadow = true;

    //Objeto robot (Add: base)
    robot = new THREE.Object3D();

    //Objeto base (Add: brazo)
    base = new THREE.Mesh(geobase, materiales[1]);
    base.position.y += 7.5;
    base.receiveShadow = true;
    base.castShadow = true;

    //Objeto brazo (Add: eje + esparrago + rotula + antebrazo)
    brazo = new THREE.Object3D();

    //Objeto eje
    eje = new THREE.Mesh(geoeje, materiales[2]);
    eje.rotation.x = Math.PI/2;
    eje.receiveShadow = true;
    eje.castShadow = true;

    //Objeto esparrago
    esparrago = new THREE.Mesh(geoesparrago, materiales[3]);
    esparrago.position.y += 60;
    esparrago.receiveShadow = true;
    esparrago.castShadow = true;

    //Objeto rotula
    rotula = new THREE.Mesh(georotula, materiales[4]);
    rotula.position.y += 120;
    rotula.receiveShadow = true;
    rotula.castShadow = true;

    //Objeto antebrazo (Add: disco + nervios + mano)
    antebrazo = new THREE.Object3D();
    antebrazo.position.y += 120;

    //Objeto disco
    disco = new THREE.Mesh(geodisco, materiales[5]);
    disco.receiveShadow = true;
    disco.castShadow = true;

    //Objeto disco
    for (let i = 0; i < 4; i++) {
        nervios[i] = new THREE.Mesh(geonervios, materiales[6]);
        nervios[i].position.y += 40;
        nervios[i].position.x += x[i] * (22/2.5 - 2);
        nervios[i].position.z += z[i] * (22/2.5 - 2);
        nervios[i].receiveShadow = true;
        nervios[i].castShadow = true;
    }

    //Objeto mano
    mano = new THREE.Mesh(geomano, materiales[7]);
    mano.position.y += 80;
    mano.rotation.x = Math.PI/2;
    mano.receiveShadow = true;
    mano.castShadow = true;

    //Objeto pinzas
    dedos[0] = new THREE.Mesh(geopalma, materiales[8]);
    dedos[0].position.x += 20;
    dedos[0].position.y += 10;//Con respecto a mano
    dedos[0].rotation.x = Math.PI/2;
    dedos[0].receiveShadow = true;
    dedos[0].castShadow = true;

    pinzas[0] = new THREE.Mesh(geopinza, materiales[9]);
    pinzas[0].receiveShadow = true;
    pinzas[0].castShadow = true;

    dedos[1] = new THREE.Mesh(geopalma, materiales[8]);
    dedos[1].position.x += 20;
    dedos[1].position.y += -10;//Con respecto a mano
    dedos[1].rotation.x = Math.PI/2;
    dedos[1].receiveShadow = true;
    dedos[1].castShadow = true;

    pinzas[1] = new THREE.Mesh(geopinza, materiales[9]);
    pinzas[1].rotation.x = Math.PI;
    pinzas[1].receiveShadow = true;
    pinzas[1].castShadow = true;

    //Add room
    addRoom();

    //El grafo de escena es así:
    robot.add(base);
    base.add(brazo);
    brazo.add(eje);
    brazo.add(esparrago);
    brazo.add(rotula);
    antebrazo.add(disco);
    for (let i = 0; i < 4; i++) {
        antebrazo.add(nervios[i]);
    }
    dedos[0].add(pinzas[0]);
    mano.add(dedos[0]);
    dedos[1].add(pinzas[1]);
    mano.add(dedos[1]);
    antebrazo.add(mano);
    brazo.add(antebrazo);

    // Construir la escena
    scene.add(suelo);
    scene.add(robot);
}

function setupGUI() {

    //Interfaz de usuario
    effectController = {
        giroBase: 0,
        giroBrazo: 0,
        giroRotula: 0,
        giroAntebrazo: 0,
        giroMano: 0,
        aperturaPinza: 15,
        reiniciar: function () {
            angulo = 0
            location.reload();
        },
        color: new THREE.Color("rgb(183, 177, 165)")
    }
    let gui = new dat.GUI();
    let sub = gui.addFolder("Controles Robot")
    sub.add(effectController, "giroBase", -180, 180, 1).name("G. de la base en Y");
    sub.add(effectController, "giroBrazo", -45, 45, 1).name("G. del brazo en Z");
    sub.add(effectController, "giroAntebrazo", -180, 180, 1).name("G. del antebrazo en Y");
    sub.add(effectController, "giroRotula", -90, 90, 1).name("G. del antebrazo en Z");
    sub.add(effectController, "giroMano", -40, 220, 1).name("R. de la pinza en Z");
    sub.add(effectController, "aperturaPinza", 0, 15, 1).name("A/C de la pinza en Z");

    sub.add(effectController, "reiniciar")
    let sensorColor = sub.addColor(effectController, "color").name("Color")
    sensorColor.onChange(function (color) {
        robot.traverse(function (hijo) {
            if (hijo instanceof THREE.Mesh) {
                hijo.material.color = new THREE.Color(color)
            }
        })
    });
}

function render() {
    // Dibujar cada frame y lo muestra
    requestAnimationFrame(render);// Llega el evento de dibujo en llamada recursiva
    update();//Actualiza la escena
    renderer.clear();

    renderer.setViewport(0,0,
        window.innerWidth,window.innerHeight);
    renderer.render( scene, camera );

    // Camara perspectiva
    renderer.setViewport(0,0,
        window.innerWidth/4,window.innerHeight/4);
    renderer.render( scene, planta );
}

function update() {
    // Cambios entre frames
    cameraController.update();
    // Actualiza los FPS
    stats.update();
    base.rotation.y = effectController.giroBase * Math.PI / 180;
    brazo.rotation.z = effectController.giroBrazo * Math.PI / 180;
    antebrazo.rotation.y = effectController.giroAntebrazo * Math.PI / 180;
    antebrazo.rotation.z = effectController.giroRotula * Math.PI / 180;
    mano.rotation.y = effectController.giroMano * Math.PI / 180;
    dedos[0].position.y = 1 - effectController.aperturaPinza;
    dedos[1].position.y = -1 + effectController.aperturaPinza;
}

function addRoom() {
    let shader = THREE.ShaderLib.cube;
    shader.uniforms.tCube.value = textures[4];

    let shaderMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        dephtWrite: false,
        side: THREE.BackSide
    });

    let room = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), shaderMaterial);
    room.position.y += 500;
    scene.add(room);
}

function addStats(){
    // STATS --> stats.update() en update()
    stats = new Stats();
    stats.setMode(0);// Muestra FPS
    stats.domElement.style.cssText = 'position:absolute;bottom:0px;left:0px;';
    document.getElementById('container').appendChild(stats.domElement);
}

function setCameras(ar){
    // Construir las cuatro camaras (Planta, Alzado, Perfil y Perspectiva)
    let origen = new THREE.Vector3(0,0,0);

    // Ortograficas
    let camaraOrthographic;
    if(ar > 1){
        camaraOrthographic = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -1000, 1000);
    }
    else{
        camaraOrthographic = new THREE.OrthographicCamera(l, r, t/ar, b/ar, -1000, 1000);
    }

    alzado = camaraOrthographic.clone();
    alzado.position.set(0,0,4);
    alzado.lookAt(origen);
    perfil = camaraOrthographic.clone();
    perfil.position.set(4,0,0);
    perfil.lookAt(origen);
    planta = camaraOrthographic.clone();
    planta.position.set(0,300,0);
    planta.lookAt(origen);

    // Perspectiva
    let cameraPerspective = new THREE.PerspectiveCamera(40, ar, 0.1, 7000); // Inicializa camara (Angulo, razón de aspecto, Distancia con efecto, Distancia sin efecto)
    cameraPerspective.position.set(500, 500, 500);
    cameraPerspective.lookAt(new THREE.Vector3(0,0,0)); // A donde esta mirando la cámara

    camera = cameraPerspective.clone();

    /*scene.add(alzado);
    scene.add(perfil);*/
    scene.add(planta);
    scene.add(camera);
}

function updateAspectRatio() {
    // Indicarle al motor las nuevas dimensiones del canvas
    // Renueva la relación de aspecto de la camara
    // Ajustar el tamaño del canvas
    renderer.setSize(window.innerWidth,window.innerHeight);
    // Razón de aspecto
    let ar = window.innerWidth/window.innerHeight;

    // Para camara ortográfica
    if(ar>1){
        alzado.left = perfil.left = planta.left = l * ar;
        alzado.right = perfil.right = planta.right = r * ar;
        alzado.top = perfil.top = planta.top = t;
        alzado.bottom = perfil.bottom = planta.bottom = b;
    }
    else{
        alzado.left = perfil.left = planta.left = l;
        alzado.right = perfil.right = planta.right = r;
        alzado.top = perfil.top = planta.top = t/ar;
        alzado.bottom = perfil.bottom = planta.bottom = b/ar;
    }

    // Para camara perpectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();
}

function generateLights() {
    let luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene.add(luzAmbiente);

    let luzPuntual = new THREE.PointLight(0xFFFFFF, 0.7);
    luzPuntual.position.set(-100, 200, -100);
    scene.add(luzPuntual);

    let luzDireccional = new THREE.DirectionalLight(0xFFFFFF, 0.3);
    luzDireccional.position.set(0, 40, -300);
    scene.add(luzDireccional);

    let luzFocal = new THREE.SpotLight(0xFFFFFF, 0.7);
    luzFocal.position.set(300, 573, 0);
    luzFocal.target.position.set(0, 0, 0);
    luzFocal.angle = Math.PI / 7;
    luzFocal.penumbra = 0.2;

    luzFocal.shadow.camera.near = 100;
    luzFocal.shadow.camera.far = 1700;
    luzFocal.shadow.camera.fov = 7000;
    luzFocal.shadow.mapSize.width = 10000;
    luzFocal.shadow.mapSize.height = 10000;

    scene.add(luzFocal.target);
    luzFocal.castShadow = true;
    scene.add(luzFocal);
}

function generateTextures() {
    // Materiales
    let textureLoader = new THREE.TextureLoader()
    textures[0] = textureLoader.load(path + 'wood.jpg');
    textures[0].magFilter = THREE.LinearFilter;
    textures[0].minFilter = THREE.LinearFilter;
    textures[0].repeat.set(4, 3);
    textures[0].wrapS = textures[0].wrapT = THREE.MirroredRepeatWrapping;
    textures[1] = textureLoader.load(path + 'oxidado.jpg');
    textures[2] = textureLoader.load(path + 'oxidado.jpg');
    textures[3] = textureLoader.load(path + 'oxidado.jpg');
    let walls = [path + 'Tenerife/posx.bmp', path + 'Tenerife/negx.bmp',
        path + 'Tenerife/posy.bmp', path + 'Tenerife/negy.bmp',
        path + 'Tenerife/posz.bmp', path + 'Tenerife/negz.bmp'
    ];
    textures[4] = new THREE.CubeTextureLoader().load(walls);
    textures[5] = textureLoader.load(path + 'gold.jpg');
    textures[6] = textureLoader.load(path + 'gold.jpg');
    textures[7] = textureLoader.load(path + 'gold.jpg');
}

function generateMaterials() {
    // Materiales
    materiales[0] = new THREE.MeshLambertMaterial({
        color: new THREE.Color("rgb(183, 177, 165)"),
        map: textures[0]
    });
    materiales[1] = new THREE.MeshLambertMaterial({
        color: new THREE.Color("rgb(122, 49, 19)"),
        map: textures[1]
    });
    materiales[2] = new THREE.MeshLambertMaterial({
        color: new THREE.Color("rgb(220, 172, 74)"),
        map: textures[2]
    });
    materiales[3] = new THREE.MeshLambertMaterial({
        color: new THREE.Color("rgb(220, 172, 74)"),
        map: textures[3]
    });
    materiales[4] = new THREE.MeshPhongMaterial({
        color: 'white',
        specular: 'white',
        shininess: 50,
        envMap: textures[4]
    });
    materiales[5] = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgb(214, 175,58)"),
        specular: new THREE.Color("rgb(214, 175,58)"),
        shininess: 50,
        wireframe: false,
        map: textures[5]
    });
    materiales[6] = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgb(214, 175,58)"),
        specular: new THREE.Color("rgb(214, 175,58)"),
        shininess: 50,
        wireframe: false,
        map: textures[5]
    });
    materiales[7] = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgb(214, 175,58)"),
        specular: new THREE.Color("rgb(214, 175,58)"),
        shininess: 50,
        wireframe: false,
        map: textures[5]
    });
    materiales[8] = new THREE.MeshLambertMaterial({
        color: new THREE.Color("rgb(255, 95, 19)")
    });
    materiales[9] = new THREE.MeshLambertMaterial({
        color: new THREE.Color("rgb(255, 95, 19)")
    });
}

function buildPinzas(ancho, alto, fondo, x) {
    let geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-1 * ancho + x, -1 * alto,  1 * fondo),  // 0
        new THREE.Vector3( 1 * ancho + x, -1 * alto + (alto / 4),  1 * fondo),  // 1
        new THREE.Vector3(-1 * ancho + x,  1 * alto,  1 * fondo),  // 2
        new THREE.Vector3( 1 * ancho + x,  1 * alto - (alto / 4),  1 * fondo),  // 3
        new THREE.Vector3(-1 * ancho + x, -1 * alto, -1 * fondo),  // 4
        new THREE.Vector3( 1 * ancho + x, -1 * alto + (alto / 4), -1 * fondo / 2),  // 5
        new THREE.Vector3(-1 * ancho + x,  1 * alto, -1 * fondo),  // 6
        new THREE.Vector3( 1 * ancho + x,  1 * alto - (alto / 4), -1 * fondo / 2),  // 7
    );
    geometry.faces.push(
        // front
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(0, 1, 3),
        // right
        new THREE.Face3(1, 7, 3),
        new THREE.Face3(1, 5, 7),
        // back
        new THREE.Face3(5, 6, 7),
        new THREE.Face3(5, 4, 6),
        // left
        new THREE.Face3(4, 2, 6),
        new THREE.Face3(4, 0, 2),
        // top
        new THREE.Face3(2, 7, 6),
        new THREE.Face3(2, 3, 7),
        // bottom
        new THREE.Face3(4, 1, 0),
        new THREE.Face3(4, 5, 1),
    );

    geometry.computeFaceNormals();

    return geometry;
}