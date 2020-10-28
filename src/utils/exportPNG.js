function exportPNG( canvas, name ) {

	let link = document.createElement( 'a' );
	link.download = `${name}.png`;
	link.href = canvas.toDataURL( 'image/png' );
	link.click();
	link = null;

}

export { exportPNG };
