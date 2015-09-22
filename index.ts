import * as bodyParser from 'body-parser';
import * as m from './JobFactory/JobFactory';
import * as http from 'http';
import * as express from 'express'
import * as moment from 'moment';



process.on('uncaughtException', function(err) {
	console.log(err);
});


var app = express();

var auth = function middlware1(req) {
	//console.log(req.headers['X-GMAuth']);
}
var factory = new m.JobFactory();

//var mn = moment().add(1, 'day').set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
var mn = moment();

var ready = setInterval(() => {
	var now = moment();
	var diff = mn.diff(now, 'minutes');

	if (diff < 1) {
		console.log('starting runner: ', moment().format());
		factory.start();
		clearInterval(ready);
	} else {
		console.log('idel: ' + moment().format('HH:mm:ss'), "waiting: " + diff + " minutes " + mn.format('HH:mm:ss'));
	}

}, 999);

app.use(bodyParser.json());
app.use('/api/status', (req, res, next) => {
	auth(req);

	res.end(JSON.stringify(factory.getStatus()))

});
app.use('/api/list', (req, res, next) => {
	auth(req);

	res.end(JSON.stringify(factory.getJobList()));

});
app.use('/api/add', (req, res, next) => {
	auth(req);

	var data: { url: string, interval: m.JobInterval } = req.body;
	if (data && data.url && data.interval) {

		factory.create(data.url, data.interval);
		res.end(JSON.stringify(factory.getJobList()));

	} else {
		res.end('');
	}

	next();
});

app.use('/api/remove', (req, res, next) => {
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

var server = app.listen((process.env.PORT || 5000), function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});