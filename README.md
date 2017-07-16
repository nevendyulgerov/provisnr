# Provisnr
## Performance Testing JavaScript Library

Provisnr is a light-weight JavaScript performance testing library. It exposes a simple API for testing procedural and asynchronous functions.

# Requirements

Provisnr runs on the ES5 standard, so you just need a browser and a text editor. That's it, no external dependencies.

# Getting Started

You can clone or download Provisnr from this repository. The download includes a non-minified and minified version of the plugin.

To enable Provisnr, simply add it to your page
```javascript
<script type="text/javascript" src="path-to-provisnr/provisnr.js"></script>
```

# Conventions

Provisnr exposes several methods for testing the speed of your functions. Rather than capturing the time from the start, until the end of your function, it captures the number (iterations) of function calls, achieved for a given period of time. In other words, it runs iteratively the function your are testing and captures the achieved number of iterations. The returned data contains the number of iterations plus other useful information, in cases when you're performing function comparisons (supported).

# How to Use

You can use Provisnr like this:

```javascript
// the function to be tested
var myFunc = function(data) {
    for (var i = 0, i < 100; i++) {
         data[i] = Math.random(0, data[i]);
    }
};

// the data generator for the function
var myDataGenerator = function() {
    var data = [];
    for (var i = 0, i < 100; i++) {
        data[i] = i;
    }
    return data;
};

// test a function procedurally
// capture the number of achieved iterations for myFunc, with data passed by dataGenerator

// @param timeout      {required} {integer}   - time duration for the test in milliseconds
// @param generator    {optional} {function}  - data generator which passes data to tested function
// @param callback     {required} {function}  - the function which will be tested
var iterations = provisnr.testProceFunction({
	timeout: 1000,
	generator: myDataGenerator,
	callback: myFunc
});
```

The above code tests procedurally myFunc with data, provided by myDataGenerator for one second. The returned value is the number of achieved iterations within the time interval.

Here's another example, using jQuery: 

```javascript
$(document).ready(function() {

    // the function to be tested
    var getGhibliFilms = function(resolve, options) {
        options.success = resolve;
        $.ajax(options);
    };

    // the data generator for the function
    var getGhibliOptions = function() {
        return {
            type: "GET",
            url: 'https://ghibliapi.herokuapp.com/films'
        };
    };

    // test a function asynchronously
    // capture the number of achieved iterations for getGhibliFilms, with data passed by getGhibliOptions
    
    // @param timeout      {required} {integer}   - time duration for the test in milliseconds
    // @param generator    {optional} {function}  - data generator which passes data to tested function
    // @param callback     {required} {function}  - the function which will be tested
    // @param complete     {required} {function}  - the complete callback, which receives the number of achieved iterations as a parameter
    provisnr.testAsyncFunction({
        timeout: 1000,
        generator: getGhibliOptions,
        callback: getGhibliFilms,
        complete: function(iterations) {
            console.log("achieved iterations: "+iterations);
        }
    });
});
```

The above code tests asynchronously getGhibli with data, provided by myDataGenerator for one second. The number of achieved iterations is passed as an parameter to the complete function.

Provisnr can also perform comparison testing between two functions. Here's an example of that: 
```javascript
$(document).ready(function() {

    // the data generator for the function
    var getGhibliFilms = function(resolve) {
        $.ajax({
            url: 'https://ghibliapi.herokuapp.com/films',
            success: resolve
        });
    };

    // the data generator for the function
    var getGhibliPeople = function(resolve) {
        $.ajax({
            url: 'https://ghibliapi.herokuapp.com/people',
            success: resolve
        });
    };

    // test a function asynchronously
    // capture the number of achieved iterations for getGhibliData, with data passed by getGhibliOptions
    
    // @param type         {optional} {string}    - can be either "procedural" or "async", if you do not pass type, provisnr assumes you want "async"
    // @param generator    {optional} {function}  - data generator which passes data to tested function, the same generator is used for the two tested functions
    // @param callbacks    {required} {object}    - this object must contain the functions which you want to test
    // @param complete     {required} {function}  - the complete callback, which receives the number of achieved iterations as a parameter
    provisnr.comparePerformance({
        type: "async",
        timeout: 3000,
        callbacks: {
            getGhibliFilms: getGhibliFilms,
            getGhibliPeople: getGhibliPeople
        },
        complete: function(results) {
            console.log(results);
        }
    });
});
```

Compare the speed of two async functions. The functions must be provided in a callbacks object. We are not using a generator here, because the two tested callbacks use different data.
 
 The results are passed as parameter to the complete function. The returned data is an object with the following schema:

```javascript
// example data provided
{
	equallyFast: true, // boolean flag, notifying whether the two functions have achieved equal number of iterations
	fasterFunction: {
		fasterInPercentage: 35 // number equal to the performance boost of the faster function in percentage (integer) 
		name: myFunc // name of the faster function (string)
	},
	iterations: {
		funcA: 1500 // number of achieved iterations (integer)
		funcB: 2000 // number of achieved iterations (integer)
	}
}
```