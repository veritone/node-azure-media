var async = require('async'),
	moment = require('moment'),
	url = require('url'),
	request = require('request'),
	util = require('util'),
	uuid = require('node-uuid');

function AzureBlob(api) {
	this.api = api;
}

AzureBlob.prototype.generateMetadata = function generateMetadata(assetId, cb) {
	var self = this;

	request({
		method: 'GET',
		uri: self.api.config.baseUrl + '/CreateFileInfos',
		qs: { assetid: '\'' + assetId + '\'' },
		headers: self.api.defaultHeaders(),
		strictSSL: true
	}, function requestCallback(/*err, res*/) {
		cb();
	});
};

AzureBlob.prototype.uploadStream = function uploadStream(filename, stream, length, uploadingCallback, doneCallback) {
	var self = this;

	var options = {};
	if (typeof filename === 'object' && typeof stream === 'function') {
		options = filename;
		filename = options.fileName;
		if (typeof length === 'function') {
			uploadingCallback = stream;
			doneCallback = length;
		} else {
			doneCallback = stream;
		}
		stream = options.stream;
		length = options.length;
	}
	async.waterfall([
		function createAsset(cb) {
			if (options.asset) {
				if (self.config.debug) {
					console.log('uploadStream: using existing asset');
				}
				return cb(options.asset);
			}
			if (self.config.debug) {
				console.log('uploadStream: creating asset ' + filename);
			}
			self.api.rest.asset.create({ Name: filename }, cb);
		},
		function createAccessPolicy(asset, cb) {
			if (self.config.debug) {
				console.log('uploadStream: createAccessPolicy()', asset);
			}
			self.api.rest.accesspolicy.findOrCreate(300, 2, function createAccessPolicyCallback(err, result) {
				cb(err, {
					asset: asset,
					policy: result
				});
			});
		},
		function createLocator(results, cb) {
			if (self.config.debug) {
				console.log('uploadStream: createLocator()', results);
			}
			self.api.rest.locator.create({
				StartTime: moment.utc().subtract(10, 'minutes').format('M/D/YYYY hh:mm:ss A'),
				AccessPolicyId: results.policy.Id,
				AssetId: results.asset.Id,
				Type: 1
			}, function createLocatorCallback(err, locator) {
				results.locator = locator;
				cb(err, results);
			});
		},
		function upload(results, cb) {
			if (self.config.debug) {
				console.log('uploadStream: upload()', results);
			}
			var path = results.locator.Path;
			var parsedpath = url.parse(path);
			parsedpath.pathname += '/' + filename;
			path = url.format(parsedpath);
			//upload the stream
			var r = request.put({
				method: 'PUT',
				url: path,
				headers: {
					//'x-ms-version': moment.utc().subtract('day', 1).format('YYYY-MM-DD'),
					//'x-ms-date': moment.utc().format('YYYY-MM-DD'),
					//Authorization: 'Bearer ' + self.api.oauth.access_token,
					'Content-Type': 'application/octet-stream',
					'x-ms-blob-type': 'BlockBlob',
					'Content-Length': length
				},
				strictSSL: true
			}, function requestCallback(err, res) {
				if (err) {
					return cb(err);
				}

				if (self.config.debug) {
					console.log('uploadStream: upload received status code ' + res.statusCode);
				}

				results.path = path;
				cb(undefined, results);
			});
			stream.pipe(r);
			if (uploadingCallback) {
				uploadingCallback(undefined, path, results);
			}
		}
	], function preCleanup(err, results) {
		async.waterfall([
			function deleteLocator(cb) {
				if (self.config.debug) {
					console.log('uploadStream: deleteLocator()', results);
				}
				self.api.rest.locator.delete(results.locator.Id, cb);
			},
			function genMetadata(results, cb) {
				if (self.config.debug) {
					console.log('uploadStream: generateMetadata()', results);
				}
				self.generateMetadata(results.asset.Id, cb);
			}
		], function postCleanup(err) {
			if (err && self.config.debug) {
				console.error('uploadStream: clean failure: ' + util.inspect(err));
			}

			if (self.config.debug) {
				console.log('uploadStream: done', results);
			}
			if (err) {
				return doneCallback(err);
			}

			doneCallback(undefined, results.path, results);
		});
	});
};

