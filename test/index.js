var fs = require( 'fs' );
var path = require( 'path' );
var broccoli = require( 'broccoli' );
var chai = require( 'chai' );
var imageVars = require( '..' );

imageVars.output = '_result.scss';
chai.should();

describe( 'broccoli-sass-image-vars', function(){
    var fixturesDir = path.normalize( path.basename( __dirname ) + '/fixtures/' );
    var expectedDir = path.normalize( path.basename( __dirname ) + '/expected/' );
    var builder;

    function compare( expected, result ){
        result = fs.readFileSync( result.directory + path.sep + imageVars.output ).toString();
        expected = fs.readFileSync( expected ).toString().split( '\n' ).slice( 1 ).join( '\n' );
        return result.split( '\n' ).slice( 1 ).join( '\n' ).should.be.equal( expected );
    }

    afterEach(function(){
        if( builder )
            return builder.cleanup();
    });

    it( 'should create the correct scss file for a single directory with images', function(){
        var tree = new imageVars( fixturesDir + 'single' );
        builder = new broccoli.Builder( tree );
        return builder.build().then( compare.bind( undefined, expectedDir + '_single.scss' ) );
    });
    it( 'should create the correct scss file with the string "input" option', function(){
        var tree = new imageVars( fixturesDir + 'glob', {
            input: '**/*.*'
        });
        builder = new broccoli.Builder( tree );
        return builder.build().then( compare.bind( undefined, expectedDir + '_input_string.scss' ) );
    });
    it( 'should create the correct scss file with the array "input" option', function(){
        var tree = new imageVars( fixturesDir + 'glob', {
            input: [ '*.*', 'aaa/*.*' ]
        });
        builder = new broccoli.Builder( tree );
        return builder.build().then( compare.bind( undefined, expectedDir + '_input_array.scss' ) );
    });
    it( 'should not throw any errors if the "input" option doesn\'t find any images', function(){
        var tree = new imageVars( fixturesDir + 'single', {
            input: 'unexisting/*.*'
        });
        builder = new broccoli.Builder( tree );
        return builder.build().then( compare.bind( undefined, expectedDir + '_input_unexisting.scss' ) );
    });
    it( 'should create the correct scss file with the string "inline" option', function(){
        var tree = new imageVars( fixturesDir + 'single', {
            inline: '*.svg'
        });
        builder = new broccoli.Builder( tree );
        return builder.build().then( compare.bind( undefined, expectedDir + '_inline_string.scss' ) );
    });
    it( 'should create the correct scss file with both "input" and "inline" options', function(){
        var tree = new imageVars( fixturesDir + 'glob', {
            input: '*.png',
            inline: '**/*.gif'
        });
        builder = new broccoli.Builder( tree );
        return builder.build().then( compare.bind( undefined, expectedDir + '_input_and_inline.scss' ) );
    });
});
