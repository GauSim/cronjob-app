import * as bodyParser from 'body-parser';
import * as m from './JobFactory/JobFactory';
import * as http from 'http';
import * as express from 'express'



process.on('uncaughtException', function(err) {
	console.log(err);
});


var app = express();

var auth = function middlware1(req) {
	//console.log(req.headers['X-GMAuth']);
}
var factory = new m.JobFactory();
factory.start();


app.use(bodyParser.json());

app.use('/api/list', function(req, res, next) {
	auth(req);

	res.end(JSON.stringify(factory.getJobList(), null, "\t"));

});
app.use('/api/add', function(req, res, next) {
	auth(req);

	var data = req.body;
	if (data && data.url && data.interval) {

		factory.create(data.url, data.interval);
		res.end(JSON.stringify(factory.getJobList(), null, "\t"));

	} else {
		res.end('');
	}

	next();
});

app.use('/api/remove', function(req, res, next) {
	auth(req);

	var data = req.body;
	if (data && data.name) {

		factory.remove(data.name);
		res.end(JSON.stringify(factory.getJobList(), null, "\t"));

	} else {
		res.end('');
	}

	next();
});
app.use('/', express.static('frontend/dist'));

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});