/// <reference path="../typings/tsd.d.ts" />
var _ = require('underscore');
var request = require('request');
var Q = require('q');
var JobFactory = (function () {
    function JobFactory() {
        this.Jobs = [];
    }
    JobFactory.prototype.create = function (url, minutes) {
        var self = this;
        var _jobName = self.createIndex();
        var Job = {
            name: _jobName,
            url: url,
            intervall: new JobInterval(),
            stats: { ok: 0, fail: 0, last: null, log: null },
            task: function () {
                console.log('Job Fired!');
                self.doReuest(url)
                    .then(function (body) {
                    var log = (body ? body.substr(0, 100) : null);
                    self.logStats(true, _jobName, log);
                }, function (error) {
                    self.logStats(false, _jobName, JSON.stringify(error));
                });
            }
        };
        Job.intervall.minutes = minutes;
        self.Jobs.push(Job);
    };
    JobFactory.prototype.remove = function (name) {
        this.Jobs = _.filter(this.Jobs, function (j) { return j.name != name; });
    };
    JobFactory.prototype.getJobList = function () {
        return _.map(this.Jobs, function (j) {
            return {
                name: j.name,
                stats: j.stats,
                url: j.url,
                intervall: j.intervall
            };
        });
    };
    JobFactory.prototype.logStats = function (susscess, jobname, log) {
        var self = this;
        var job = _.find(self.Jobs, function (j) { return j.name == jobname; });
        if (!job)
            return;
        if (susscess)
            job.stats.ok++;
        else
            job.stats.fail++;
        job.stats.log = log;
        job.stats.last = new Date().toISOString();
    };
    JobFactory.prototype.doReuest = function (url) {
        var d = Q.defer();
        request
            .get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                d.resolve(body);
            }
            else {
                d.reject(error);
            }
        });
        return d.promise;
    };
    JobFactory.prototype.createIndex = function () {
        var alphabet = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,w,x,y,z'.split(',');
        var jobName = 'job_';
        _(8).times(function (n) {
            jobName += _.sample(alphabet, 1);
        });
        return jobName;
    };
    JobFactory.prototype.executeJobs = function (interval) {
        var self = this;
        var execute = function (j) {
            try {
                var t = self.logTime(interval);
                console.log("--- START " + j.name + " " + t);
                j.task();
            }
            catch (ex) {
                j.stats.fail++;
                j.stats.log = ex;
            }
        };
        var minTodo = _.filter(self.Jobs, function (j) {
            return (interval.minutes > 0) && (j.intervall.minutes > 0) && ((interval.minutes % j.intervall.minutes) == 0);
        });
        var hourTodo = _.filter(self.Jobs, function (j) {
            return (interval.minutes == 0 && interval.hours > 0) && (j.intervall.hours > 0) && ((interval.hours % j.intervall.hours) == 0);
        });
        var dayTodo = _.filter(self.Jobs, function (j) {
            return (interval.hours == 0 && interval.days > 0) && (j.intervall.days > 0) && ((interval.days % j.intervall.days) == 0);
        });
        _.each(_.union(minTodo, hourTodo, dayTodo), execute);
    };
    JobFactory.prototype.logTime = function (o) {
        var timer = o.days + ", " + o.hours + ":" + o.minutes + ":" + o.seconds;
        return timer;
    };
    JobFactory.prototype.stop = function () {
        var self = this;
        clearInterval(self.runner);
    };
    JobFactory.prototype.start = function () {
        var self = this;
        var Events = {
            onMinute: function (interval) {
                console.log('fire min Event ' + interval.minutes);
                self.executeJobs(interval);
            },
            onHour: function (interval) {
                console.log('fire hour Event ' + interval.hours);
                self.executeJobs(interval);
            },
            onDay: function (interval) {
                console.log('fire Day Event ' + interval.days);
                self.executeJobs(interval);
            },
            onWeek: function (interval) {
                console.log('fire Week Event ' + interval.weeks);
                self.executeJobs(interval);
            },
        };
        var _tick = 1000;
        var o = new JobInterval();
        this.runner = setInterval(function () {
            if (o.seconds < 59)
                o.seconds++;
            else {
                Events.onMinute(o);
                o.minutes++;
                o.seconds = 0;
            }
            if (o.minutes == 60) {
                Events.onHour(o);
                o.hours++;
                o.minutes = 0;
            }
            if (o.hours == 24) {
                Events.onDay(o);
                o.days++;
                o.hours = 0;
            }
            if (o.days == 7) {
                Events.onWeek(o);
                o.weeks++;
                days: 0;
            }
        }, _tick);
    };
    return JobFactory;
})();
exports.JobFactory = JobFactory;
var JobInterval = (function () {
    function JobInterval() {
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.days = 0;
        this.weeks = 0;
    }
    return JobInterval;
})();
//# sourceMappingURL=JobFactory.js.map