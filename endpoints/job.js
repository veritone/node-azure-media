var path = require('path');
var modelName = path.basename(module.filename, '.js');
var request = require('request');
var models = require('../models');

var calls = {

	create: function create(data, cb) {
		this.createRequest(modelName, data, cb);
	},

	get: function get(id, cb) {
		this.getRequest(modelName, id, cb);
	},

	list: function list(cb) {
		this.listRequest(modelName, cb);
	},

	update: function update(id, data, cb) {
		this.updateRequest(modelName, id, data, cb);
	},

	delete: function delete_(id, cb) {
		this.deleteRequest(modelName, id, cb);
	},

	listInputMedias: function listInputMedias(id, cb, query) {
		//cb = cb || function () {};

		request.get({
			uri: this.modelURI('job', id) + '/InputMedias',
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true,
			qs: query
		}, function requestCallback(err, res) {
			var objs = [];
			if (res.statusCode == 200) {
				var data = JSON.parse(res.body).d.results;
				data.forEach(function forEachAsset(rawd) {
					var dobj = models.asset.create(rawd);
					objs.push(dobj);
				});
				cb(err, objs);
			} else {
				cb(err || 'Expected 200 status, received: ' + res.statusCode);
			}
		});
	},

	listOutputMedias: function listOutputMedias(id, cb, query) {
		//cb = cb || function () {};

		request.get({
			uri: this.modelURI('job', id) + '/OutputMedias',
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true,
			qs: query
		}, function requestCallback(err, res) {
			var objs = [];
			if (res.statusCode == 200) {
				var data = JSON.parse(res.body).d.results;
				data.forEach(function forEachAsset(rawd) {
					var dobj = models.asset.create(rawd);
					objs.push(dobj);
				});
				cb(err, objs);
			} else {
				cb(err || 'Expected 200 status, received: ' + res.statusCode);
			}
		});
	},

	cancel: function cancel(id, cb) {
		request.get({
			uri: this.config.baseUrl + 'CancelJob',
			qs: {jobid: '\'' + id + '\''},
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true
		}, function requestCallback(err, res) {
			cb(err, res.statusCode);
		});
	}

};

module.exports = calls;
