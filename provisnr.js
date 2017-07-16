
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
                iterations: {},
                fasterFunction: {
                    name: "",
                    fasterInPercentage: 0
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
            } else {
                results.equallyFast = true;
            }

            results.iterations[a.name] = a.iterations;
            results.iterations[b.name] = b.iterations;

            return results;
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
        comparePerformance: function(args) {
            var type = args.type;
            var generator = args.generator || function() {};
            var timeout = args.timeout;
            var complete = args.complete;
            var callbacks = args.callbacks;
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
            testProceFunction: base.testProceFunction,
            testAsyncFunction: base.testAsyncFunction,
            comparePerformance: base.comparePerformance
        };
    };

    if ( typeof module !== "undefined" && module.exports ) {
        module.exports = provisnr();
    } else {
        global.provisnr = provisnr();
    }
})(this);