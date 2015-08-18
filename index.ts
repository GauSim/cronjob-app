/// <reference path="typings/tsd.d.ts" />

var CronJobManager = require('cron-job-manager');
var _:UnderscoreStatic = require('underscore');
var request = require('request');

interface iManger {
    start(task:string);
    stop(task:string);
    deleteJob(task:string);
    add(task:string, any);
    update(task:string, any);
    exists(task:string):boolean;
    stopAll();
    listCrons():any[];
}
class JobFactor {
    Manager:_.Dictionary<iManger> = {};
    Logs:{ name:string; status:boolean; timestamp:string; }[] = [];

    constructor() {
    }

    create(url:string) {
        var self = this;
        var name = this.createIndex();
        var _task = () => {
            console.log('running ' + name + ' calling =>' + url);
            console.dir(self.Logs);
            request(url, function (error, response, body) {
                if (!error) {
                    self.log(name, response.statusCode.toString());
                    //console.log(body); // Show the HTML for the Google homepage.
                } else {
                    self.log(name, JSON.stringify(error));
                }
            });
        };

        this.Manager[name] = new CronJobManager('job1',
            '30 * * * * *',
            _task,
            {
                start: true,
                completion: () => {
                },
                timeZone: "Europe/Amsterdam"
            });

    }

    createIndex() {
        var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        var idx = 'job_';
        _(8).times((n)=> {
            idx += (_.sample(alphabet, 1));
        });
        return idx;
    }

    log(name:string, statusCode:string) {
        this.Logs.push({
            name: name,
            status: (statusCode == "200"),
            timestamp: new Date().toISOString()
        });

        while (this.Logs.length == 5) {
            this.Logs.shift();
        }

        console.dir(this.Logs.length);
    }

}

var factory = new JobFactor();
factory.create("http://gausmann-media.de");
factory.create("http://gausmann-media.de");





