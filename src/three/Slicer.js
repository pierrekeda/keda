import * as THREE from 'three';

import { CSG } from '../three/csg/ThreeCSG.js';

class Slicer extends THREE.Group {

	constructor(
		geometry = new THREE.BoxGeometry(),
		material = new THREE.MeshBasicMaterial(),
		{ x = 2, y = 1, z = 1 } = {}
	) {

		super();

		this.geometry = geometry;
		this.material = material;

		if ( geometry.vertices.length > 0 ) this.compute( x, y, z );

	}

	compute( slicesX, slicesY, slicesZ ) {

		const geometry = this.geometry;

		// Create slice reference

		geometry.computeBoundingBox();

		if ( geometry instanceof THREE.TextGeometry ) {

			Slicer.fixTextGeometry( geometry );

		}

		this.csg = CSG.fromGeometry( this.geometry );

		let startX = geometry.boundingBox.min.x;
		let startY = geometry.boundingBox.min.y;
		let startZ = geometry.boundingBox.min.z;

		const endX = geometry.boundingBox.max.x;
		const endY = geometry.boundingBox.max.y;
		const endZ = geometry.boundingBox.max.z;

		const width  = endX - startX;
		const height = endY - startY;
		const depth  = endZ - startZ;

		if ( slicesX < 1 ) slicesX = 1;
		if ( slicesY < 1 ) slicesY = 1;
		if ( slicesZ < 1 ) slicesZ = 1;

		const sliceWidth  = width / slicesX;
		const sliceHeight = height / slicesY;
		const sliceDepth  = depth  / slicesZ;

		startX = ( sliceWidth - width ) / 2;
		startY = ( sliceHeight - height ) / 2;
		startZ = ( sliceDepth - depth ) / 2;

		let data = [];

		for ( let sliceX = 0; sliceX < slicesX; sliceX ++ ) {

			const x = startX + sliceX * sliceWidth;

			for ( let sliceY = 0; sliceY < slicesY; sliceY ++ ) {

				const y = startY + sliceY * sliceHeight;

				for ( let sliceZ = 0; sliceZ < slicesZ; sliceZ ++ ) {

					const z = startZ + sliceZ * sliceDepth;

					data.push( {
						id: data.length,
						x: x,
						y: y,
						z: z,
						width: sliceWidth,
						height: sliceHeight,
						depth: sliceDepth,
					} );

				}

			}

		}

		this.data = data;
		this.length = data.length;

		this._createSlices();

	}

	_createSlices() {

		const sliceData = this.data;

		let slices = [];

		for ( let i = 0, l = sliceData.length; i < l; i ++ ) {

			const data = sliceData[ i ];

			let box = new THREE.Mesh(
				new THREE.BoxGeometry( data.width, data.height, data.depth )
			);
			box.position.set( data.x, data.y, data.z );
			box.updateMatrix();

			let mask = CSG.fromMesh( box );

			let intersect = this.csg.intersect( mask );


			let slice = CSG.toMesh( intersect, this.matrix );

			slice.material = this.material;

			slices.push( slice );
			this.add( slice );

		}

		this.slices = slices;

	}

}

Slicer.fixTextGeometry = ( geometry ) => {

	const offsetX = geometry.boundingBox.max.x / 2;
	const offsetY = geometry.boundingBox.max.y / 2;
	const offsetZ = geometry.boundingBox.max.z / 2;

	geometry.boundingBox.min.x = - offsetX;
	geometry.boundingBox.max.x = offsetX;
	geometry.boundingBox.min.y = - offsetY;
	geometry.boundingBox.max.y = offsetY;
	geometry.boundingBox.min.z = - offsetZ;
	geometry.boundingBox.max.z = offsetZ;

	let vertices = geometry.vertices;
	for ( let i = 0, l = vertices.length; i < l; i ++ ) {

		let vertice = vertices[ i ];
		vertice.x -= offsetX;
		vertice.y -= offsetY;
		vertice.z -= offsetZ;

	}

};

export { Slicer };
