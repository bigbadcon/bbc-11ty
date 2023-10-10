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
		.context({
			...options,
		})
		.then((context) => {
			if (process.argv.includes("--watch")) {
				// Enable watch mode
				context.watch();
			} else {
				// Build once and exit if not in watch mode
				context.rebuild().then((result) => {
					context.dispose();
				});
			}
		})
		.catch(() => process.exit(1));
}
