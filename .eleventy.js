const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const {
  DateTime
} = require("luxon");
const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {

  eleventyConfig.addFilter('sortByStartDate', values => {
    return values.slice().sort((a, b) => a.data.startDate.localeCompare(b.data.startDate))
  })

  // 11ty Data Extension
  // To Support .yaml Extension in _data
  // You may remove this if you can use JSON
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
  // Filters
  // 11ty Quick Tip: #1 Inline Minified CSS - https://www.11ty.dev/docs/quicktips/inline-css/
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });
  // This filter can be applied to a njk variable and will render the time as: 12:00 PM
  eleventyConfig.addFilter("dateTime", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toLocaleString(DateTime.TIME_SIMPLE);
  });
  eleventyConfig.addFilter("readableEventDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toLocaleString(DateTime.DATE_FULL);
  });
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toISODate();
  });
  // localized time -> "9:00 AM"
  eleventyConfig.addFilter("time", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toFormat('t');
  });
  // month as an unabbreviated localized string -> "August"
  eleventyConfig.addFilter("month", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toFormat('LLLL');
  });
  // month as a padded number -> "08"
  eleventyConfig.addFilter("monthShort", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toFormat('LL');
  });
  // day of the week, as an unabbreviated localized string -> "Wednesday"
  eleventyConfig.addFilter("day", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toFormat('EEEE');
  });
  // Renders to day of the week, as an abbreviate localized string -> "Wed"
  eleventyConfig.addFilter("dayShort", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toFormat('EEE');
  });
  // Renders to Day of the month, padded to 2 -> "06"
  eleventyConfig.addFilter("date", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {
      zone: "America/New_York",
    })
      .setLocale("en")
      .toFormat('dd');
  });
  // Limit: Restricts the amount of items displayed in a collection
  eleventyConfig.addNunjucksFilter("limit", (arr, limit) =>
    arr.slice(0, limit)
  );

  function sortByTitle(values) {
    let vals = [...values];     // this *seems* to prevent collection mutation...
    return vals.sort((a, b) => Math.sign(a.data.title - b.data.title));
  }

  eleventyConfig.addFilter("sortByTitle", sortByTitle);

  let markdownIt = require("markdown-it");
  let options = {
    html: true,
    breaks: true,
    linkify: true,
  };
  eleventyConfig.setLibrary("md", markdownIt(options));

  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true
  });
  eleventyConfig.addFilter("md", function (content = "") {
    return markdownIt({
      html: true
    }).render(content);
  });

  // Passthrough
  eleventyConfig.addPassthroughCopy("./source/admin");
  eleventyConfig.addPassthroughCopy("./source/static/images");
  eleventyConfig.addPassthroughCopy("./source/static/scripts");
  eleventyConfig.addPassthroughCopy("./source/static/styles/app.css");

  // Transforms
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  // Watch Targets
  eleventyConfig.addWatchTarget("./source/assets/styles/");
  return {
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dir: {
      // tells Eleventy where to look for layouts/partials
      includes: "_partials",
      layouts: "_partials/layouts",
      // Eleventy will look here for files to process
      input: "source",
      // the built files will be placed here
      output: "public",
    },
  };
};
