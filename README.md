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


# How to Use

You can use Provisnr like this:

```javascript
<script>

var funcA = function(seq) {
	setTimeout(function() {
		console.log("Func A");
		console.log(seq);
		
		seq.resolve(2501);
	}, 2500);
};

var funcB = function(seq) {
	setTimeout(function() {
		console.log("Func B");
		console.log(seq);
		
		seq.reject(new Error("Something went wrong!"));
	}, 1500);
};

var funcC = function(seq) {
	setTimeout(function() {
		console.log("Func C");
		console.log(seq);
		
		seq.resolve(2500);
	}, 500);
};

// execute a Provisnr of async functions via procedural API
Provisnr
	.chain(funcA)
	.chain(funcB)
	.chain(funcC)
	.execute();

</script>
```

This will chain funcA, funcB and funcC. The 'execute' method will execute the built chain. Please, note that the order of chaining determines the order of execution.

The chained functions need to use the 'seq' object, passed by Provisnr, to enable the actual chaining. 

To resolve a chained function, use 'seq.resolve()', and to reject a chained function, use 'seq.reject()'. You can pass a single argument to resolve() and reject().

You have direct access from the response of the previously executed function via the 'req.response' property. This is an object with two available properties - value and error. Value is the argument, passed by resolve(). Error is the value, passed by reject().

Provisnr does not provide internal mechanisms for storing and passing values from multiple previously executed functions. This means that req.response contains the response data of only the previously executed function.

In case you need to store responses from multiple functions, you can use the following pattern:

```javascript
<script>

var responseA, responseB;

var callbackA = function(seq) {
	seq.resolve(2501);
};

var callbackB = function(req) {
	responseA = req.response;
	seq.resolve(2507);
};

var callbackC = function() {
	responseB = req.response;
	
	console.log(responseA);
	console.log(responseB);
};

Provisnr
	.chain(callbackA)
	.chain(callbackB)
	.chain(callbackC))
	.execute();

</script>
```

As you can see, you need to provide your own mechanism of storing the responses from each chained function.