var path = require('path');
var modelName = path.basename(module.filename, '.js');

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

	findOrCreate: function findOrCreate(locator, cb) {
		var self = this;
		self.rest.locator.list(function listLocatorCallback(err, locators) {
			if (err) {
				return cb(err);
			}

			var existingLocator;
			locators.forEach(function forEachLocator(loc) {
				if (loc.Type === locator.Type && loc.AccessPolicyId === locator.AccessPolicyId && loc.AssetId === locator.AssetId) {
					existingLocator = loc;
				}
			});

			if (existingLocator) {
				self.rest.locator.update(existingLocator.Id, locator, cb);
			} else {
				self.rest.locator.create(locator, cb);
			}
		});
	}
};

module.exports = calls;
