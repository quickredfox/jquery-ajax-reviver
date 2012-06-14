var clear = function() {
  $.ajaxSettings.revivers = [];
  $.ajaxSetup( {cache: false})
};

module( "$.ajaxReviver()" );

test( "Accepts a function as it's sole argument.", function(){
  clear();
  var fn = function( k, v ){ return v };
  $.ajaxReviver( fn );
  ok( $.ajaxSettings.revivers.length === 1, '$.ajaxSettings.revivers contains one function.' );
  strictEqual( $.ajaxSettings.revivers[0], fn, 'the function is the one provided.' );  
});

test( "Accepts a string as first argument and a function as second argument.", function(){
  clear();
  var fn = function( v ){ return new Date( v ) };
  $.ajaxReviver( 'created_at', fn );
  ok( $.ajaxSettings.revivers.length === 1, '$.ajaxSettings.revivers contains one function.' );
  notStrictEqual( $.ajaxSettings.revivers[0], fn, 'the function provided has been proxied.' );  
  ok( $.ajaxSettings.revivers[0].length === 2, 'The proxy function accepts two arguments.');
});

test("Accepts an array of reviver functions as it's sole argument.", function() {
  clear();
  var fns = [
    function( k, v  ){  return v },
    function( k, v  ){  return v }    
  ];
  $.ajaxReviver( fns );
  ok( $.ajaxSettings.revivers.length === 2, '$.ajaxSettings.revivers contains two functions.' );
  strictEqual( $.ajaxSettings.revivers[0], fns[0],'First function is the first one provided.');
  strictEqual( $.ajaxSettings.revivers[1], fns[1],'Second function is the second one provided.');
});

test("Accepts an object mapping of reviver functions as it's sole argument.", function() {
  clear();
  var stringToDate = function( string ) {
    return new Date( string );
  };
  var fns = {
    created_at:   stringToDate,
    published_at: stringToDate    
  };
  $.ajaxReviver( fns );
  ok( $.ajaxSettings.revivers.length === 2, '$.ajaxSettings.revivers contains two functions.' );
  notStrictEqual( $.ajaxSettings.revivers[0], fns.created_at,'The first function has been proxied.');
  notStrictEqual( $.ajaxSettings.revivers[1], fns.published_at,'The second function has been proxied.');
});

test("Proxies functions properly when revivers provided in object/mapping form.", function() {
  clear();
  var stringToDate = function( string ) {
    return new Date( string );
  };
  var fns = {
    test1: function( v ) { return 'A'; },
    test2: function( v ) { return 'B'; }    
  };
  $.ajaxReviver( fns );
  ok( $.ajaxSettings.revivers[0]( 'test1', null ) === 'A', 'The first function has been proxied correctly.');
  ok( $.ajaxSettings.revivers[1]( 'test2', null ) === 'B', 'The second function has been proxied correctly.');
  ok( !$.ajaxSettings.revivers[0]( 'test3', null ) , 'The first proxy does not respond to other attributes.');  
  ok( !$.ajaxSettings.revivers[1]( 'test4', null ) , 'The second proxy does not respond to other attributes.');    
});


module( "$.ajax( { revivers: [ ... ] } )" );

asyncTest("Uses revivers when detecting the 'json' dataType and truthiness of the 'revivers' ajax options.", 3 , function() {
  clear();
  var stringToDate = function( string ) { return new Date( string ); };
  $.ajaxReviver( {
    created_at:   stringToDate,
    published_at: stringToDate    
  });
  $.ajax( {
    url: 'test.json', 
    type: 'GET',
    dataType: 'json',
    revivers: true,
    success: function( json ) {
      ok( $.type(json.created_at) === 'date', 'First reviver is applied.' );
      ok( $.type(json.published_at) === 'date', 'Second reviver is applied.' );
      notEqual( json.created_at, json.published_at, 'Each reviver acted on it\'s own trigger attribute.');
    }, 
    complete: function() {
      start();
    }
  });
});

asyncTest("Supports an additional set of revivers as an array of functions in the 'revivers' ajax options.", 3, function() {
  clear();
  var stringToDate = function( string ) { return new Date( string ); };
  $.ajaxReviver( { created_at: stringToDate });
  $.ajax( {
    url: 'test.json', 
    type: 'GET',
    dataType: 'json',
    revivers: [ function( k, v) {
      if( k === 'published_at') return stringToDate( v );
      return v;
    } ],
    success: function( json ) {
      ok( $.type(json.created_at) === 'date', 'First reviver is applied.' );
      ok( $.type(json.published_at) === 'date', 'Second reviver is applied.' );
      notEqual( json.created_at, json.published_at, 'Each reviver acted on it\'s own trigger attribute.');
    }, 
    complete: function() {
      start();
    }
  });
});

asyncTest("Supports an additional set of revivers as an object mapping of reviver functions in the 'revivers' ajax option", 3, function() {
  clear();
  var stringToDate = function( string ) { return new Date( string ); };
  $.ajaxReviver( { created_at: stringToDate });
  $.ajax( {
    url: 'test.json', 
    type: 'GET',
    dataType: 'json',
    revivers: {
      published_at: stringToDate
    },
    success: function( json ) {
      ok( $.type(json.created_at) === 'date', 'First reviver is applied' );
      ok( $.type(json.published_at) === 'date', 'Second reviver is applied' );
      notEqual( json.created_at, json.published_at, 'Each reviver acted on it\'s own trigger attribute');
    }, 
    complete: function() {
      start();
    }
  });
});

asyncTest("Supports an additional revivers function in the 'revivers' ajax option", 3, function() {
  clear();
  var stringToDate = function( string ) { return new Date( string ); };
  $.ajaxReviver( { created_at: stringToDate });
  $.ajax( {
    url: 'test.json', 
    type: 'GET',
    dataType: 'json',
    revivers: function( k, v) {
      if( k === 'published_at') return stringToDate( v );
      return v;
    },
    success: function( json ) {
      ok( $.type(json.created_at) === 'date', 'First reviver is applied' );
      ok( $.type(json.published_at) === 'date', 'Second reviver is applied' );
      notEqual( json.created_at, json.published_at, 'Each reviver acted on it\'s own trigger attribute');
    }, 
    complete: function() {
      start();
    }
  });
});

asyncTest("Ignores revivers when 'reviver' falsy in ajax option", 1, function() {
  clear();
  var stringToDate = function( string ) { return new Date( string ); };
  $.ajaxReviver( { created_at: stringToDate });
  $.ajax( {
    url: 'test.json', 
    type: 'GET',
    dataType: 'json',
    revivers: false,
    success: function( json ) {
      ok( $.type(json.created_at) === 'string', 'date reviver is not applied' );
    }, 
    complete: function() {
      start();
    }
  });
});