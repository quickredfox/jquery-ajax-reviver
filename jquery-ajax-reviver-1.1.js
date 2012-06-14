/*
* jQuery Ajax Reviver Plugin - v1.1 - 06/13/2012
* 
* Copyright (c) 2012 "Quickredfox" Francois Lafortune
* Licensed under the same conditions as jQuery itself.
* license: http://jquery.org/license/
* source: https://github.com/quickredfox/jquery-ajax-reviver
* 
*/

(function( $ ) {
  "use strict"
  
  var revive
    , cast
    , add;
  
  if( $.type( $.ajaxSettings.revivers ) !== 'array' )
    $.ajaxSettings.revivers = [];
  
  revive = function( data, revivers ) {    
        if( $.type( data ) === 'array'){
          return data.reduce( function( revived, value, key ) {        
            revived[ key ] = revive( revivers.reduce( function( value, reviver ) {
              return reviver.call( revived, key, value );
            }, value ) , revivers );
            return revived;
          }, data );
        }else if( $.type( data ) === 'object'){
          return Object.keys(data).reduce( function( revived, key ) {        
            var value = data[key]
            revived[ key ] = revive( revivers.reduce( function( value, reviver ) {
              return reviver.call( revived, key, value );
            }, value ) , revivers );
            return revived;
          }, data );
        }else return json;
      };
  
  cast = function( ) {
    var fns  = []
      , args = Array.prototype.slice.call( arguments );
    for( var i =0; i< args.length; i++){
      var current = args[i];
      var next    = args[i+1];      
      if( $.type( current ) === 'array' ){
        
      };
    };
    
  };
  
  add = function( collection, reviver, fn ) {
    if( $.type( reviver ) === 'function'){
      collection.push( reviver );
    }else if( $.type( reviver) === 'string' && $.type( fn ) === 'function'){
      collection.push( function(k, v) {
        return k === reviver ? fn( v ) : v
      });
    }else if( $.type( reviver ) === 'array' ){
      reviver.reduce( function( revivers, fn ) {
        return add( revivers, fn );
      }, collection );
    }else if( $.type( reviver ) === 'object' ){
      Object.keys( reviver ).reduce( function( revivers, k ) {
        return add( revivers, k, reviver[k]);
      } , collection );
    };
    return collection
  }
  
  // Capture 'json' dataType requests and tack-on revivers if wanted. 
  $.ajaxPrefilter( 'json', function(options, original, xhr) {
    if (original.revivers) {
      options.revivers = $.ajaxSettings.revivers;
      add( options.revivers, original.revivers )
      return options.converters['text json'] = function( data ) {
        if ($.type(data ) !== 'string') return null;
        else return JSON.parse.length === 2 ? JSON.parse( data, function( key, value ) {
          return options.revivers.reduce( function( newvalue, reviver ) {
            return reviver.call( data, key, newvalue );
          }, value );
        } ) : revive( JSON.parse(value), options.revivers );
      };
    }
  });
  
  // Registers new "global" revivers.
  $.ajaxReviver = function(fn) {
    if ($.type(fn) === 'string' && arguments.length === 2) {
      add( $.ajaxSettings.revivers, arguments[0], arguments[1] );
    } else {
      add( $.ajaxSettings.revivers, fn );
    };
    return this; // jQuery best practices.
  };
  $.ajaxReviver.version = '1.0'
  
}).call(this, jQuery);
