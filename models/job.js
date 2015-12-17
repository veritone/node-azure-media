var very = require('verymodel');
var Asset = require('./asset');
var Task = require('./task');
var JobNotificationSubscription = require('./jobnotificationsubscription');
// http://msdn.microsoft.com/en-us/library/windowsazure/jj853024.aspx

var Model = new very.VeryModel({
	Id: {static: true},
	Name: {},
	Created: {type: 'date', static: true},
	LastModified: {type: 'date', static: true},
	EndTime: {type: 'date', static: true},
	Priority: {type: very.VeryValidator().isInt()},
	RunningDuration: {},
	StartTime: {},
	State: {},
	TemplateId: {},
	InputMediaAssets: {static: true, collection: Asset},
	OutputMediaAssets: {static: true, collection: Asset},
	Tasks: {collection: Task},
	JobNotificationSubscriptions: {collection: JobNotificationSubscription}
});

Model.extendModel({
	listInputMediaAssets: function listInputMediaAssets(cb, query) {
		this.api.rest.job.listInputMediaAssets(this.Id, cb, query);
	},

	listOutputMediaAssets: function listOutputMediaAssets(cb, query) {
		this.api.rest.job.listOutputMediaAssets(this.Id, cb, query);
	},

	cancel: function cancel(cb) {
		this.api.rest.job.cancelJob(this.Id, cb);
	},

	delete: function delete_(cb) {
		this.api.rest.job.delete(this.Id, cb);
	},

	get: function get(cb) {
		this.api.rest.job.get(this.Id, cb);
	}

});

module.exports = Model;
