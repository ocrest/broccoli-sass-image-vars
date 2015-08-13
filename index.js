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

function ImageUtil( trees, options ){
    if( ! ( this instanceof ImageUtil ) )
        return new ImageUtil( trees, options )

    writer.apply( this, arguments );

    this.trees = trees;
    options = options || {};

    for( var key in ImageUtil )
        if( ImageUtil.hasOwnProperty( key ) )
            this[ key ] = ImageUtil[ key ];
    for( var key in options )
        if( options.hasOwnProperty( key ) )
            this[ key ] = options[ key ];

    if( ! this.output )
        throw new Error( 'Missed required option "output"' );

    if(
        (
            typeof this.trees === 'object' && ! Array.isArray( this.trees ) ||
            Array.isArray( this.trees ) && this.trees.filter(function( t ){ return typeof t === 'object' }).length
        )
        && ! this.url_prefix
    )
        throw new Error( 'Missed required "url_prefix" option' );

    this.trees = Array.isArray( this.trees ) ? this.trees : [ this.trees ];
    this.input = Array.isArray( this.input ) ? this.input : [ this.input ];
    this.inline = Array.isArray( this.inline ) ? this.inline : [ this.inline ];
}


ImageUtil.prototype._scss = function( dir ){
    dir += dir.slice( -1 ) === '/' ? '' : '/'
    var input = this.input.map(function( glob ){ return dir + glob });
    var inline = this.inline.map(function( glob ){ return dir + glob });
    var self = this,
        input_images = glob.sync( input ),
        inline_images = glob.sync( inline );

    return input_images.concat( inline_images.filter(function( file_path ){
        return input_images.indexOf( file_path ) < 0;
    }) ).reduce(function( output, file_path ){
        if( fs.lstatSync( file_path ).isDirectory() )
            return output; // it's definitely not an image :)
        var file_name = path.relative( dir, file_path );
        var relative_var_name = ( path.dirname( file_name ) + '_' )
                                    .replace( /^\._/, '' )
                                    .replace( new RegExp( '\\' + path.sep, 'g' ), '_' );
        var var_name = relative_var_name + path.basename( file_name, path.extname( file_name ) );
        var cache_buster = self.cache_buster ? '?' + Math.floor( fs.statSync( file_path ).ctime.getTime() / 1000 ) : '';

        // rename $01_image --> $_01_image
        var_name = isNaN( var_name[ 0 ] ) ? var_name : '_' + var_name;
        var_name = var_name.replace( /([!"#$%&'( )*+,.\/:;<=>?@\[\]^\{\}|~])/g, '\\$1' ); // Escape ASCII punctuation

        // image-size library may through a TypeError for SVG images without width and height
        try{ var size = imageSize( file_path ); }catch( err ){}

        var image_url = self.url_prefix;
        if( ! self.url_prefix )
            image_url = self.image_root ? dir.replace( new RegExp( '^' + self.image_root ), '' ) : dir;
        else
            image_url += self.url_prefix.slice( -1 ) === '/' ? '' : '/';
        image_url = ( image_url + file_name ).replace( /\\/g, '/' );

        output += '\n';
        output += '$' + var_name + '_path: \'' + image_url + cache_buster + '\';\n';
        output += '$' + var_name + '_url: url(\'' + image_url + cache_buster + '\');\n';
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
    for( var i in src )
        scss_output += this._scss( src[ i ] );
    mkdirp.sync( path.join( dst, path.dirname( this.output ) ) );
    fs.writeFileSync( path.join( dst, this.output ), scss_output, 'utf8' );
};
