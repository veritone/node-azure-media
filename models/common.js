var very = require('verymodel');

module.exports = {
	types: {
		Name: very.VeryValidator().notRegex(/[!*'();:@&=+$,/?%#[\]"]/)
	}
};
