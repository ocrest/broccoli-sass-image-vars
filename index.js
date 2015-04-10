/**
 * broccoli-sass-image-vars
 * © 2015 Daniil Filippov <filippovdaniil@gmail.com>
 * MIT License <https://github.com/filippovdaniil/broccoli-sass-image-vars/blob/master/LICENSE>
 */

var fs = require( 'fs' );
var path = require( 'path' );
var glob = require( 'glob-all' );
var mkdirp = require( 'mkdirp' );
var dataURI = require( 'datauri' );
var imageSize = require( 'image-size' );
var writer = require( 'broccoli-caching-writer' );

module.exports = ImageUtil;
ImageUtil.prototype = Object.create( writer.prototype );
ImageUtil.prototype.constructor = ImageUtil;
ImageUtil.prototype.input = '*.*';
ImageUtil.prototype.image_root = null;
ImageUtil.prototype.image_path = null;
ImageUtil.prototype.inline = [];
ImageUtil.prototype.cache_buster = false;

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
    this.input = this.input.map(function( e ){ return dir + e });
    this.inline = this.inline.map(function( e ){ return dir + e });
    var self = this,
        inline_images = glob.sync( self.inline );

    return glob.sync( this.input ).reduce(function( output, file_path ){
        var file_name = path.basename( file_path ),
            var_name = path.basename( file_path, path.extname( file_path ) ),
            cache_buster = self.cache_buster ? '?' + Math.floor( fs.statSync( file_path ).ctime.getTime() / 1000 ) : '';

        // rename $01_image --> $_01_image
        var_name = isNaN( var_name[ 0 ] ) ? var_name : '_' + var_name;

        // image-size library may through a TypeError for SVG images without width and height
        try{ var size = imageSize( file_path ); }catch( err ){}

        output += '\n';
        output += '$' + var_name + '_path: "' + self.image_path + file_name + cache_buster + '";\n';
        output += '$' + var_name + '_url: url(\'' + self.image_path + file_name + cache_buster + '\');\n';
        if( inline_images.indexOf( file_path ) + 1 ){
            var uri = new dataURI( file_path );
            output += '$' + var_name + '_data_url: url(\'' + uri.content +'\');\n';
        }
        if( size ){
            output += '$' + var_name + '_width: ' + size.width + 'px;\n';
            output += '$' + var_name + '_height: ' + size.height + 'px;\n';
            output += '$' + var_name + '_padding: ' + ( size.height / size.width * 100 ) + '%;\n';
        }
        return output;
    }, '' );
};


ImageUtil.prototype.updateCache = function( src, dst ){
    var scss_output = '// File created with broccoli-sass-image-vars at ' + new Date() + '\n';
    scss_output += this._scss( src[ 0 ] );
    mkdirp.sync( path.join( dst, path.dirname( this.output ) ) );
    fs.writeFileSync( path.join( dst, this.output ), scss_output, 'utf8' );
};
