const canvas = document.querySelector("canvas");
const webgl = canvas.getContext("webgl");

if (!webgl) {
    throw Error("Not webgl related")
}

const vertex = new Float32Array([

    //Square of 2 triangles
    -1, -1, -1,
    1, -1, -1,
    1, -1, 1,

    -1, -1, -1,
    1, -1, 1,
    -1, -1, 1,

    // Side triangle 1
    0, 1, 0,
    1, -1, 1,
    -1, -1, 1,
    // Side triangle 2
    0, 1, 0,
    1, -1, -1,
    1, -1, 1,

    // Side triangle 3
    0, 1, 0,
    1, -1, -1,
    -1, -1, -1,

    // Side triangle 4
    0, 1, 0,
    -1, -1, -1,
    -1, -1, 1,

]);

const colour = new Float32Array([
    //Square of 2 triangles
    1.0, 0.5, 0,
    1.0, 0.5, 0,
    1.0, 0.5, 0,

    1.0, 0.5, 0,
    1.0, 0.5, 0,
    1.0, 0.5, 0,

    // Side triangle 1
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    // Side triangle 2
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // Side triangle 3
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // Side triangle 4
    0, 1, 1,
    0, 1, 1,
    0, 1, 1,
]);

const vbuffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER, vbuffer)
webgl.bufferData(webgl.ARRAY_BUFFER, vertex, webgl.STATIC_DRAW);

const cBuffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER, cBuffer);
webgl.bufferData(webgl.ARRAY_BUFFER, colour, webgl.STATIC_DRAW);

const vSource = `
        attribute vec3 object;
        attribute vec3 color;
        varying vec3 fragcolor;
        uniform float shrink;
        uniform mat4 model_a,model_b,model_c; 

        void main(){
            gl_Position=model_c*model_b*model_a*vec4(object*0.5,shrink);
            fragcolor=color;
        }
`

const cSource = `
        precision mediump float;
        varying vec3 fragcolor;

        void main(){
            gl_FragColor=vec4(fragcolor,1);
        }
`

const vShader = webgl.createShader(webgl.VERTEX_SHADER);
webgl.shaderSource(vShader, vSource);
webgl.compileShader(vShader);

const cShader = webgl.createShader(webgl.FRAGMENT_SHADER);
webgl.shaderSource(cShader, cSource);
webgl.compileShader(cShader)

const program = webgl.createProgram();
webgl.attachShader(program, vShader);
webgl.attachShader(program, cShader);
webgl.linkProgram(program);
webgl.useProgram(program)

webgl.bindBuffer(webgl.ARRAY_BUFFER, vbuffer);
const positionLocation = webgl.getAttribLocation(program, `object`);
webgl.enableVertexAttribArray(positionLocation);
webgl.vertexAttribPointer(positionLocation, 3, webgl.FLOAT, false, 0, 0);


webgl.bindBuffer(webgl.ARRAY_BUFFER, cBuffer)
const colourLocation = webgl.getAttribLocation(program, "color")
webgl.enableVertexAttribArray(colourLocation);
webgl.vertexAttribPointer(colourLocation, 3, webgl.FLOAT, false, 0, 0);

var model_a = [];
var model_b = [];
var model_c = [];

var angleInRad = 20;
var c = 0;
var s = 0;
var x_triangle = 0.0;
var y_triangle = 0.0;
var angle = 0.0;
var x = 0;
var y = 0;
var z = 0;

function draw() {
    webgl.clearColor(0, 0, 0, 1);
    webgl.clear(webgl.COLOR_BUFFER_BIT);
    webgl.enable(webgl.DEPTH_TEST);
    angleInRad = angleInRad + 0.025;

    c = Math.cos(angleInRad);
    s = Math.sin(angleInRad);

    //rotate in x
    model_a = [1, 0, 0, 0,
        0, c, -s, 0,
        0, s, c, 0,
        x, y, -.5, 1];
    
    //rotate in y
    model_b = [c, 0, -z, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        x, 0, z, 1];

    //rotate in z
    model_c = [c, -s, 0, 0,
                 s, c, 0, 0,
                0, 0, 1, 0,
                x, y, 0, 1];

                
    webgl.uniform1f((webgl.getUniformLocation(program, "a")), angle);
    webgl.uniformMatrix4fv(webgl.getUniformLocation(program, "model_a"), false, model_a);
    webgl.uniformMatrix4fv(webgl.getUniformLocation(program, "model_b"), false, model_b);
    webgl.uniformMatrix4fv(webgl.getUniformLocation(program, "model_c"), false, model_c)
    webgl.uniform1f(webgl.getUniformLocation(program,"shrink"),shrink);
    webgl.drawArrays(webgl.TRIANGLES, 0, vertex.length / 3);
    window.requestAnimationFrame(draw);

}

draw();

var shrink=0.0;
var sun=document.getElementById("myRange")
sun.oninput=function(){
    shrink=sun.value;

}