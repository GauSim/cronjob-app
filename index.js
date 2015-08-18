/// <reference path="typings/tsd.d.ts" />
var JobFactory;
(function (JobFactory) {
    var CronJobManager = require('cron-job-manager');
    var _ = require('underscore');
    var request = require('request');
    var App = (function () {
        function App() {
            this.Manager = {};
            this.Logs = [];
        }
        App.prototype.create = function (url) {
            var self = this;
            var name = this.createIndex();
            var _task = function () {
                console.log('running ' + name + ' calling =>' + url);
                console.dir(self.Logs);
                request(url, function (error, response, body) {
                    if (!error) {
                        self.log(name, response.statusCode.toString());
                    }
                    else {
                        self.log(name, JSON.stringify(error));
                    }
                });
            };
            this.Manager[name] = new CronJobManager('job1', '30 * * * * *', _task, {
                start: true,
                completion: function () {
                },
                timeZone: "Europe/Amsterdam"
            });
        };
        App.prototype.createIndex = function () {
            var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var idx = 'job_';
            _(8).times(function (n) {
                idx += (_.sample(alphabet, 1));
            });
            return idx;
        };
        App.prototype.log = function (name, statusCode) {
            this.Logs.push({
                name: name,
                status: (statusCode == "200"),
                timestamp: new Date().toISOString()
            });
            while (this.Logs.length == 5) {
                this.Logs.shift();
            }
            console.dir(this.Logs.length);
        };
        return App;
    })();
    JobFactory.App = App;
})(JobFactory || (JobFactory = {}));
/// <reference path="typings/tsd.d.ts" />
/// <reference path="JobFactory.ts" />
var JobFactory;
(function (JobFactory) {
    var factory = new JobFactory.App();
    factory.create("http://gausmann-media.de");
    factory.create("http://gausmann-media.de");
})(JobFactory || (JobFactory = {}));
//# sourceMappingURL=index.js.map