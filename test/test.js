var clear = function() {
  $.ajaxSettings.revivers = [];
  $.ajaxSetup( {cache: false})
};

module( "$.ajaxReviver()" );

// test 1
test( "Accepts a function as it's sole argument.", function(){
  clear();
  var fn = function( k, v ){ return v };
  $.ajaxReviver( fn );
  equal( $.ajaxSettings.revivers.length, 1, '$.ajaxSettings.revivers contains one function.' );
  strictEqual( $.ajaxSettings.revivers[0], fn, 'the function is the one provided.' );  
});

// test 2
test( "Accepts a string as first argument and a function as second argument.", function(){
  clear();
  var fn = function( v ){ return new Date( v ) };
  $.ajaxReviver( 'created_at', fn );
  equal( $.ajaxSettings.revivers.length, 1, '$.ajaxSettings.revivers contains one function.' );
  notStrictEqual( $.ajaxSettings.revivers[0], fn, 'the function provided has been proxied.' );  
  equal( $.ajaxSettings.revivers[0].length, 2, 'The proxy function accepts two arguments.');
});

// test 3
test("Accepts an array of reviver functions as it's sole argument.", function() {
  clear();
  var fns = [
    function( k, v  ){  return v },
    function( k, v  ){  return v }    
  ];
  $.ajaxReviver( fns );
  equal( $.ajaxSettings.revivers.length,2, '$.ajaxSettings.revivers contains two functions.' );
  strictEqual( $.ajaxSettings.revivers[0], fns[0],'First function is the first one provided.');
  strictEqual( $.ajaxSettings.revivers[1], fns[1],'Second function is the second one provided.');
});

// test 4
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
  equal( $.ajaxSettings.revivers.length,2, '$.ajaxSettings.revivers contains two functions.' );
  notStrictEqual( $.ajaxSettings.revivers[0], fns.created_at,'The first function has been proxied.');
  notStrictEqual( $.ajaxSettings.revivers[1], fns.published_at,'The second function has been proxied.');
});

// test 5
test("Accepts an mix of all syntaxes.", function() {
  clear();
  var stringToDate = function( string ) {
    return new Date( string );
  };
  var fns = [
    'created_at', 
    [
      function( v ) {  return new Date( v ); },
      function( v ) {  return "DATE:" + v.toString(); }
    ],
    { published_at: [ function( v ) {  return new Date( v ); } ]}
  ];
  $.ajaxReviver( fns );
  equal( $.ajaxSettings.revivers.length, 3 , '$.ajaxSettings.revivers contains 3 functions.' );
});

// test 6
test("Proxies functions properly when revivers provided in object/mapping form.", function() {
  clear();
  var stringToDate = function( string ) {
    return new Date( string );
  };
  var fns = {
    test1: function( v ) { 
      return 'A'; },
    test2: function( v ) { 
      return 'B'; }    
  };
  $.ajaxReviver( fns );
  ok( $.ajaxSettings.revivers[0]( 'test1', null ) === 'A', 'The first function has been proxied correctly.');
  ok( $.ajaxSettings.revivers[1]( 'test2', null ) === 'B', 'The second function has been proxied correctly.');
  ok( !$.ajaxSettings.revivers[0]( 'test3', null ) , 'The first proxy does not respond to other attributes.');  
  ok( !$.ajaxSettings.revivers[1]( 'test4', null ) , 'The second proxy does not respond to other attributes.');    
});


module( "$.ajax( { revivers: [ ... ] } )" );

// test 7
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
// test 8
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
// test 9
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
// test 10
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
// test 11
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
// test 12
asyncTest( "Value of 'this' inside reviver is json object/nested json object", 1, function() {
  clear();
  /* Note: this test (like most) is only partial. I should count the times the function is called to determine it's check val (fix for nested object testing) */
  $.getJSON('test-simple.json', function( raw ) { 
    $.ajaxReviver( { 
      created_at: function( v ){
          deepEqual( this, raw, "'this' context intact!");
          return v;
        }
    });
    $.ajax( { 
      url:'test-simple.json',
      type: 'GET',
      dataType: 'json',
      revivers: true,
      complete: function() {
        start()
      }
    });
    
  });
  
});
// test 13
asyncTest( "Overriding ['text json'] converter does not break revivers", 1, function() {
  clear();
  $.ajaxReviver({
    created_at: function( v ) {
      return 1234;
    }
  });
  $.ajax( { 
      url:'test.json',
      type: 'GET',
      dataType: 'json',
      revivers: true,
      converters: {
        "text json": function( textValue ) {
          return JSON.parse( textValue );
        }
      },
      success: function( json ) {
        equal( json.created_at, 1234, 'Reviver is still applied')
      },
      complete: function() {
        start()
      }
  });
});

