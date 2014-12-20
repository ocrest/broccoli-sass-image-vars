/**
 * broccoli-sass-image-vars
 * © 2014 Daniil Filippov <filippovdaniil@gmail.com>
 * MIT License <https://github.com/filippovdaniil/broccoli-sass-image-vars/blob/master/LICENSE.txt>
 */

var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var dataURI = require( 'datauri' );
var imageSize = require( 'image-size' );
var helpers = require( 'broccoli-kitchen-sink-helpers' );
var writer = require( 'broccoli-caching-writer' );

module.exports = ImageUtil;
ImageUtil.prototype = Object.create( writer.prototype );
ImageUtil.prototype.constructor = ImageUtil;
ImageUtil.prototype.input = '*.*';
ImageUtil.prototype.image_root = null;
ImageUtil.prototype.image_path = null;
ImageUtil.prototype.inline = [];

function ImageUtil( tree, options ){
    if( ! ( this instanceof ImageUtil ) ) 
        return new ImageUtil( tree, options )

    writer.apply( this, arguments );

    this.tree = tree;
    options = options || {};
    if( ! options.output )
        throw new Error( 'Missed required option "output"' );

    for( var key in ImageUtil )
        if( ImageUtil.hasOwnProperty( key ) )
            this[ key ] = ImageUtil[ key ];
    for( var key in options )
        if( options.hasOwnProperty( key ) )
            this[ key ] = options[ key ];

    if( typeof this.tree === 'object' && ! this.url_prefix )
        throw new Error( 'Missed required "url_prefix" option' );

    if( this.url_prefix )
        this.image_path = this.url_prefix;
    else if( typeof this.tree === 'string' )
        this.image_path = this.image_root ? this.tree.replace( new RegExp( '^' + this.image_root ), '' ) : this.tree;
    this.image_path += this.image_path.slice( -1 ) === '/' ? '' : '/';

    this.input = Array.isArray( this.input ) ? this.input : [ this.input ];
    this.inline = Array.isArray( this.inline ) ? this.inline : [ this.inline ];
}


ImageUtil.prototype._scss = function( dir ){
    var self = this;
        inline_images = helpers.multiGlob( this.inline, { cwd: dir });

    return helpers.multiGlob( this.input, { cwd: dir }).reduce(function( output, file_name ){
        var file_path = path.resolve( dir, file_name ),
            var_name = path.basename( file_path, path.extname( file_path ) ),
            size = imageSize( file_path );

        output += '\n';
        output += '$' + var_name + '_path: "' + self.image_path + file_name + '";\n';
        output += '$' + var_name + '_url: url(\'' + self.image_path + file_name + '\');\n';
        if( inline_images.indexOf( file_name ) + 1 ){
            var uri = new dataURI( file_path );
            output += '$' + var_name + '_data_url: url(\'' + uri.content +'\');\n';
        }
        output += '$' + var_name + '_width: ' + size.width + 'px;\n';
        output += '$' + var_name + '_height: ' + size.height + 'px;\n';
        output += '$' + var_name + '_padding: ' + ( size.height / size.width * 100 ) + '%;\n';

        return output;
    }, '' );
};


ImageUtil.prototype.updateCache = function( src, dst ){
    var scss_output = '// File created with broccoli-sass-image-vars at ' + new Date() + '\n';
    scss_output += this._scss( src[ 0 ] );
    mkdirp.sync( path.join( dst, path.dirname( this.output ) ) );
    fs.writeFileSync( path.join( dst, this.output ), scss_output, 'utf8' );
};
