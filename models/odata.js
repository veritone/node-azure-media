var very = require('verymodel');
var metadata = require('./odata_metadata');

module.exports = new very.VeryModel({
	__metadata: {model: metadata}
});
