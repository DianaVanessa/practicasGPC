//Shader vertices
/*
Aplicamos la formula de distancia para difinir la proporción

AB = sqrt(pow((X2 - X1), 2)+pow((Y2 - Y1), 2))

Donde X1 = 0 y Y1 = 0

https://www.tutorialspoint.com/webgl/webgl_modes_of_drawing.htm
*/
const VSHADER_SOURCE = `
    attribute vec4 position;
    attribute vec4 color;
    
    varying lowp vec4 vColor;
    int maxColor = 255;
    
    void main() {
       gl_Position = position;
       gl_PointSize = 10.0;
       float AB = sqrt(pow(position[0], float(2))+pow(position[1], float(2)));
       vColor = vec4(255/maxColor, 138/maxColor, 51/maxColor,(float(1) - (float(1) - AB)));
    }`;

//Shader fragmentos
const FSHADER_SOURCE = `
    varying lowp vec4 vColor;
    
    void main() {
       gl_FragColor = vColor;
    }`;

function main() {
    let maxColor = 255;

    // Recuperar el lienzo
    let canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log("Fallo en la carga del canvas!");
        return;
    }

    // Recuperar el contexto del render
    let gl = getWebGLContext(canvas);
    if(!gl) {
        console.log("Fallo la carga del contexto de render!");
        return;
    }

    // Cargar, compilar y montar los shaders en un programa
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Fallo la carga de los shaders!");
    }

    //Fija el color de borrado del canvas
    gl.clearColor(135/maxColor, 71/maxColor, 100/maxColor, 1.0);

    //Se borra el canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Localiza el atributo en el shader de vertices
    let coordenadas = gl.getAttribLocation(gl.program, 'position');

    // Registrar event
    canvas.onmousedown = function(event){
        click(event, gl, canvas, coordenadas);
    }
}

var puntos = []; // Almacena los puntos
var vertices = []; // Almacena los vertices
function click(event, gl, canvas, coordenadas) {
    // Procesar la coordenada del click
    let x = event.clientX;
    let y = event.clientY;
    let rect = event.target.getBoundingClientRect();

    // Conversión de coordenadas
    x = ((x-rect.left) - canvas.width/2) * 2/canvas.width;
    console.log("X: " + "((" + (x-rect.left) + ") - " + (canvas.width/2) + ") * " + (2/canvas.width) + " = " + x);
    y = (canvas.height/2 - (y-rect.top)) * 2/canvas.height;
    console.log("Y: " + "(" + (canvas.height/2) + " - (" + (y-rect.top) + ")) * " + (2/canvas.height) + " = " + y);

    // Guaradar el punto
    let punto = [];
    punto.push(x);
    punto.push(y);
    puntos.push(punto);
    vertices = [];
    for (let i = 0; i < puntos.length; i++) {
        vertices.push(puntos[i][0])
        vertices.push(puntos[i][1])
        vertices.push(0)
    }

    //Se borra el canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Create an empty buffer object
    const VERTEX_BUFFER = gl.createBuffer();
    // Bind appropriate array buffer to it
    gl.bindBuffer(gl.ARRAY_BUFFER, VERTEX_BUFFER);
    // Pass the vertex data to the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Point an attribute to the currently bound VBO
    gl.vertexAttribPointer(coordenadas, 3, gl.FLOAT, false, 0, 0);
    // Enable the attribute
    gl.enableVertexAttribArray(coordenadas);
    // Draw points
    gl.drawArrays(gl.POINTS, 0.0, puntos.length);
    // Draw lines
    gl.drawArrays(gl.LINE_STRIP, 0.0, puntos.length);
    // Unbind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}