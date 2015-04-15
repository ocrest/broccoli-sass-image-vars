# broccoli-sass-image-vars

[![Build Status](https://travis-ci.org/filippovdaniil/broccoli-sass-image-vars.svg?branch=master)](https://travis-ci.org/filippovdaniil/broccoli-sass-image-vars)
[![Dependencies Status](https://david-dm.org/filippovdaniil/broccoli-sass-image-vars.svg)](https://david-dm.org/filippovdaniil/broccoli-sass-image-vars)

This is a simple [broccoli](https://github.com/broccolijs/broccoli) plugin for generating Sass variables for your images.

## Installation

```bash
npm install --save-dev broccoli-sass-image-vars
```

## Usage examples

Plugin's first argument may be either a string (path to the directory with images) or a single broccoli tree, or even an array of paths and trees.

In the first case, you don't even need to specify the `url_prefix` option — the passed string will be the prefix of image URLs (you can also specify the `image_root` option to modify this prefix):

`Brocfile.js`
```js
var imageVars = require( 'broccoli-sass-image-vars' );

var imagesTree = imageVars( 'webpub/images', {
    // Select only png and svg files under webpub/images directory
    input: [ '**/*.png', '**/*.svg' ],

    // Include data URI for all svg images and preloader.png:
    inline: [ '**/*.svg', 'preloader.png' ],

    // Specify the output Sass file:
    output: 'scss_compiled/_images.scss',

    // This prefix will be removed from the each image URL
    image_root: 'webpub',
});
```

In your Sass file you can import compiled variables as follows:

```scss
@import "scss_compiled/images";

.preloader:after{
    ...
    // preloader.png variables:
    width: $preloader_width;
    height: $preloader_height;
    content: $preloader_data_url // url('data:image/png;base64,....')
}

.some-resizable-bg{
    display: block;
    height: 0;
    background: $resizable_url no-repeat; // url('/images/resizable.png')
    background-size: 100%;
    padding-bottom: $resizable_padding
}
```

The full list of variables for the one image file:

- `$filename_path` — an URL string with path to the image
- `$filename_url` — value for css `background-image` property.
- `$filename_data_url` — the same as `$filename_url`, but includes data URI of image (**note:** variable exists only for the images are set in `options.inline`).
- `$filename_width` — the width of the image in pixels.
- `$filename_height` — the height of the image in pixels.
- `$filename_padding` — the `padding-bottom` css property value for the resizable backgrounds (see example above).

In the case, when you pass to the plugin a broccoli tree, created by another plugin ([broccoli-imagemin](https://github.com/xulai/broccoli-imagemin), for example), you must specify the URL prefix with
the option `url_prefix`:

`Brocfile.js`
```js
var imageMin = require( 'broccoli-imagemin' );
var imageVars = require( 'broccoli-sass-image-vars' );

var optimizedImagesTree = imageMin( 'webpub/unoptimized', {
    interlaced: true,
    optimizationLevel: 3,
    progressive: true,
    lossyPNG: false
});

// By default, the "input" option is set to '*.*':
var imagesTree = imageVars( [ 'webpub/images', optimizedImagesTree ], {
    // Specify the output Sass file:
    output: 'scss_compiled/_images.scss',

    // Specify the URL prefix for images:
    url_prefix: '/images',
});
```

You can also setup any of plugin's options before creating trees:

`Brocfile.js`
```js
var imageVars = require( 'broccoli-sass-image-vars' );

// This prefix will be removed from the each image URL:
imageVars.image_root = 'webpub';
// Turn on the query string cache buster for the each image URL:
imageVars.cache_buster = true;
// Specify the output Sass file:
imageVars.output = 'scss_compiled/_images.scss';

var imagesTree = imageVars( 'webpub/images' );
```

## Documentation

### `imageVars( inputTree, options )`
### `imageVars( [ inputTree1, inputTree2, ... ], options )`

---

`options.output` *{String}*

Location of the output file with Sass variables.

---

`[options.input]` *{Array|String}*

An array of globs or a simple glob string for image files, for which sass variables must be created.

Default value: `'*.*'`

---

`[options.inline]` *{Array|String}*

An array of globs or a simple glob string for images, for which variables with data URI must be added.

Default value: `[]`

---

`[options.url_prefix]` *{String|null}*

A prefix for the image URLs in Sass variables. Required when among the `inputTree` arguments is present a broccoli tree, returned by another plugin.


Default value: `null`

---

`[options.image_root]` *{String|null}*

A prefix which must be cut out from the image URLs. Used only when the all `inputTree` arguments are strings.

Default value: `null`

---

`[options.cache_buster]` *{Boolean}*

If is set to `true`, the cache busting via URL query string will be used (will append to the each image URL a string of form `?%ctime%`, where `%ctime%` is a timestamp of the file last modification date).

Default value: `false`

## Tests

```bash
npm i
```
```bash
npm t
```

## License

This project is distributed under the MIT license.
