var WINDOW_WIDTH = window.innerWidth;
var WINDOW_HEIGHT = window.innerHeight;

// Where our lights and cameras will go
var scene = new THREE.Scene();

// Keeps track of time
var clock = new THREE.Clock();

// How we will see the scene
var camera = new THREE.PerspectiveCamera(90, WINDOW_WIDTH / WINDOW_HEIGHT, 1, 10000);

window.camera = camera;

// Position the camera slightly above and in front of the scene
camera.position.set(0, 0, 0.01);
camera.up = new THREE.Vector3(0,0,1);

// Look at the center of the scene
camera.lookAt(scene.position);

// Think of the renderer as the engine that drives the scene
var renderer = new THREE.WebGLRenderer({antialias: true});

// Set the pixel ratio of the screen (for high DPI screens)
renderer.setPixelRatio(window.devicePixelRatio);

// Set the background of the scene to a orange/red
renderer.setClearColor(0xffd4a6);

// Set renderer to the size of the window
renderer.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

// Append the renderer to the DOM
document.body.appendChild( renderer.domElement );

// Apply VR stereo rendering to renderer
var effect = new THREE.VREffect(renderer);
effect.setSize(WINDOW_WIDTH, WINDOW_HEIGHT);

var manager = new WebVRManager(renderer, effect);

// Lights!
var dirLight = new THREE.DirectionalLight( 0xffffff, 0.75);
dirLight.position.set( -1, 1, 200).normalize();

var ambiLight = new THREE.AmbientLight(0x999999);

// Add the lights to the scene
scene.add(ambiLight);
scene.add(dirLight);

// function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {

//     var textures = [];

//     for ( var i = 0; i < tilesNum; i ++ ) {

//         textures[ i ] = new THREE.Texture();

//     }

//     var imageObj = new Image();

//     imageObj.onload = function () {

//         var canvas, context;
//         var tileWidth = imageObj.height;

//         for ( var i = 0; i < textures.length; i ++ ) {

//             canvas = document.createElement( 'canvas' );
//             context = canvas.getContext( '2d' );
//             canvas.height = tileWidth;
//             canvas.width = tileWidth;
//             context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
//             textures[ i ].image = canvas;
//             textures[ i ].needsUpdate = true;

//         }

//     };

//     imageObj.src = atlasImgUrl;

//     return textures;

// }

function bend( group, amount, multiMaterialObject ) {
    function bendVertices( mesh, amount, parent ) {
      var vertices = mesh.geometry.vertices;
  
      if (!parent) {
        parent = mesh;
      }
  
      for (var i = 0; i < vertices.length; i++) {
        var vertex = vertices[i];
  
        // apply bend calculations on vertexes from world coordinates
        parent.updateMatrixWorld();
  
        var worldVertex = parent.localToWorld(vertex);
  
        var worldX = Math.sin( worldVertex.x / amount) * amount;
        var worldZ = - Math.cos( worldVertex.x / amount ) * amount;
        var worldY = worldVertex.y  ;
  
        // convert world coordinates back into local object coordinates.
        var localVertex = parent.worldToLocal(new THREE.Vector3(worldX, worldY, worldZ));
        vertex.x = localVertex.x;
        vertex.z = localVertex.z+amount;
        vertex.y = localVertex.y;
      }
  
      mesh.geometry.computeBoundingSphere();
      mesh.geometry.verticesNeedUpdate = true;
    }
  
    for ( var i = 0; i < group.children.length; i ++ ) {
      var element = group.children[ i ];
  
      if (element.geometry.vertices) {
        if (multiMaterialObject) {
          bendVertices( element, amount, group);
        } else {
          bendVertices( element, amount);
        }
      }
    }
  }

  // panorma mesh
  var geometry = new THREE.SphereGeometry( 1000, 60, 60 );
  geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

var material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    map: THREE.ImageUtils.loadTexture(
      'louvre.jpg', // load placeholder rexture
      THREE.UVMapping
    )
  });

var pano = new THREE.Mesh( geometry, material );
pano.renderDepth = 2;
pano.rotation.set( 0, -90 * Math.PI / 180, 0 );
scene.add(pano);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

ctx.font = '20pt Arial';
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'white';
ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
ctx.fillStyle = 'black';
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(new Date().getTime(), canvas.width / 2, canvas.height / 2);

var textTexture = new THREE.Texture(canvas);
var textMaterial = new THREE.MeshBasicMaterial({ map: textTexture });
var textGeometry = new THREE.BoxGeometry( 50, 50, 50 );
var textMesh = new THREE.Mesh( textGeometry, textMaterial );
textMesh.position.z = 10;
textMesh.position.x = 10;
scene.add( textMesh );

// Lights!
var dirLight2 = new THREE.DirectionalLight( 0xffffff, 0.75);
dirLight2.position.set( -1, 1, textMesh.position.z + 10).normalize();

scene.add(dirLight2);

// var fontLoader = new THREE.FontLoader();

// var text = new THREE.TextGeometry('Test', {
//     size: 80,
//     height: 5,
// });

// var text0 = createMesh(text);
// text0.position.z = 10;
// scene.add(text0);

// var textures = getTexturesFromAtlasFile( "sun_temple_stripe.jpg", 6 );

// var materials = [];

// for ( var i = 0; i < 6; i ++ ) {

//     materials.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );

// }

// var skyBox = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), materials );
// skyBox.geometry.scale( 1, 1, - 1 );
// scene.add( skyBox );

// Detect mobile devices in the user agent
var is_mobile= /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Conditionally load VR or Fly controls, based on whether we're on a mobile device
if (is_mobile) {
    var controls = new THREE.VRControls(camera);
    console.log(controls);
    window.controls = controls;
} else {
    // WASD-style movement controls
    var controls = new THREE.FlyControls(camera);

    // Disable automatic forward movement
    controls.autoForward = false;

    // Click and drag to look around with the mouse
    controls.dragToLook = true;

    // Movement and roll speeds, adjust these and see what happens!
    controls.movementSpeed = 20;
    controls.rollSpeed = Math.PI / 12;
}

// Render loop
// This should go at the bottom of the script.
function render() {

    // Get the difference from when the clock was last updated and update the controls based on that value.
    var delta = clock.getDelta();
    controls.update(delta);

    // Update the scene through the manager.
    manager.render(scene, camera);

    // Call the render function again
    requestAnimationFrame( render );

}

render();