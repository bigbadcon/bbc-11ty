/* eslint-disable */
let fs = require("fs");

//CDN
build({
	entryPoints: [`src/_scripts/scripts.js`],
	outfile: `dist/js/scripts.min.js`,
	bundle: true,
	minify: true,
	sourcemap: false,
	platform: "browser",
	target: "es2019",
});
//Example
build({
	entryPoints: [`src/_scripts/scripts.js`],
	outfile: `dist/js/scripts.js`,
	bundle: true,
	minify: false,
	sourcemap: false,
	platform: "browser",
	target: "es2019",
});

function build(options) {
	options.define || (options.define = {});
	options.define["process.env.NODE_ENV"] = process.argv.includes("--watch") ? `'production'` : `'development'`;

	return require("esbuild")
		.build({
			watch: process.argv.includes("--watch"),
			// external: ['alpinejs'],
			...options,
		})
		.catch(() => process.exit(1));
}
