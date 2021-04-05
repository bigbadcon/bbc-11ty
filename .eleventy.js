// Per 11ty from scratch, we have to have a module.exports definition

const blogTools = require("eleventy-plugin-blog-tools");
const format = require('date-fns/format');

// Function to sort by order frontmatter field then by fileSlug alphabetically
function sortByOrder(a,b) {
  return a.template.frontMatter.data.order - b.template.frontMatter.data.order || a.template.fileSlugStr.localeCompare(b.template.fileSlugStr)
}

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

  eleventyConfig.addPlugin(blogTools);

   // Staff sorted by order number and then alphabetically
   eleventyConfig.addCollection("blogPublished", function(collectionApi) {
    return collectionApi.getFilteredByTag("blog").filter(c => c.template.frontMatter.data.status === "published");
  });

  // Staff sorted by order number and then alphabetically
  eleventyConfig.addCollection("staff123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("staff").filter(c => c.template.frontMatter.data.status === "published").sort((a,b) => sortByOrder(a,b));
  });

  // Staff Emeritus sorted by order number and then alphabetically
  eleventyConfig.addCollection("staffEmeritus123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("staff-emeritus").filter(c => c.template.frontMatter.data.status === "published").sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Cards published and sorted by order number and then alphabetically
   eleventyConfig.addCollection("cards123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("cards").filter(c => c.template.frontMatter.data.status === "published").sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Cards published and sorted by order number and then alphabetically
  eleventyConfig.addCollection("footer123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("footer").filter(c => c.template.frontMatter.data.status === "published").sort((a,b) => sortByOrder(a,b));
  });

  // Pass "static" things straight through from "src" to "dist"
  eleventyConfig.addPassthroughCopy("./src/static/");
  eleventyConfig.addPassthroughCopy("./images/");

  // Format date for posts
  eleventyConfig.addFilter( "formatDate", (val) => format(val, "MMM do, yyyy"));

  // Current Year
  eleventyConfig.addShortcode("currentYear", function () {
    const today = new Date();
    return today.getFullYear();
  });

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
