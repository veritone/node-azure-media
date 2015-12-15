var Very = require('verymodel');
var common = require('./common');
var Asset = require('./asset');
var Task = require('./task');
var JobNotificationSubscription = require('./jobnotificationsubscription');
var odata = require('./odata');
// http://msdn.microsoft.com/en-us/library/windowsazure/jj853024.aspx

var Model = new Very.VeryModel({
    Id: {static: true},
    Name: {},
    Created: {type: 'date', static: true},
    LastModified: {type: 'date', static: true},
    EndTime: {type: 'date', static: true},
    Priority: {type: Very.VeryValidator().isInt()},
    RunningDuration: {},
    StartTime: {},
    State: {},
    TemplateId: {},
    InputMediaAssets: {static: true, collection: Asset},
    OutputMediaAssets: {static: true, collection: Asset},
    Tasks: {collection: Task},
    JobNotificationSubscriptions: {collection: JobNotificationSubscription},
});

Model.extendModel({
    listInputMediaAssets: function (cb, query) {
        this.api.rest.job.listInputMediaAssets(this.Id, cb, query);
    },

    listOutputMediaAssets: function (cb, query) {
        this.api.rest.job.listOutputMediaAssets(this.Id, cb, query);
    },

    cancel: function (cb) {
        this.api.rest.job.cancelJob(this.Id, cb);
    },

    delete: function (cb) {
        this.api.rest.job.delete(this.Id, cb);
    },

    get: function (cb) {
        this.api.rest.job.get(this.Id, cb);
    },

});

module.exports = Model;
