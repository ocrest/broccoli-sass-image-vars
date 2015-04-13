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
        result = result.substring( result.indexOf( '\n' ) + 1 );
        expected = fs.readFileSync( expected ).toString();
        expected = expected.substring( expected.indexOf( '\n' ) + 1 );
        return result.should.be.equal( expected );
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
});
