# broccoli-sass-image-vars

This is a simple [broccoli](https://github.com/broccolijs/broccoli) plugin for generating Sass variables for your images.

## Installation

```bash
npm install --save-dev broccoli-sass-image-vars
```

## Usage examples

Plugin takes a simple string (path to image files) or a broccoli tree as its first argument.
In the first case, you don't need to specify the `url_prefix` option — the passed `inputTree` will be the prefix of image URLs (you can also specify the `image_root` option to modify the prefix):

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

In the case, when you pass to plugin a broccoli tree from another plugin ([broccoli-imagemin](https://github.com/xulai/broccoli-imagemin), for example), you must specify the prefix with
the option `url_prefix`:

`Brocfile.js`
```js
var imageMin = require( 'broccoli-imagemin' );
var imageVars = require( 'broccoli-sass-image-vars' );

var optimizedImagesTree = imageMin( 'webpub/images', {
    interlaced: true,
    optimizationLevel: 3,
    progressive: true,
    lossyPNG: false
});

// By default, the "input" option is set to '*.*':
var imagesTree = imageVars( optimizedImagesTree, {
    // Specify the output Sass file:
    output: 'scss_compiled/_images.scss',

    // Specify the URL prefix for images:
    url_prefix: '/images',
});
```

You can also set any of plugin's options before creating trees:

`Brocfile.js`
```js
var imageVars = require( 'broccoli-sass-image-vars' );

// This default prefix will be removed from the each image URL
imageVars.image_root = 'webpub';

var imagesTree = imageVars( 'webpub/images', {
    output: 'scss_compiled/_images.scss',
});
```

In your Sass file you can import compiled variables as follows:

`app.scss`
```scss
@import "scss_compiled/images";

.preloader:after{
    ...
    // preloader.png variables:
    width: $preloader_width;
    height: $preloader_height;
    content: $preloader_data_url
}

.some-resizable-bg{
    display: block;
    height: 0;
    background: $resizable_url no-repeat;
    background-size: 100%;
    padding-bottom: $resizable_padding
}
```

The full list of variables for the one image file:

- `$filename_url` — value for css `background-image` property.
- `$filename_data_url` — the same as `$filename_url`, but includes data URI of image (variable exists only for the images are set in `options.inline`).
- `$filename_width` — the width of the image in pixels.
- `$filename_height` — the height of the image in pixels.
- `$filename_padding` — the `padding-bottom` css property value for the resizable backgrounds (see example above).

## Documentation

### `imageVars( inputTree, options )`

---

`options.output` *{String}*

Location of the output file with Sass variables.

---

`[options.input]` *{Array|String}*

An array of globs or a simple glob string for image files to include (must exists at least one file for the each search pattern).

Default value: `'*.*'`

---

`[options.inline]` *{Array|String}*

An array of globs or a simple glob string for images, for which a variables with data URI must be created (must exists at least one file for the each search pattern).

Default value: `[]`

---

`[options.url_prefix]` *{String|null}*

A prefix for the image URLs in Sass variables. Required when the `inputTree` is a broccoli tree, returned by another plugin.


Default value: `null`

---

`[options.image_root]` *{String|null}*

A prefix which must be cut out from the image URLs. Used only when the `inputTree` is string.

Default value: `null`

## License

This project is distributed under the MIT license.
