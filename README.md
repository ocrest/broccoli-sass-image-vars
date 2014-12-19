# broccoli-sass-image-vars

This is a simple [broccoli](https://github.com/broccolijs/broccoli) plugin for generating Sass variables for your images.

## Installation

```bash
npm install --save-dev broccoli-sass-image-vars
```

## Usage example

`Brocfile.js`
```js
var imageVars = require( 'broccoli-sass-image-vars' );

var imagesTree = imageVars( 'webpub/images', {
    // Select all png and svg files under webpub/images directory
    input: [ '**/*.png', '**/*.svg' ],

    // Include data URI for all svg images and preloader.png:
    inline: [ '**/*.svg', 'preloader.png' ],

    // Specify the output Sass file:
    output: 'scss_compiled/_images.scss',

    // This prefix will be removed from the each image URL
    image_root: 'webpub',
});
```

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

An array of globs or a simple glob string for image files to include (must exists at least one for the each search pattern). 

Default value: `'*.*'`

---

`[options.inline]` *{Array|String}*

An array of globs or a simple glob string for images, for which a variables with data URI must be created (must exists at least one for the each search pattern).

Default value: `[]`

---

`[options.image_root]` *{String|null}*

A prefix which must be cut out from the image URLs.

Default value: `null`

## License

This project is distributed under the MIT license.
