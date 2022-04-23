const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const cleanCSS = require("clean-css");
const htmlMin = require("html-minifier");
const yaml = require("js-yaml");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
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

	eleventyConfig.addPlugin(eleventyNavigationPlugin);
	// 11ty Data Extension
	// To Support .yaml Extension in _data
	// You may remove this if you can use JSON
	eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

	// 11ty Filters
	eleventyConfig.addFilter("cssmin", function (code) {
		return new cleanCSS({}).minify(code).styles;
	});

	eleventyConfig.addNunjucksFilter("limit", (arr, limit) =>
		arr.slice(0, limit)
	);

	// 11ty Passthrough
	eleventyConfig.addPassthroughCopy("./source/admin");
	eleventyConfig.addPassthroughCopy("./source/favicon.svg");
	eleventyConfig.addPassthroughCopy("./source/favicon.ico");
	eleventyConfig.addPassthroughCopy("./source/static/audio");
	eleventyConfig.addPassthroughCopy("./source/static/images");
	eleventyConfig.addPassthroughCopy("./source/static/scripts");

	// 11ty Transforms
	eleventyConfig.addTransform("htmlMin", function (content, outputPath) {
		// Eleventy 1.0+: use this.inputPath and this.outputPath instead
		if (outputPath && outputPath.endsWith(".html")) {
			let minified = htmlMin.minify(content, {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
				decodeEntities: true,
				html5: true,
				removeAttributeQuotes: true,
				removeComments: true,
				removeOptionalTags: true,
				sortAttributes: true,
				sortClassName: true,
			});
			return minified;
		}
		return content;
	});

	// 11ty Watch Targets
	eleventyConfig.addWatchTarget("./source/static/styles/");
	return {
		markdownTemplateEngine: "njk",
		dataTemplateEngine: "njk",
		htmlTemplateEngine: "njk",
		dir: {
			// Eleventy will look here for files to process
			input: "source",
			// the built files will be placed here
			output: "public",
			// tells Eleventy where to look for layouts/partials
			includes: "_includes",
		},
	};
};
