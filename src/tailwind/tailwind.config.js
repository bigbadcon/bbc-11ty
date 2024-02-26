const plugin = require("tailwindcss/plugin");

const scale = {
	"2xs": "0.236rem",
	xs: "0.382rem",
	sm: "0.618rem",
	base: "1rem",
	md: "1.618rem",
	lg: "2.618rem",
	xl: "4.236rem",
};

const colors = {
	"header-bg": "var(--header-bg)",
	"header-bg-2": "var(--header-bg-2)",
	"header-bg-3": "var(--header-bg-3)",
	title: "var(--title)",
	highlight: "var(--highlight)",
	"highlight-2": "var(--highlight-2)",
	header: "var(--header)",
	body: "var(--body)",
	link: "var(--link)",
	hr: "var(--hr)",
	"gradient-start": "var(--gradient-start)",
	"gradient-mid": "var(--gradient-mid)",
	"gradient-end": "var(--gradient-end)",
	card: "var(--card)",
	form: "var(--card)",
	backdrop: "var(--backdrop)",
};

module.exports = {
	content: ["./dist/**/*.html", "./src/**/*.njk", "./src/**/*.html"],
	theme: {
		darkMode: "class",
		extend: {
			spacing: scale,
			colors: colors,
			fontSize: {
				"2xs": "0.6rem",
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: "70rem",
						color: "var(--body)",
						lineHeight: "1.45",
						h1: {
							color: "var(--title)",
							fontFamily: "var(--serif)",
							fontSize: "3rem",
							lineHeight: "1.20",
							marginBottom: "0.5em",
							marginTop: "1.4rem",
						},
						h2: {
							color: "var(--title)",
							fontFamily: "var(--serif)",
							fontSize: "2.25rem",
							lineHeight: "1.10",
							marginBottom: "0.5em",
							marginTop: "1.3rem",
						},
						h3: {
							color: "var(--header)",
							fontFamily: "var(--serif)",
							fontSize: "1.75rem",
							lineHeight: "1.05",
							marginBottom: "0.5em",
							marginTop: "1.1rem",
						},
						h4: {
							color: "var(--header)",
							fontFamily: "var(--serif)",
							fontSize: "1.60rem",
							lineHeight: "1.00",
							marginBottom: "0.5em",
							marginTop: "1em",
						},
						a: {
							color: "var(--link)",
							transition: "color 500ms",
							fontWeight: "inherit",
							textDecorationColor: "var(--highlight)",
							textUnderlineOffset: "2px",
							"&:hover": {
								color: "var(--body)",
							},
						},
						code: {
							color: "var(--body)",
						},
						strong: {
							color: "inherit",
							fontWeight: "700",
						},
						ul: {
							marginBottom: "1.618rem",
						},
						"ul > li::marker": {
							color: "var(--secondary)",
						},
						hr: {
							borderColor: "var(--hr)",
							borderTopWidth: "4px",
							marginTop: "1rem",
							marginBottom: "1.618rem",
						},
						thead: {
							borderBottomColor: "var(--hr)",
						},
						"thead th": {
							color: "var(--header)",
						},
						"tbody tr": {
							borderBottomColor: "var(--hr)",
						},
						pre: {
							backgroundColor: "var(--card)",
							color: "var(--body)",
						},
					},
				},
			},
			height: {
				"footer-mobile": "36rem",
			},
			fill: {
				highlight: "var(--fill-highlight)",
				body: "var(--body)",
			},
			maxWidth: {
				hero: "120ch",
				content: "70ch",
			},
			maxHeight: {
				"blog-cover-image": "398px",
			},
			fontFamily: {
				sans: ["Open Sans", "Helvetica", "sans-serif"],
				serif: ["Rokkitt", "serif"],
			},
			lineHeight: {
				sub: ".9",
			},
		},
	},
	variants: {
		extend: {
			padding: ["hover"],
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/aspect-ratio"),
		require("@tailwindcss/forms"),
		plugin(function ({ addComponents }) {
			addComponents({
				".h2": {
					color: "var(--header)",
					fontFamily: "var(--serif)",
					fontSize: "2.25rem",
					lineHeight: "1.10",
					marginBottom: "0.5em",
					marginTop: "1.4em",
				},
			});
		}),
	],
};
