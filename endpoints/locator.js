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

	findOrCreate: function findOrCreateLocator(assetId, locatorType, accessPolicyId, startTime, cb) {
		var self = this;
		self.rest.locator.list(function(err, locators) {
			if (err) {
				return cb(err);
			}

			var locator;
			locators.forEach(function(loc) {
				if (loc.Type === locatorType && loc.AccessPolicyId === accessPolicyId && loc.AssetId === assetId) {
					locator = loc;
				}
			});

			if (locator) {
				locator.StartTime = startTime;
				self.rest.locator.update(locator.Id, locator, cb);
			} else {
				locator = {
					AccessPolicyId: accessPolicyId,
					AssetId: assetId,
					StartTime: startTime,
					Type: locatorType
				};
				self.rest.locator.create(locator, cb);
			}
		});
	}
};

module.exports = calls;
