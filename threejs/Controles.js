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

// Variables globales
let suelo, robot, base;
let brazo, eje, esparrago, rutula;
let antebrazo, disco, nervios = [];
let mano, dedos = [], pinzas = [];
let x = [1, 1, -1, -1], z = [-1, 1, 1, -1], material = [], angulo = 0;
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
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.autoClear = false; //Para que no borre cada vez que defino un ViewPort
    //Agregamos el elemento canvas de renderer al contenedor
    document.getElementById('container').appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();

    // Camara
    let ar = window.innerWidth / window.innerHeight;// Razón de aspecto
    setCameras(ar);

    // Controlador de camara
    cameraController = new THREE.OrbitControls( camera, renderer.domElement );
    cameraController.target.set(0,0,0);

    // STATS --> stats.update() en update()
    stats = new Stats();
    stats.setMode(0);					// Muestra FPS
    stats.domElement.style.cssText = 'position:absolute;bottom:0px;left:0px;';
    document.getElementById('container').appendChild(stats.domElement);

    // Captura de eventos
    window.addEventListener('resize', updateAspectRatio);
}

function loadScene() {
    // Cargar la escena con objetos
    generateMaterials();
    // Geometrias
    const geosuelo = new THREE.PlaneGeometry(750, 750, 20, 20);
    const geobase = new THREE.CylinderGeometry(50, 50, 15, 50);
    const geoeje = new THREE.CylinderGeometry(20, 20, 18, 40);
    const geoesparrago = new THREE.BoxGeometry(18, 120, 12);
    const georotula = new THREE.SphereGeometry(20, 32, 20);
    const geodisco = new THREE.CylinderGeometry(22, 22, 6, 40);
    const geonervios = new THREE.BoxGeometry(4, 80, 4);
    const geomano = new THREE.CylinderGeometry(15, 15, 40, 10);
    const ancho = 19, alto = 20, fondo = 4, mueve = ancho;
    const geopalma = new THREE.BoxGeometry(ancho, alto, fondo);
    const geopinza = buildPinzas(ancho/2, alto/2, fondo/2, mueve);
    //const geopinza = buildPinzas(ancho, alto, fondo, mueve);
    // Objetos
    suelo = new THREE.Mesh(geosuelo, material[0]);
    suelo.rotation.x += Math.PI/2;
    suelo.rotation.z += Math.PI/4;

    //Objeto robot (Add: base)
    robot = new THREE.Object3D();

    //Objeto base (Add: brazo)
    base = new THREE.Mesh(geobase, material[1]);
    base.position.y += 7.5;

    //Objeto brazo (Add: eje + esparrago + rotula + antebrazo)
    brazo = new THREE.Object3D();

    //Objeto eje
    eje = new THREE.Mesh(geoeje, material[2]);
    eje.rotation.x = Math.PI/2;

    //Objeto esparrago
    esparrago = new THREE.Mesh(geoesparrago, material[3]);
    esparrago.position.y += 60;

    //Objeto rotula
    rotula = new THREE.Mesh(georotula, material[4]);
    rotula.position.y += 120;

    //Objeto antebrazo (Add: disco + nervios + mano)
    antebrazo = new THREE.Object3D();
    antebrazo.position.y += 120;

    //Objeto disco
    disco = new THREE.Mesh(geodisco, material[5]);

    //Objeto disco
    for (let i = 0; i < 4; i++) {
        nervios[i] = new THREE.Mesh(geonervios, material[6]);
        nervios[i].position.y += 40;
        nervios[i].position.x += x[i] * (22/2.5 - 2);
        nervios[i].position.z += z[i] * (22/2.5 - 2);
    }

    //Objeto mano
    mano = new THREE.Mesh(geomano, material[7]);
    mano.position.y += 80;
    mano.rotation.x = Math.PI/2;

    //Objeto pinzas
    dedos[0] = new THREE.Mesh(geopalma, material[8]);
    dedos[0].position.x += 20;
    dedos[0].position.y += 10;//Con respecto a mano
    dedos[0].rotation.x = Math.PI/2;

    pinzas[0] = new THREE.Mesh(geopinza, material[1]);

    dedos[1] = new THREE.Mesh(geopalma, material[8]);
    dedos[1].position.x += 20;
    dedos[1].position.y += -10;//Con respecto a mano
    dedos[1].rotation.x = Math.PI/2;

    pinzas[1] = new THREE.Mesh(geopinza, material[1]);
    pinzas[1].rotation.x = Math.PI;

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
    //mano.add( new THREE.AxisHelper(1000) );
    antebrazo.add(mano);
    brazo.add(antebrazo);

    // Construir la escena
    scene.add(suelo);
    scene.add(robot);
    //scene.add( new THREE.AxisHelper(1000) ); // Ayudante de ejes para la escena

}

function update() {
    // Cambios entre frames
    cameraController.update();
    // Actualiza los FPS
    stats.update();
    base.rotation.y = effectController.giroBase * Math.PI / 180
    brazo.rotation.z = effectController.giroBrazo * Math.PI / 180
    antebrazo.rotation.y = effectController.giroAntebrazo * Math.PI / 180
    antebrazo.rotation.z = effectController.giroRotula * Math.PI / 180
    mano.rotation.y = effectController.giroMano * Math.PI / 180
    dedos[0].position.y = 1 - effectController.aperturaPinza
    dedos[1].position.y = -1 + effectController.aperturaPinza
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
        color: "rgb(255,0,0)"
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
    // let sensorColor = sub.addColor(effectController, "color").name("Color")
    // sensorColor.onChange(function (color) {
    //     robot.traverse(function (hijo) {
    //         if (hijo instanceof THREE.Mesh) {
    //             hijo.material.color = new THREE.Color(color)
    //         }
    //     })
    // });
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

function generateMaterials() {
    // Materiales
    material[0] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(200, 50, 100)"),
        wireframe:true
    });
    material[1] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(193, 51, 255)"),
        wireframe:true
    });
    material[2] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(193, 51, 255)"),
        wireframe:true
    });
    material[3] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(193, 51, 255)"),
        wireframe:true
    });
    material[4] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(193, 51, 255)"),
        wireframe:true
    });
    material[5] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(215, 25, 25)"),
        wireframe:true
    });
    material[6] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(193, 51, 255)"),
        wireframe:true
    });
    material[7] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(193, 51, 255)"),
        wireframe:true
    });
    material[8] = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(193, 51, 255)"),
        wireframe:true
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