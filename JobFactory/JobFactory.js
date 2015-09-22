/// <reference path="../typings/tsd.d.ts" />
var _ = require('underscore');
var request = require('request');
var Q = require('q');
var moment = require('moment');
var JobFactory = (function () {
    function JobFactory() {
        this.runner = null;
        this.Jobs = [];
        this.startedAt = null;
    }
    JobFactory.prototype.create = function (url, interval) {
        var self = this;
        var _jobName = self.createIndex();
        var Job = {
            name: _jobName,
            url: url,
            interval: interval,
            stats: { ok: 0, fail: 0, last: null, log: null },
            task: function () {
                console.log('Job Fired!');
                self.doReuest(url)
                    .then(function (body) {
                    var log = (body ? body.substr(0, 800) + ' ... ' : null);
                    self.logStats(true, _jobName, log);
                }, function (error) {
                    self.logStats(false, _jobName, JSON.stringify(error));
                });
            }
        };
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
                intervall: j.interval
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
        job.stats.last = moment().format('X');
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
            return ((interval.minutes % j.interval.minutes) == 0);
        });
        var hourTodo = _.filter(self.Jobs, function (j) {
            return (j.interval.hours > 0) && ((interval.hours % j.interval.hours) == 0);
        });
        var dayTodo = _.filter(self.Jobs, function (j) {
            return (j.interval.days > 0) && ((interval.days % j.interval.days) == 0);
        });
        _.each(_.union(minTodo, hourTodo, dayTodo), execute);
    };
    JobFactory.prototype.logTime = function (o) {
        var timer = o.days + ", " + o.hours + ":" + o.minutes + ":" + o.seconds;
        return timer;
    };
    JobFactory.prototype.getStatus = function () {
        return {
            isRunning: (this.runner !== null),
            startedAt: this.startedAt
        };
    };
    JobFactory.prototype.stop = function () {
        var self = this;
        clearInterval(self.runner);
        self.runner = self.startedAt = null;
    };
    JobFactory.prototype.start = function () {
        var self = this;
        self.startedAt = moment().format('X');
        var Events = {
            onMinute: function (interval) {
                self.executeJobs(interval);
            },
            onHour: function (interval) {
                self.executeJobs(interval);
            },
            onDay: function (interval) {
                self.executeJobs(interval);
            },
            onWeek: function (interval) {
                self.executeJobs(interval);
            },
        };
        var _tick = 1000;
        var o = new JobInterval();
        self.runner = setInterval(function () {
            if (o.seconds < 59)
                o.seconds++;
            else {
                Events.onMinute(o);
                o.minutes++;
                o.seconds = 0;
                console.log(self.logTime(o));
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
exports.JobInterval = JobInterval;
//# sourceMappingURL=JobFactory.js.map