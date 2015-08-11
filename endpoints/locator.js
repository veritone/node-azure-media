var path = require('path');
var modelName = path.basename(module.filename, '.js');

var calls = {

    create: function createLocator(data, cb) {
        this.createRequest(modelName, data, cb);
    },

    get: function getLocator(id, cb) {
        this.getRequest(modelName, id, cb);
    },

    list: function listLocators(cb) {
        this.listRequest(modelName, cb);
    },

    update: function updateLocator(id, data, cb) {
        this.updateRequest(modelName, id, data, cb);
    },

    delete: function deleteLocator(id, cb) {
        this.deleteRequest(modelName, id, cb);
    },

	findOrCreate: function findOrCreateLocator(locator, cb) {
		var self = this;
		self.rest.locator.list(function(err, locators) {
			if (err) {
				return cb(err);
			}

			var existingLocator;
			locators.forEach(function(loc) {
				if (loc.Type === locator.Type && loc.AccessPolicyId === locator.AccessPolicyId && loc.AssetId === locator.AssetId) {
					existingLocator = loc;
				}
			});

			if (existingLocator) {
				var updatedLocator = existingLocator.toJSON();
				updatedLocator.Id = undefined;
				updatedLocator.StartTime = locator.StartTime;
				self.rest.locator.update(existingLocator.Id, updatedLocator, cb);
			} else {
				self.rest.locator.create(locator, cb);
			}
		});
	}
};

module.exports = calls;
