/// <reference path="../typings/tsd.d.ts" />

import * as _ from 'underscore';
import * as request from 'request';
import * as Q from 'q';
import * as moment from 'moment';


export class JobFactory {

    private runner: NodeJS.Timer = null;
    private Jobs: iJob[] = [];
    private startedAt: string = null;

    constructor() {
    }

    create(url: string, interval: JobInterval) {
        var self = this;
        var _jobName = self.createIndex();
        var Job: iJob = {
            name: _jobName,
            url: url,
            interval: interval,
            stats: { ok: 0, fail: 0, last: null, log: null },
            task: () => {
                console.log('Job Fired!');
                self.doReuest(url)
                    .then(body => {
                        var log = (body ? body.substr(0, 800) + ' ... ' : null)
                        self.logStats(true, _jobName, log)
                    },
                        error => {
                            self.logStats(false, _jobName, JSON.stringify(error))
                        });
            }
        }
        self.Jobs.push(Job);
    }
    remove(name: string) {
        this.Jobs = _.filter(this.Jobs, j=> { return j.name != name });
    }
    getJobList() {
        return _.map(this.Jobs, j => {
            return {
                name: j.name,
                stats: j.stats,
                url: j.url,
                intervall: j.interval
            };
        })
    }
    private logStats(susscess: boolean, jobname: string, log: string) {
        var self = this;

        var job = _.find<iJob>(self.Jobs, j => { return j.name == jobname });
        if (!job) return;

        if (susscess)
            job.stats.ok++
        else
            job.stats.fail++;

        job.stats.log = log;

        job.stats.last = moment().format('X');
    }
    private doReuest(url: string): Q.IPromise<string> {
        var d = Q.defer();
        request
            .get(url, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    d.resolve(body);
                } else {
                    d.reject(error);
                }
            })
        return d.promise;
    }

    private createIndex() {
        var alphabet = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,w,x,y,z'.split(',');
        var jobName = 'job_';
        _(8).times(n => {
            jobName += _.sample(alphabet, 1);
        });
        return jobName;
    }


    private executeJobs(interval: JobInterval) {
        var self = this;

        let execute = (j: iJob) => {

            try {
                var t = self.logTime(interval);
                console.log(`--- START ${j.name} ${ t }`);
                j.task();
            } catch (ex) {
                j.stats.fail++;
                j.stats.log = ex;
            }

        }
        let minTodo = _.filter<iJob>(self.Jobs, j=> {
            return ((interval.minutes % j.interval.minutes) == 0);
        });
        let hourTodo = _.filter<iJob>(self.Jobs, j=> {
            return (j.interval.hours > 0) && ((interval.hours % j.interval.hours) == 0);
        });
        let dayTodo = _.filter<iJob>(self.Jobs, j=> {
            return (j.interval.days > 0) && ((interval.days % j.interval.days) == 0);
        });

        _.each(_.union(minTodo, hourTodo, dayTodo), execute);



    }

    private logTime(o: JobInterval) {
        var timer: string = `${o.days}, ${o.hours}:${o.minutes}:${o.seconds}`;
        return timer;
    }
    getStatus() {
        return {
            isRunning: (this.runner !== null),
            startedAt: this.startedAt
        };
    }
    stop() {
        var self = this;
        clearInterval(self.runner);
        self.runner = self.startedAt = null;
    }
    start() {
        var self = this;
        self.startedAt = moment().format('X');

        var Events = {
            onMinute: (interval: JobInterval) => {
                self.executeJobs(interval);
            },
            onHour: (interval: JobInterval) => {
                self.executeJobs(interval);
            },
            onDay: (interval: JobInterval) => {
                self.executeJobs(interval);
            },
            onWeek: (interval: JobInterval) => {
                self.executeJobs(interval);
            },
        }

        var _tick = 1000;
        var o = new JobInterval();

        self.runner = setInterval(() => {

           

            if (o.seconds < 59)
                o.seconds++;
            else {
                Events.onMinute(o);
                o.minutes++
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
    }
}
export class JobInterval {
    seconds: number = 0;
    minutes: number = 0;
    hours: number = 0;
    days: number = 0;
    weeks: number = 0;
}
interface iJob {
    name: string;
    url: string;
    interval: JobInterval,
    stats: { ok: number, fail: number, last: string, log: string },
    task: () => void;
}
