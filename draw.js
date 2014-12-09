var Q = require('q');
var fs = require('fs');
var _ = require('lodash');
var Canvas = require('canvas');
var compileFromFile = require('svg-templater').compileFromFile;
var canvg = require("canvg");

var fontSize = require('./lib/fontsize');
var titleParts = require('./lib/titleparts');
var svgCompile = require('./lib/svgcompile');
var svgRender = require('./lib/svgrender');

var topics = require('./topic');
var colors = require('./colors.json');

module.exports = function(output, options) {

    //
    // Default options
    //

    options = _.defaults(options || {}, {
        "title": "",
        "author": "",
        "font": {
            "size": null,
            "family": "Arial",
            "color": '#424242'
        },
        "template": "templates/default.svg",
        "size": {
            "w": 1800,
            "h": 2360
        },
        "background": {
            "color": '#fff'
        }
    });


    // Font
    var fontname = options.font.family;

    //
    // Topic color
    //

    var topic = topics(options.title)[0];

    options.topic = options.topic || {};
    options.topic.color = (topic && colors[topic]) ? colors[topic] : colors.default;


    //
    // Title split in lines & size
    //

    // Dimensions of title's box
    var titleBox = {
        w: Math.floor(options.size.w * 0.8),
        h: Math.floor(options.size.h * 0.6),
    };
    var maxLineHeight = Math.floor(titleBox.h * 0.1);

    var tParts = titleParts(
        options.title,
        fontname,
        titleBox.w,
        titleBox.h
    );

    // The height of an individual line
    var lineHeight = Math.min(
        Math.floor(titleBox.h / tParts.length),
        maxLineHeight
    );

    // Rewrite title to parts
    options.title = tParts;

    // Calculate title's default font size
    var defaultTitleSize = Math.min.apply(Math, options.title.map(function(part) {
        return fontSize(
            part, fontname,
            titleBox.w,
            lineHeight
        );
    }));

    // Title size
    options.size.title = options.size.title || defaultTitleSize;

    //
    // Author size
    //

    options.size.author = options.size.author || fontSize(
        options.author, fontname,
        titleBox.w, options.size.h
    );


    //
    // Generate the cover
    //

    var template = fs.existsSync('cover.svg') ? 'cover.svg' : options.template;

    // Make SVG with options
    return svgCompile(template, options)
    .then(function(svg) {
        // Render SVG to JPEG
        return svgRender(output, svg, options.size.w, options.size.h);
    });
};
