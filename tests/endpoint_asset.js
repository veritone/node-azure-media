var config = require('../testconfig');
var Azure = require('../index.js');

module.exports = {
	'Create, List, Get, and Delete': function test1(test) {
		var az = new Azure(config.auth);
		az.init(function initCallback() {
			az.rest.asset.create({Name: 'nodetest'}, function createAssetCallback(err, result1) {
				test.ok(result1.Name === 'nodetest');
				az.rest.asset.list(function listAssetsCallback(err, results) {
					test.ok(results.length > 0);
					var length = results.length;
					var idx = 0;
					results.forEach(function forEachResult(result) {
						var obj = result.toObject();
						az.rest.asset.get(result.Id, function getAssetCallback(err, asset) {
							test.ok(asset.Id === result.Id);
							az.rest.asset.delete(obj.Id, function deleteAssetCallback(/*err*/) {
								idx += 1;
								if (idx === length) {
									test.done();
								}
							});
						});
					});
				});
			});
		});
	}
};
