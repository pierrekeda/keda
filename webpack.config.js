const path = require( 'path' );

let config = {

	entry: './src/test.js',

};

module.exports = ( env, argv ) => {

	if ( argv.mode === 'development' ) {

		config.mode = 'development';

		config.output = {
			filename: 'test.js',
			path: path.resolve( __dirname, 'test' )
		};

		config.devtool = 'inline-source-map';

		config.devServer = {
			// openPage: '/test/',
			contentBase: './test/',
			host: '192.168.1.10',
			port: 8080,
			disableHostCheck: true,
		};

	} else {

		config.mode = 'production';

		config.entry = './src/build.js';

		config.output = {
			path: path.resolve( __dirname, 'build' ),
			filename: 'keda.min.js'
		};

		config.module = {
			rules: [
				{
					test: /\.js$/,
					exclude: [ /node_modules/ ],
					loader: 'babel-loader',
					options: {
						presets: [ '@babel/preset-env' ]
					}
				}
			]
		};

		config.externals = [
			'animejs',
			'dat.gui',
			'three'
		];

	}

	return config;

};
