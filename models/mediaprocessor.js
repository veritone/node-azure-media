var very = require('verymodel');
// http://msdn.microsoft.com/en-us/library/windowsazure/jj853024.aspx

module.exports = new very.VeryModel({
	Id: {static: true},
	Name: {static: true},
	Description: {static: true},
	Sku: {static: true},
	Vendor: {static: true},
	Version: {static: true}
});
