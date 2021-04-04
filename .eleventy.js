// Per 11ty from scratch, we have to have a module.exports definition

module.exports = (eleventyConfig) => {
  // See if this helps with things that do not refresh
  module.exports = function (eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);
  };

  // Make Liquid capable of rendering "partials"
  // eleventyConfig.setLiquidOptions({
  //   dynamicPartials: true,
  //   strict_filters: true,
  // });

  // Pass "static" things straight through from "src" to "dist"
  eleventyConfig.addPassthroughCopy("./src/static/");
  eleventyConfig.addPassthroughCopy("./images/");

  // Tailwind stuff
  eleventyConfig.addShortcode("version", function () {
    return String(Date.now());
  });

  // Because we're running PostCSS as a separate process, Eleventy doesn't know when styles have changed
  // Tell Eleventy to watch this CSS file so it can live-update changes into the browser for us
  eleventyConfig.addWatchTarget("./dist/tailwindoutlive.css");

  // SVG Sprite Shortcode
  eleventyConfig.addShortcode("iconLink", function(link, title, icon = "star") {
    return `<a href="${link}" class="icon-link"><svg class="icon-link__icon">
      <use xlink:href="/static/images/icons.svg#${icon}"></use>
    </svg><span class="icon-link__title">${title}</span></a>`
  });

  // Clarify which folder is for input and which folder is for output
  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
