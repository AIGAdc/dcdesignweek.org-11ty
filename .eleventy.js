const CleanCSS = require("clean-css");
const htmlmin = require("html-minifier");
const { DateTime } = require("luxon");
const yaml = require("js-yaml");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
	let markdownIt = require("markdown-it");
	let options = {
		html: true,
		breaks: true,
		linkify: true,
	};
	eleventyConfig.setLibrary("md", markdownIt(options));

	eleventyConfig.addFilter("readableEventDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj, {
			zone: "Europe/Amsterdam",
		})
			.setLocale("en")
			.toLocaleString(DateTime.DATE_FULL);
	});

	eleventyConfig.addFilter("postDate", (dateObj) => {
		return DateTime.fromJSDate(dateObj, {
			zone: "Europe/Amsterdam",
		})
			.setLocale("en")
			.toISODate();
	});

	eleventyConfig.addPlugin(eleventyNavigationPlugin);
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
	// Limit: Restricts the amount of items displayed in a collection
	eleventyConfig.addNunjucksFilter("limit", (arr, limit) =>
		arr.slice(0, limit)
	);

	let markdownIt = require("markdown-it");
	let options = {
		html: true,
		breaks: true,
		linkify: true,
	};
	eleventyConfig.setLibrary("md", markdownIt(options));

	eleventyConfig.setFrontMatterParsingOptions({ excerpt: true });
	eleventyConfig.addFilter("md", function (content = "") {
		return markdownIt({ html: true }).render(content);
	});

	// Passthrough
	eleventyConfig.addPassthroughCopy("./source/admin");
	eleventyConfig.addPassthroughCopy("./source/static/audio");
	eleventyConfig.addPassthroughCopy("./source/static/images");
	eleventyConfig.addPassthroughCopy("./source/static/scripts");

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
			// Eleventy will look here for files to process
			input: "source",
			// the built files will be placed here
			output: "public",
		},
	};
};
