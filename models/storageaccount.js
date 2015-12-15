var very = require('verymodel');

module.exports = new very.VeryModel({
	Name: {static: true},
	isDefault: {type: 'boolean'}
});
