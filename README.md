jQuery Ajax Reviver Plugin - v1.1 - 06/13/2012
==============================================

Copyright (c) 2012 Francois Lafortune, @quickredfox

Licensed under the same conditions as jQuery.

**license:** http://jquery.org/license/

**source:** https://github.com/quickredfox/jquery-ajax-reviver

Description
-----------

Adds support for reviver-like functionality on jQuery.ajax's JSON parser. 

Ever since the reviver parameter has been added to JSON.parse(), I once in a while do a jQuery ajax operation 
that gets me thinking "if only I could access the underlying JSON parser's reviver parameter". 
This solves that problem.

For those of you not familiar with the reviver argument, you can re-discover JSON here http://www.json.org/js.html

Usage
-----

First off, you must register reviver functions within jQuery itself. This plugin does not provide default revivers. 
In order to register a new reviver function, you must use the $.ajaxReviver() function. There are 4 ways to do so:

To register a reviver based on the presence of a certain key in the json object, you must specify that key as the first 
argument, and provide a reviver function as the second argument. In this case, the reviver will be called with only one argument, 
the value of the specified key. Your reviver function must return a value, which will take the place of the previous value. 

    // Every time a json object has a "created_at" key, we convert it to a date object
    $.ajaxReviver( 'created_at', function( value ){
      return new Date( value )
    });
    
For more flexibility, you can use a "standard" reviver function. That is, one that behaves like a normal JSON.parse reviver.
This reviver will be passed two arguments, the first one being the current key, and the second one being it's value. 
Your reviver function must return a value, which will take the place of the previous value. 

    // Same as previous example, but a bit more robust
    $.ajaxReviver( function( key, value ){
      if( key is 'created_at' && typeof value === 'string' ){
        return new Date(value);
      }
      return value;
    });
    
Both of these forms, offer an equivalent where you can register more than one reviver. 
For the first form, one can pass a mapping of attributes and functions in the form of an object. 


    function stringToDate( value ){
      return new Date( value );
    };
    $.ajaxReviver( {
      created_at: stringToDate,
      published_at: stringToDate
    });
    
Or again, for more control, you can pass an array of reviver functions. 
    
    $.ajaxReviver([
      function( key, value ){
        if( key === 'created_at' && typeof value === 'string' ){
          return new Date(value);
        };
        return value;
      },
      function( key, value ){
        if( key === 'screename' ){
          this.profile_url = "http://twitter";
        };
        return value;
      }
    ]);

Now at this point if you say "Great Flying Spaghetti Monster! My revivers are not being processed!". 
That's easy, it's because you didn't tell it to! Here's how you turn them on in your ajax call: 
Simply pass ``revivers: true`` within your ajax options.
  
    // Basic Ajax Call (w/ minimum requirements)
    $.ajax(
      {
        dataType: 'json',
        revivers: true
        ...
      }
    );
    
Need to pass in non-global revivers? That's easy, the "revivers" option supports either a reviver function mapping object, 
an array of reviver functions or a lone reviver function, like so:

#### Per/call revivers as object mapping

    $.ajax(
      {
        dataType: 'json',
        revivers: {
          created_at: function( value ){ return new Date(value) }
        }
        ...
      }
    );
    
#### Per/call revivers as array

    $.ajax(
      {
        dataType: 'json',
        revivers: [
          function( key, value ){ 
            if( key === 'created_at' ) return new Date( value );
            return new Date(value);
          }
        ]
        ...
      }
    );
    
#### Per/call single reviver as function

    $.ajax(
      {
        dataType: 'json',
        revivers: function( key, value ){ 
          if( key === 'created_at' ) return new Date( value );
          return new Date(value);
        }
        ...
      }
    );
    

*Note: The value of "this" inside the reviver function is the json object or nested object who owns the key currently being passed to the reviver function.*

Get funky!
----------

Version 1.1 has been slightly refactored for the sake of adding some robustness. A fun side-effect is that we can now register revivers in a couple more funky ways.

#### Multiple revivers for same key.
  
    // Why you'd want to do this? No one knows, but it works!
    $.ajaxReviver({
     created_at: [
      function( v ){ return new Date(v); },
      function( v ){ 
        return v.getTime();
      }
     ] 
    });

#### Same as above, different syntactic approach. 

    $.ajaxReviver([
     'created_at',
     [
      function( v ){ return new Date(v); },
      function( v ){ return v.getTime(); }
     ] 
    ]);
    
#### Mixed sytax! Aka: I dont know what I'm doing, but it seems to work.

    $.ajaxReviver([
     'created_at',
     function( v ){ return new Date(v); },
     { published_at: [
       function( v ){ return new Date(v); },
       function( v ){ return v.getTime(); }
      ] },
     function(key,value){
       if( key  === 'nested') return {};
       return value;
     }
    ]);
 
Caveats
-------

- If you override the 'text json' converter, <del>this will not work</del> <ins>It will be processed before revivers but adds overhead as it must be re-stringified for JSON.parse to "revive" it again. This behavior may change in subsequent versions.</ins>


