class Clock {

	/**
	 * @param {Function} callback Function
	 * @param {Number} fps Frames per second limiter, 0 for uncapped frames
	 */
	constructor( callback = null, fps = 0 ) {

		this.fps = fps;
		this.callback = callback;

		this._time = ( typeof performance === 'undefined' ) ? Date : performance;

		this._start = 0;
		this._previous = 0;
		this._elapsed = 0;
		this._delta = 0;

	}

	start() {

		this._start = this.now;
		this._previous = this._start;
		this._elapsed = 0;
		this._delta = 0;

		this._raf = requestAnimationFrame( this.update.bind( this ) );

	}

	stop() {

		cancelAnimationFrame( this._raf );

	}

	update() {

		let delta = 0;

		const current = this.now;

		delta = current - this._previous;
		this._previous = current;
		this._elapsed += delta;
		this._delta += delta;

		if ( this._delta >= this._frameDuration ) {

			this.callback.call();
			this._delta = 0;

		}

		this._raf = requestAnimationFrame( this.update.bind( this ) );

	}

	/*-------------------------------------------------------------------/

        Getters / Setters

    /-------------------------------------------------------------------*/

	get delta() {

		return ( this._delta > 0 && this._delta < 34 ) ? this._delta : 16.67;

	}

	get elapsed() {

		return this._elapsed;

	}

	get fps() {

		return this._fps;

	}

	get now() {

		return this._time.now();

	}

	set fps( fps ) {

		this._fps = fps;
		this._frameDuration = ( fps > 0 ) ? Math.floor( 1000 / fps ) : 0;

	}

}

export { Clock };