AzureBlob.prototype.downloadStream = function downloadStream(assetId, stream, doneCallback) {
	var self = this;

	async.waterfall([
		function createAccessPolicy(cb) {
			self.api.rest.accesspolicy.findOrCreate(60, 1, function findOrCreateCallback(err, result) {
				cb(err, result);
			});
		},
		function createLocator(policy, cb) {
			self.api.rest.locator.create({
				AccessPolicyId: policy.Id,
				AssetId: assetId,
				StartTime: moment.utc().subtract(5, 'minutes').format('MM/DD/YYYY hh:mm:ss A'),
				Type: 1
			}, cb);
		},
		function listAssetFiles(locator, cb) {
			self.api.rest.assetfile.list(function listAssetFilesCallback(err, results) {
				if (results.length > 0) {
					cb(false, locator, results[0]);
				} else {
					cb('No files associated with asset.');
				}
			}, {
				$filter: 'ParentAssetId eq \'' + assetId +  '\'',
				$orderby: 'Created desc',
				$top: 1
			});
		}
	], function done(err, locator, fileasset) {
		var path = locator.Path;
		var parsedpath = url.parse(path);
		parsedpath.pathname += '/' + fileasset.Name;
		path = url.format(parsedpath);
		request({
			uri: path,
			method: 'GET'
		}, function requestCallback(err/*, res*/) {
			if (typeof doneCallback !== 'undefined') {
				doneCallback(err);
			}
		}).pipe(stream);
	});
};

AzureBlob.prototype.getDownloadURL = function getDownloadURL(assetId, doneCallback) {
	var self = this;

	async.waterfall([
		function createAccessPolicy(cb) {
			self.api.rest.accesspolicy.findOrCreate(60, 1, function createAccessPolicyCallback(err, result) {
				cb(err, result);
			});
		},
		function createLocator(policy, cb) {
			self.api.rest.locator.create({
				AccessPolicyId: policy.Id,
				AssetId: assetId,
				StartTime: moment.utc().subtract(5, 'minutes').format('MM/DD/YYYY hh:mm:ss A'),
				Type: 1
			}, cb);
		},
		function listAssetFiles(locator, cb) {
			self.api.rest.assetfile.list(function listAssetFilesCallback(err, results) {
				if (results.length > 0) {
					cb(false, locator, results[0]);
				} else {
					cb('No files associated with asset.');
				}
			}, {
				$filter: 'ParentAssetId eq \'' + assetId + '\'',
				$orderby: 'Created desc',
				$top: 1
			});
		}
	], function done(err, locator, fileasset) {
		var path = locator.Path;
		var parsedpath = url.parse(path);
		parsedpath.pathname += '/' + fileasset.Name;
		path = url.format(parsedpath);
		doneCallback(err, path);
	});
};

//AzureBlob.prototype.getAssetByName = function () {
//	var self = this;
//
//};
//
//AzureBlob.prototype.getAssetById = function () {
//	var self = this;
//
//};

AzureBlob.prototype.encodeVideo = function encodeVideo(assetId, encoder, callback) {
	var self = this;

	async.waterfall([
		function getMediaEncoderMediaProcessor(cb) {
			self.api.rest.mediaprocessor.getCurrentByName('Windows Azure Media Encoder', cb);
		},
		function getAsset(processor, cb) {
			self.api.rest.asset.get(assetId, function getAssetCallback(err, asset) {
				cb(err, processor, asset);
			});
		},
		function createJob(processor, asset, cb) {
			self.api.rest.job.create({
				Name: 'EncodeVideo-' + uuid(),
				InputMediaAssets: [ { __metadata: { uri: asset.__metadata.uri } } ],
				Tasks: [
					{
						Configuration: encoder,
						MediaProcessorId: processor.Id,
						TaskBody: '<?xml version="1.0" encoding="utf-8"?>' +
							'<taskBody>' +
							'<inputAsset>JobInputAsset(0)</inputAsset>' +
							'<outputAsset>JobOutputAsset(0)</outputAsset>' +
							'</taskBody>'
					}
				]
			}, function createJobCallback(err, job) {
				cb(err, processor, asset, job);
			});
		}
	], function done(err, processor, asset, job) {
		callback(err, job, asset);
	});
};

module.exports = AzureBlob;

