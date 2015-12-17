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
	}

	// asset files are deleted when their parent asset is deleted

};

module.exports = calls;
