
/**
 * Provisnr JavaScript Library
 * Provides performance-testing methods
 * v2.2.4
 *
 * Released under the MIT license
 */

(function(global) {

    var base = {
        collectResults: function(a, b) {
            var faster, slower;
            var equal = false;
            var results = {
                equallyFast: false,
                iterations: {},
                fasterFunction: {
                    name: "",
                    fasterInPercentage: 0,
                    fasterInIterations: 0
                }
            };

            if ( a.iterations > a.iterations ) {
                faster = a;
                slower = b;
            } else if ( a.iterations < b.iterations) {
                faster = b;
                slower = a;
            } else {
                equal = true;
            }

            if ( ! equal ) {
                results.fasterFunction.name = faster.name;
                results.fasterFunction.fasterInPercentage = parseInt((faster.iterations - slower.iterations) / slower.iterations * 100, 10);
                results.fasterFunction.fasterInIterations = faster.iterations - slower.iterations;
            } else {
                results.equallyFast = true;
            }

            results.iterations[a.name] = a.iterations;
            results.iterations[b.name] = b.iterations;

            return results;
        },
        issueError: function(error) {
            return new Error(error);
        },
        testFunction: function(options) {
            var that = base;

            if ( typeof options !== "object" ) {
                return that.issueError("Provisnr requires options (object). Pass an options object.");
            }

            if ( typeof options.type !== "string" ) {
                return that.issueError("Provisnr requires a type (string). Pass a type ('procedural'/'async') as part of the options object.");
            }

            if ( typeof options.timeout !== "number" ) {
                return that.issueError("Provisnr requires a timeout (integer). Pass a timeout property as part of the options object.");
            }

            if ( typeof options.callback !== "function" ) {
                return that.issueError("Provisnr requires a callback (function). Pass a callback as part of the options object.");
            }

            if ( options.type !== "procedural" && typeof options.complete !== "function" ) {
                return that.issueError("Provisnr requires a complete (function). Pass a complete as part of the options object.");
            }

            if ( options.type === "procedural" ) {
                base.testProceFunction({
                    timeout: parseInt(options.timeout, 10),
                    callback: options.callback,
                    generator: options.generator
                });
            } else {
                base.testAsyncFunction({
                    timeout: parseInt(options.timeout, 10),
                    callback: options.callback,
                    generator: options.generator,
                    complete: options.complete
                });
            }
        },
        testProceFunction: function(args) {
            var iterations;
            var startTime = new Date().getTime();
            var elapsedTime = 0;
            var timeout = args.timeout;
            var callback = args.callback;
            var generator = args.generator || function() {};
            var data = generator();

            for ( iterations = 0; elapsedTime < timeout; iterations++ ) {
                callback(data);
                elapsedTime = new Date().getTime() - startTime;
            }
            return iterations;
        },
        testAsyncFunction: function(args) {
            var iterations = 0;
            var startTime = new Date().getTime();
            var elapsedTime = 0;
            var timeout = args.timeout;
            var callback = args.callback;
            var complete = args.complete;
            var generator = args.generator || function() {};
            var data = generator();

            var iterateAsync = function() {
                if ( elapsedTime >= timeout ) {
                    return complete(iterations);
                }

                callback(function() {
                    elapsedTime = new Date().getTime() - startTime;
                    iterations++;
                    iterateAsync();
                }, data);
            };

            iterateAsync();
        },
        comparePerformance: function(options) {
            var that = base;

            if ( typeof options !== "object" ) {
                return that.issueError("Provisnr requires options (object). Pass an options object.");
            }

            if ( typeof options.type !== "string" ) {
                return that.issueError("Provisnr requires a type (string). Pass a type ('procedural'/'async') as part of the options object.");
            }

            if ( typeof options.timeout !== "number" ) {
                return that.issueError("Provisnr requires a timeout (integer). Pass a timeout property as part of the options object.");
            }

            if ( typeof options.callbacks !== "object" ) {
                return that.issueError("Provisnr requires a callback (function). Pass a callback as part of the options object.");
            }

            if ( Object.keys(options.callbacks).length !== 2 ) {
                return that.issueError("Provisnr requires callbacks (object), containing 2 methods for test comparison. Pass two methods to callbacks as part of the options object.");
            }

            if ( options.type !== "procedural" && typeof options.complete !== "function" ) {
                return that.issueError("Provisnr requires a complete (function). Pass a complete as part of the options object.");
            }

            var type = options.type;
            var generator = options.generator || function() {};
            var timeout = options.timeout;
            var complete = options.complete;
            var callbacks = options.callbacks;
            var keys = Object.keys(callbacks);
            var funcAName = keys[0];
            var funcBName = keys[1];
            var resultA = {
                name: funcAName,
                iterations: 0
            };
            var resultB = {
                name: funcBName,
                iterations: 0
            };

            if ( type === "procedural" ) {
                resultA.iterations = base.testProceFunction({
                    timeout: timeout,
                    generator: generator,
                    callback: callbacks[funcAName]
                });
                resultB.iterations = base.testProceFunction({
                    timeout: timeout,
                    generator: generator,
                    callback: callbacks[funcBName]
                });

                return base.collectResults(resultA, resultB);
            } else {
                base.testAsyncFunction({
                    timeout: timeout,
                    generator: generator,
                    callback: callbacks[funcAName],
                    complete: function(iterationsA) {
                        resultA.iterations = iterationsA;

                        base.testAsyncFunction({
                            timeout: timeout,
                            generator: generator,
                            callback: callbacks[funcBName],
                            complete: function(iterationsB) {
                                resultB.iterations = iterationsB;
                                return complete(base.collectResults(resultA, resultB));
                            }
                        });
                    }
                });
            }
        }
    };

    var provisnr = function() {
        return {
            testFunction: base.testFunction,
            comparePerformance: base.comparePerformance
        };
    };

    if ( typeof module !== "undefined" && module.exports ) {
        module.exports = provisnr();
    } else {
        global.provisnr = provisnr();
    }
})(this);