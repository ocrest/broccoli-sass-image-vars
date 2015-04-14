var fs = require( 'fs' );
var path = require( 'path' );
var broccoli = require( 'broccoli' );
var pick = require( 'broccoli-static-compiler' );
var chai = require( 'chai' );
var imageVars = require( '..' );

imageVars.output = '_result.scss';
chai.should();
var expect = chai.expect;

describe( 'broccoli-sass-image-vars', function(){
    var fixturesDir = path.normalize( path.basename( __dirname ) + '/fixtures/' );
    var expectedDir = path.normalize( path.basename( __dirname ) + '/expected/' );
    var builder;

    function compare( expected, result ){
        result = fs.readFileSync( result.directory + path.sep + imageVars.output ).toString();
        expected = fs.readFileSync( expected ).toString().split( '\n' ).slice( 1 ).join( '\n' );
        return result.split( '\n' ).slice( 1 ).join( '\n' ).should.be.equal( expected );
    }

    function check( trees, expectedScss, options ){
        if( typeof trees === 'string' )
            trees = fixturesDir + trees;
        else if( Array.isArray( trees ) )
            trees = trees.map(function( tree ){ return typeof tree === 'string' ? fixturesDir + tree : tree });
        var tree = new imageVars( trees, options );
        builder = new broccoli.Builder( tree );
        return builder.build().then( compare.bind( undefined, expectedDir + expectedScss ) );
    }

    afterEach(function(){
        if( builder )
            return builder.cleanup();
    });

    it( 'should create the correct scss file for a single directory with images', function(){
        return check( 'single', '_single.scss' );
    });
    it( 'should throw an error if the "output" option isn\'t specified', function(){
        return expect(function(){
            check( 'glob', '_input_string.scss', { output: undefined });
        }).to.throw( /output/ );
    });
    it( 'should create the correct scss file with the string "input" option', function(){
        return check( 'glob', '_input_string.scss', {
            input: '**/*.*'
        });
    });
    it( 'should create the correct scss file with the array "input" option', function(){
        return check( 'glob', '_input_array.scss', {
            input: [ '*.*', 'aaa/*.*' ]
        });
    });
    it( 'should not throw any errors if the "input" option doesn\'t find any images', function(){
        return check( 'single', '_input_unexisting.scss', {
            input: 'unexisting/*.*'
        });
    });
    it( 'should create the correct scss file with the string "inline" option', function(){
        return check( 'single', '_inline_string.scss', {
            inline: '*.svg'
        });
    });
    it( 'should create the correct scss file with the array "inline" option', function(){
        return check( 'glob', '_inline_array.scss', {
            inline: [ '**/*.png', '**/*.gif' ]
        });
    });
    it( 'should not throw any errors if the "inline" option doesn\'t find any images', function(){
        return check( 'single', '_inline_unexisting.scss', {
            inline: 'unexisting/*.*'
        });
    });
    it( 'should create the correct scss file with both "input" and "inline" options', function(){
        return check( 'glob', '_input_and_inline.scss', {
            input: '*.png',
            inline: '**/*.gif'
        });
    });
    it( 'should create the correct scss file with the "url_prefix" option', function(){
        return check( 'single', '_url_prefix.scss', {
            url_prefix: 'prefix/url'
        });
    });
    it( 'should create the correct scss file with a valid Broccoli tree and the "url_prefix" option', function(){
        var tree = pick( fixturesDir + 'single', {
            srcDir: '.',
            destDir: '.'
        });
        return check( tree, '_broccoli_tree_and_url_prefix.scss', {
            url_prefix: '/prefix'
        });
    });
    it( 'should throw an error if the Broccoli tree is used and the "url_prefix" option isn\'t specified', function(){
        var tree = pick( fixturesDir + 'single', {
            srcDir: '.',
            destDir: '.'
        });
        return expect(function(){ check( tree, '_broccoli_tree_and_url_prefix.scss' ) }).to.throw( /url_prefix/ );
    });
});
