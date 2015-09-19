console.log('#################			FUN 		###################');
var JobFactory_1 = require('./JobFactory/JobFactory');
var factory = new JobFactory_1.JobFactory();
factory.start();
factory.create("http://explore.gausmann-media.de/wp-content/uploads/2012/10/qout.png", 1);
setTimeout(function () {
    var _jobs = factory.getJobList();
    console.log(_jobs);
    factory.stop();
}, 20000);
console.log('#################			end 		###################');
//# sourceMappingURL=index.js.map