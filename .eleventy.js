// Per 11ty from scratch, we have to have a module.exports definition

const blogTools = require("eleventy-plugin-blog-tools");
const format = require('date-fns/format');
const parse = require('date-fns/parse');
const isDate = require('date-fns/isDate');
const pluginRss = require("@11ty/eleventy-plugin-rss");

// Function to sort by order frontmatter field then by fileSlug alphabetically
function sortByOrder(a,b) {
  return a.template.frontMatter.data.order - b.template.frontMatter.data.order || a.template.fileSlugStr.localeCompare(b.template.fileSlugStr)
}

module.exports = (eleventyConfig) => {

  // Register if running in dev or prod
  let env = process.env.ELEVENTY_ENV;

  // See if this helps with things that do not refresh
  module.exports = function (eleventyConfig) {
    eleventyConfig.setUseGitIgnore(false);
  };

  eleventyConfig.addPlugin(blogTools);
  eleventyConfig.addPlugin(pluginRss);

  /* -------------------------------------------------------------------------- */
  /*                                 Collections                                */
  /* -------------------------------------------------------------------------- */

   // Staff sorted by order number and then alphabetically
   eleventyConfig.addCollection("blogPublished", function(collectionApi) {
    return collectionApi.getFilteredByTag("blog").filter(c => c.template.frontMatter.data.published === true);
  });

  // Staff sorted by order number and then alphabetically
  eleventyConfig.addCollection("staff123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("staff").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Staff Emeritus sorted by order number and then alphabetically
  eleventyConfig.addCollection("staffEmeritus123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("staff-emeritus").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Cards published and sorted by order number and then alphabetically
  eleventyConfig.addCollection("cards123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("cards").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Big Cards published and sorted by order number and then alphabetically
  eleventyConfig.addCollection("bigcards123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("bigcards").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

  // Home Page Cards published and sorted by order number and then alphabetically
  eleventyConfig.addCollection("footer123ABC", function(collectionApi) {
    return collectionApi.getFilteredByTag("footer").filter(c => c.template.frontMatter.data.published === true).sort((a,b) => sortByOrder(a,b));
  });

/* -------------------------------------------------------------------------- */
/*                                   Filters                                  */
/* -------------------------------------------------------------------------- */

  // Format date for posts
  eleventyConfig.addFilter( "formatBlogListDate", (date) => format(date, "MMM do, yyyy"));

   // Format date for posts
   eleventyConfig.addFilter( "formatBlogPostDate", (date) => {
     return format(parse(date, "yyyy-MM-dd", new Date()),"MMM do, yyyy")
  });

  // Remove seconds from times
  eleventyConfig.addFilter( "stripSeconds", (val) => val.slice(0,5));

  /* -------------------------------------------------------------------------- */
  /*                                 Shortcodes                                 */
  /* -------------------------------------------------------------------------- */

  // Format Date/Time
  eleventyConfig.addShortcode('formatBlogDate', function (date, dateFormat = 'MMM d, y', dateParse = "MMM do, yyyy") {
    date = isDate(date) ? date : parse(date, dateParse, new Date())
    date = isDate(date) ? date : new Date();
    return format(date, dateFormat)
  });

  // Current Year
  eleventyConfig.addShortcode("currentYear", function () {
    const today = new Date();
    return today.getFullYear();
  });

  // SVG Sprite Shortcode
  eleventyConfig.addShortcode("icon", function(icon = "star", fill="fill-highlight") {
    return `<span class="icon"><svg class="icon-link__icon ${fill}">
      <use xlink:href="/static/images/icons.svg#${icon}"></use>
    </svg></span>`
  });

  // SVG Sprite Link Shortcode
  eleventyConfig.addShortcode("iconLink", function(link, title, icon = "star", fill="fill-highlight") {
    return `<a href="${link}" class="icon-link"><svg class="icon-link__icon ${fill}">
      <use xlink:href="/static/images/icons.svg#${icon}"></use>
    </svg><span class="icon-link__title">${title}</span></a>`
  });

  /* -------------------------------------------------------------------------- */
  /*                                 Build Stuff                                */
  /* -------------------------------------------------------------------------- */

  // Pass "static" things straight through from "src" to "dist"
  eleventyConfig.addPassthroughCopy("./src/static/");
  eleventyConfig.addPassthroughCopy("./images/");

  // Watch for changes in tailwind css
  eleventyConfig.addWatchTarget("./src/tailwind/tailwind.css");

  // Clarify which folder is for input and which folder is for output
  return {
    dir: {
      input: "src",
      output: "dist",
    },
  };
};
