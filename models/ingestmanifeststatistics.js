var very = require('verymodel');
// http://msdn.microsoft.com/en-us/library/windowsazure/jj853024.aspx

module.exports = new very.VeryModel({
	PendingFilesCount: {type: 'integer'},
	FinishedFilesCount: {type: 'integer'},
	ErrorFilesCount: {type: 'integer'},
	ErrorFilesDetails: {type: 'integer'}
});
