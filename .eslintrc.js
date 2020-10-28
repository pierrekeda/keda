module.exports = {
	'env': {
		'browser': true,
		'es2020': true
	},

	'parserOptions': {
		'ecmaVersion': 11,
		'sourceType': 'module'
	},

	'extends': [
		'eslint:recommended',
		'mdcs'
	],

	'rules': {
		'indent': 'warn',
		'key-spacing': 'off',
		'no-multi-spaces': 'off',
		'quotes': [ 'error', 'single' ],
		// 'max-len': [ 'warn', { 'code': 80 } ]
	},

	'ignorePatterns': [ 'dist/*', 'build/*', 'test/*', 'vendor/*', '_/*' ]
};
