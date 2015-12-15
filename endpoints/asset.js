var path = require('path');
var modelName = path.basename(module.filename, '.js');
var models = require('../models');
var request = require('request');

var calls = {

	create: function create(data, cb) {
		this.createRequest(modelName, data, cb);
	},

	get: function get(id, opts, cb) {
		if (typeof opts === 'function') {
			cb = opts;
			opts = {};
		}
		this.getRequest(modelName, id, function getRequestCallback(err, obj) {
			if (opts.getDeferred) {
				obj.getDeferred(obj, opts.getDeferred, cb);
			} else {
				cb(err, obj);
			}
		}.bind(this));
	},

	list: function lists(cb, query) {
		this.listRequest(modelName, cb, query);
	},

	update: function update(id, data, cb) {
		this.updateRequest(modelName, id, data, cb);
	},

	delete: function delete_(id, cb) {
		this.deleteRequest(modelName, id, cb);
	},

	listFiles: function listFiles(id, cb, query) {
		//cb = cb || function () {};

		request.get({
			uri: this.modelURI('asset', id) + '/Files',
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true,
			qs: query
		}, function requestCallback(err, res) {
			console.log(err, res.statusCode);
			var objs = [];
			if (res.statusCode == 200) {
				var data = JSON.parse(res.body).d.results;
				data.forEach(function forEachAssetFile(rawd) {
					var dobj = models.assetfile.create(rawd);
					objs.push(dobj);
				});
				cb(err, objs);
			} else {
				cb(err || 'Expected 200 status, received: ' + res.statusCode);
			}
		});

	},
	listLocators: function listLocators(id, cb, query) {
		//cb = cb || function () {};

		request.get({
			uri: this.modelURI('asset', id) + '/Locators',
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true,
			qs: query
		}, function requestCallback(err, res) {
			console.log(err, res.statusCode);
			var objs = [];
			if (res.statusCode == 200) {
				var data = JSON.parse(res.body).d.results;
				data.forEach(function forEachLocator(rawd) {
					var dobj = models.locator.create(rawd);
					objs.push(dobj);
				});
				cb(err, objs);
			} else {
				cb(err || 'Expected 200 status, received: ' + res.statusCode);
			}
		});

	},
	listContentKeys: function listContentKeys(id, cb, query) {
		//cb = cb || function () {};

		request.get({
			uri: this.modelURI('asset', id) + '/ContentKeys',
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true,
			qs: query
		}, function requestCallback(err, res) {
			console.log(err, res.statusCode);
			var objs = [];
			if (res.statusCode == 200) {
				var data = JSON.parse(res.body).d.results;
				data.forEach(function forEachContentKey(rawd) {
					var dobj = models.contentkey.create(rawd);
					objs.push(dobj);
				});
				cb(err, objs);
			} else {
				cb(err || 'Expected 200 status, received: ' + res.statusCode);
			}
		});

	},
	listParentAssets: function listParentAssets(id, cb, query) {
		//cb = cb || function () {};

		request.get({
			uri: this.modelURI('asset', id) + '/ParentAssets',
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true,
			qs: query
		}, function requestCallback(err, res) {
			console.log(err, res.statusCode);
			var objs = [];
			if (res.statusCode == 200) {
				var data = JSON.parse(res.body).d.results;
				data.forEach(function forEachParentAsset(rawd) {
					var dobj = models.asset.create(rawd);
					objs.push(dobj);
				});
				cb(err, objs);
			} else {
				cb(err || 'Expected 200 status, received: ' + res.statusCode);
			}
		});

	},
	getStorageAccount: function getStorageAccount(id, cb, query) {
		//cb = cb || function () {};

		request.get({
			uri: this.modelURI('asset', id) + '/StorageAccount',
			headers: this.defaultHeaders(),
			followRedirect: false,
			strictSSL: true,
			qs: query
		}, function requestCallback(err, res) {
			console.log(err, res.statusCode);
			if (res.statusCode == 200) {
				var data = JSON.parse(res.body).d;
				var dobj = models.storageaccount.create(data);
				cb(err, dobj);
			} else {
				cb(err || 'Expected 200 status, received: ' + res.statusCode);
			}
		});

	}

};

calls.deferredCall = {
	Locators: calls.listLocators,
	ContentKeys: calls.listContentKeys,
	Files: calls.listFiles,
	ParentAssets: calls.listParentAssets,
	StorageAccount: calls.getStorageAccount
};

module.exports = calls;
