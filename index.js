var models = require('./models'),
	endpoints = require('./endpoints'),
	request = require('request'),
	AzureMedia = require('./media');

var resourceMap = {
	accesspolicy: 'AccessPolicies',
	assetfile: 'Files',
	asset: 'Assets',
	contentkey: 'ContentKeys',
	ingestmanifest: 'IngestManifests',
	ingestmanifestasset: 'IngestManifestAssets',
	ingestmanifestfile: 'IngestManifestFiles',
	job: 'Jobs',
	jobtemplate: 'JobTemplates',
	locator: 'Locators',
	mediaprocessor: 'MediaProcessors',
	notificationendpoint: 'NotificationEndpoints',
	task: 'Tasks',
	tasktemplate: 'TaskTemplates'
};

function AzureAPI(config) {
	var self = this;

	self.config = config || {};

	self.config.baseUrl = self.config.baseUrl || 'https://media.windows.net/API/';
	if (self.config.baseUrl[self.config.baseUrl.length] !== '/') {
		self.config.baseUrl += '/';
	}

	self.config.oauthUrl = (self.config.oauthUrl || 'https://wamsprodglobal001acs.accesscontrol.windows.net/');
	if (self.config.oauthUrl[self.config.oauthUrl.length] !== '/') {
		self.config.oauthUrl += '/';
	}
	self.config.oauthUrl += 'v2/OAuth2-13';

	self.config.scope = self.config.scope || 'urn:WindowsAzureMediaServices';

	self.authToken = self.config.authToken || '';

	self.rest = {};

	self.media = new AzureMedia(this);
}

AzureAPI.prototype.init = function init(cb) {
	var self = this;

	Object.keys(endpoints).forEach(function forEachEndpoint(endpoint) {
		self.rest[endpoint] = {};
		Object.keys(endpoints[endpoint]).forEach(function forEachKey(call) {
			self.rest[endpoint][call] = function executeEndpoint() {
				endpoints[endpoint][call].apply(self, arguments);
			};
		});
	});

	Object.keys(models).forEach(function forEachModel(model) {
		if (model !== 'common') {
			models[model].addModelVar('api', self);
		}
	});

	self.getAuthToken(function getAuthTokenCallback(err, result) {
		if (err) {
			return cb(err);
		}

		//get the first redirect
		request.get({
			uri: self.modelURI('asset'),
			headers: self.defaultHeaders(),
			followRedirect: false,
			strictSSL: true
		}, function requestCallback(err, res) {
			if (err) {
				return cb(err);
			}

			if (res.statusCode === 301) {
				self.config.baseUrl = res.headers.location;
				console.log('changing base url to',  self.config.baseUrl);
			}

			cb(err, result);
		});
	});
};

AzureAPI.prototype.defaultHeaders = function defaultHeaders(/*opts*/) {
	var self = this;

	var headers = {
		Accept: 'application/json;odata=verbose',
		DataServiceVersion: '3.0',
		MaxDataServiceVersion: '3.0',
		'x-ms-version': '2.2',
		'Content-Type': 'application/json;odata=verbose'
	};
	if (self.oauth) {
		headers.Authorization = 'Bearer ' + self.oauth.access_token;
	}
	return headers;
};

AzureAPI.prototype.modelURI = function modelURI(modelName, id, filters) {
	var self = this;

	var filter;
	var fidx;
	var url = self.config.baseUrl + resourceMap[modelName];
	var filterurl = [];
	if (id) {
		url = url + '(\'' + id + '\')';
	}
	if (filters) {
		for (fidx in filters) {
			filter = filters[fidx];
			filterurl.push('$filter=' + filter.op + '(\'' + filter.source + ', ' + filter.compare + '\')');
		}
	}
	return url;
};

