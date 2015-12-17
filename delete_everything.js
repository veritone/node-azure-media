var AzureMedia = require('./index');
var optimist = require('optimist');
optimist.demand(['config']);
var config = require(optimist.argv.config);

var api = new AzureMedia(config.auth);
api.init(function initCallback() {
	api.rest.asset.create({Name: 'testtodelete'}, function createAssetCallback(/*err, asset*/) {
		api.rest.accesspolicy.list(function listAssetPolicyCallback(err, policies) {
			policies.forEach(function forEachPolicy(policy) {
				console.log(policy.Id);
				api.rest.accesspolicy.delete(policy.Id);
			});
			api.rest.asset.list(function listAssetCallback(err, assets) {
				assets.forEach(function forEachAsset(asset) {
					console.log(asset.Id);
					asset.delete();
				});
				api.rest.assetfile.list(function listAssetFileCallback(err, files) {
					files.forEach(function forEachAssetFile(file) {
						console.log(file.Id);
						api.rest.assetfile.delete(file.Id);
					});
				});
			});
		});
	});
});
