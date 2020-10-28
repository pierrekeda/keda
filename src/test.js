import * as THREE from 'three';
import * as KEDA from './keda.js';

///////// CORE

//// Clock

// var clock = new KEDA.Clock( () => {

// 	console.log( clock.elapsed );

// }, 60 );
// clock.start();

//// Updator

// var foo = { update: () => {

// 	console.log( 'foo' );

// } };
// var bar = { update: () => {

// 	console.log( 'bar' );

// } };
// var updator = new KEDA.Updator();
// updator.add( foo );
// updator.add( bar );
// updator.update();

///////// GLSL

// console.log( KEDA.simplex3 );
// console.log( KEDA.vUv );
// console.log( KEDA.bayerMatrixDither );
// console.log( KEDA.ease.quadInOut );
// console.log( KEDA.linearGradient );
// console.log( KEDA.transforms );


///////// PLUGINS

//// ColorShifter

// var shifter = new KEDA.ColorShifter( '#0000ff', 0.1 );
// shifter.update();
// console.log( shifter.color );

// var gesture = new KEDA.Gesture( { debug: true } );
// console.log( gesture );

///////// THREE

// console.log( KEDA.CSG );

// var renderer = new THREE.WebGLRenderer();
// KEDA.GPUComputer.init( renderer );
// var computer = new KEDA.GPUComputer( 16 );
// console.log( computer );

// var tweener = new KEDA.GPUTweener();
// console.log( tweener );

var adjustments = new KEDA.AdjustmentsPass();
console.log( adjustments );

var bloom = new KEDA.BloomPass();
console.log( bloom );

var gaussianBlur = new KEDA.GaussianBlurPass();
console.log( gaussianBlur );

var radialBlur = new KEDA.RadialBlurPass();
console.log( radialBlur );

var reflector = new KEDA.ReflectorPass();
console.log( reflector );

// console.log( KEDA.fitCameraToSelection );

// var slicer = new KEDA.Slicer();
// console.log( slicer );

// var fsGradient = new KEDA.FullScreenGradient();
// console.log( fsGradient );

///////// UTILS

// console.log( KEDA.capitalize( 'abc' ) );

// console.log( KEDA.detectMobile() );

// console.log( KEDA.exportPNG );

// var random = KEDA.random.int( 0, 10 );
// console.log( random );