AzureAPI.prototype.getAuthToken = function getAuthToken(cb) {
	var self = this;

	//cb = cb || function () {};

	var r = {
		uri: self.config.oauthUrl,
		form: {
			grant_type: 'client_credentials', // eslint-disable-line camelcase
			client_id: self.config.client_id, // eslint-disable-line camelcase
			client_secret: self.config.client_secret, // eslint-disable-line camelcase
			scope: self.config.scope
		},
		json: true,
		strictSSL: true
	};
	if (self.config.debug) {
		console.log('getAuthToken:request = ', r);
	}
	request.post(r, function requestCallback(err, res, body) {
		if (err) {
			return cb(err);
		}

		if (self.config.debug) {
			console.log('getAuthToken:request.statusCode =', res.statusCode);
			console.log('getAuthToken:request.body =', body);
		}

		if (body.error) {
			return cb(body);
		}

		self.oauth = body;
		self.oauth.timeStarted = Date.now();
		cb(undefined, body.access_token);
	});
};

AzureAPI.prototype.getRequest = function getRequest(model, id, cb) {
	var self = this;

	//cb = cb || function () {};

	request.get({
		uri: self.modelURI(model, id),
		headers: self.defaultHeaders(),
		followRedirect: false,
		strictSSL: true
	}, function requestCallback(err, res) {
		if (err) {
			return cb(err);
		}

		if (res.statusCode === 200) {
			var data = JSON.parse(res.body).d;
			var dobj = models[model].create(data);
			cb(err, dobj);
		} else {
			cb(err || 'Expected 200 status, received: ' + res.statusCode + ' ' + res.body);
		}
	});
};

AzureAPI.prototype.listRequest = function listRequest(model, cb, query) {
	var self = this;

	//cb = cb || function () {};

	request.get({
		uri: self.modelURI(model),
		headers: self.defaultHeaders(),
		followRedirect: false,
		strictSSL: true,
		qs: query
	}, function requestCallback(err, res) {
		if (err) {
			return cb(err);
		}

		var objs = [];
		if (res.statusCode === 200) {
			var data = JSON.parse(res.body).d.results;
			data.forEach(function forEachItem(rawd) {
				var dobj = models[model].create(rawd);
				objs.push(dobj);
			});
			cb(err, objs);
		} else {
			cb(err || 'Expected 200 status, received: ' + res.statusCode + '\n' + res.body);
		}
	});
};

AzureAPI.prototype.createRequest = function createRequest(model, data, cb) {
	var self = this;

	//cb = cb || function () {};

	var pl = models[model].create(data);
	var validationErrors = pl.doValidate();
	if (validationErrors.length) {
		return cb(validationErrors);
	}

	request.post({
		uri: self.modelURI(model),
		headers: self.defaultHeaders(),
		body: JSON.stringify(data),
		followRedirect: false,
		strictSSL: true
	}, function requestCallback(err, res) {
		if (err) {
			return cb(err);
		}

		if (res.statusCode === 201) {
			var data = JSON.parse(res.body).d;
			var dobj = models[model].create(data);
			cb(err, dobj);
		} else {
			cb(err || 'Create ' + model + ': Expected 201 status, received: ' + res.statusCode + '\n' + res.body);
		}
	});
};

AzureAPI.prototype.deleteRequest = function deleteRequest(model, id, cb) {
	var self = this;

	//cb = cb || function () {};

	request({
		method: 'DELETE',
		uri: self.modelURI(model, id),
		headers: self.defaultHeaders(),
		followRedirect: false,
		strictSSL: true
	}, function requestCallback(err, res) {
		if (err) {
			return cb(err);
		}

		if (res.statusCode === 204) {
			cb(err);
		} else {
			cb(err || 'Expected 204 status, received: ' + res.statusCode);
		}
	});
};

AzureAPI.prototype.updateRequest = function updateRequest(model, id, data, cb) {
	var self = this;

	//cb = cb || function () {};

	var pl = models[model].create(data);
	var validationErrors = pl.doValidate();
	if (validationErrors.length) {
		return cb(validationErrors);
	}

	request({
		method: 'MERGE',
		uri: self.modelURI(model, id),
		headers: self.defaultHeaders(),
		followRedirect: false,
		strictSSL: true,
		body: JSON.stringify(data)
	}, function requestCallback(err, res) {
		if (err) {
			return cb(err);
		}

		if (res.statusCode === 200) {
			var data = JSON.parse(res.body).d;
			var dobj = models[model].create(data);
			cb(err, dobj);
		} else {
			cb(err || 'Expected 200 status, received: ' + res.statusCode);
		}

	});
};


module.exports = AzureAPI;
