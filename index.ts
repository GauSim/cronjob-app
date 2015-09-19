console.log('#################			FUN 		###################');


import {JobFactory} from './JobFactory/JobFactory';



var factory = new JobFactory();


factory.start();
factory.create("http://explore.gausmann-media.de/wp-content/uploads/2012/10/qout.png", 1);

setTimeout(() => {
	let _jobs = factory.getJobList();
	console.log(_jobs);
	factory.stop();

}, 20000)



console.log('#################			end 		###################');
 