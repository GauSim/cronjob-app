/// <reference path="../typings/tsd.d.ts" />

import * as _ from 'underscore';
import * as request from 'request';
import * as Q from 'q';

export class JobFactory {

    private runner: NodeJS.Timer;
    private Jobs: iJob[] = [];

    constructor() {
    }

    create(url: string, minutes: number) {
        var self = this;
        var _jobName = self.createIndex();
        var Job: iJob = {
            name: _jobName,
            intervall: new JobInterval(),
            stats: { ok: 0, fail: 0, last: null },
            task: () => {
                console.log('Job Fired!');
                self.doReuest(url)
                    .then(body => {
                        self.logStats(true, _jobName)
                    },
                        error => {
                            self.logStats(false, _jobName)
                        });
               
                //self.stop();
            }
        }
        Job.intervall.minutes = minutes; // 30 =>  every 30 minutes 
        // Job.intervall.hours = 1; // each hour
        self.Jobs.push(Job);
    }
    remove(name: string) {
        this.Jobs = _.filter(this.Jobs, j=> { return j.name != name });
    }
    getJobList() {
        return _.map(this.Jobs, j => {
            return { name: j.name, stats: j.stats };
        })
    }
    private logStats(susscess: boolean, jobname: string) {
        var self = this;

        var job = _.find<iJob>(self.Jobs, j => { return j.name == jobname });
        if (!job) return;

        if (susscess)
            job.stats.ok++
        else
            job.stats.fail++;

        job.stats.last = new Date().toDateString() +' | '+ new Date().toTimeString();
    }
    private doReuest(url: string): Q.IPromise<string> {
        var d = Q.defer();
        request
            .get(url, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    //var info = JSON.parse(body);
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
            console.log(`--- START  ${j.name}`);
            self.logTime(interval);
            try {
                j.task();
            } catch (ex) {
                console.log(ex);
            }

            console.log(`--- END    ${j.name}`);
        }
        let minTodo = _.filter<iJob>(self.Jobs, j=> {
            return (interval.minutes > 0) && (j.intervall.minutes > 0) && ((interval.minutes % j.intervall.minutes) == 0);
        });
        let hourTodo = _.filter<iJob>(self.Jobs, j=> {
            return (interval.minutes == 0 && interval.hours > 0) && (j.intervall.hours > 0) && ((interval.hours % j.intervall.hours) == 0);
        });
        let dayTodo = _.filter<iJob>(self.Jobs, j=> {
            return (interval.hours == 0 && interval.days > 0) && (j.intervall.days > 0) && ((interval.days % j.intervall.days) == 0);
        });

        _.each(_.union(minTodo, hourTodo, dayTodo), execute);



    }

    private logTime(o: JobInterval) {
        var timer: string = `${o.days}, ${o.hours}:${o.minutes}:${o.seconds}`;
        console.log(timer);
    }
    stop() {
        var self = this;
        clearInterval(self.runner);
    }
    start() {
        var self = this;
        var Events = {
            onMinute: (interval: JobInterval) => {
                console.log('fire min Event ' + interval.minutes);
                self.executeJobs(interval);
            },
            onHour: (interval: JobInterval) => {
                console.log('fire hour Event ' + interval.hours);
                self.executeJobs(interval);
            },
            onDay: (interval: JobInterval) => {
                console.log('fire Day Event ' + interval.days);
                self.executeJobs(interval);
            },
            onWeek: (interval: JobInterval) => {
                console.log('fire Week Event ' + interval.weeks);
                self.executeJobs(interval);
            },
        }

        var _tick = 100; //1000;
        var o = new JobInterval();

        this.runner = setInterval(() => {


            if (o.seconds < 59)
                o.seconds++;
            else {
                Events.onMinute(o);
                o.minutes++
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
    }
}
class JobInterval {
    seconds: number = 0;
    minutes: number = 0;
    hours: number = 0;
    days: number = 0;
    weeks: number = 0;
}
interface iJob {
    name: string;
    intervall: JobInterval,
    stats: { ok: number, fail: number, last: string },
    task: () => void;
}
