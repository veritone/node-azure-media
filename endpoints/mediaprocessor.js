var path = require('path');
var modelName = path.basename(module.filename, '.js');

var calls = {

	create: function create(data, cb) {
		this.createRequest(modelName, data, cb);
	},

	get: function get(id, cb) {
		this.getRequest(modelName, id, cb);
	},

	list: function list(cb, query) {
		this.listRequest(modelName, cb, query);
	},

	update: function update(id, data, cb) {
		this.updateRequest(modelName, id, data, cb);
	},

	delete: function delete_(id, cb) {
		this.deleteRequest(modelName, id, cb);
	},

	getCurrentByName: function getCurrentByName(name, cb) {
		this.rest.mediaprocessor.list(function listMediaProcessorCallback(err, replies) {
			if (replies.length > 0) {
				cb(err, replies[0]);
			} else {
				cb('No valid replies', null);
			}
		}, {
			$top: 1,
			$filter: 'Name eq \'' + name + '\'',
			$orderby: 'Version desc'
		});
	}

};

module.exports = calls;
