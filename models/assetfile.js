var very = require('verymodel');
var common = require('./common');
// http://msdn.microsoft.com/en-us/library/windowsazure/hh974275.aspx

module.exports = new very.VeryModel({
	Id: {static: true},
	Name: {type: common.types.Name, required: true},
	ContentFileSize: {type: very.VeryValidator().isInt()},
	ParentAssetId: {required: true},
	EncryptionVersion: {},
	EncryptionScheme: {},
	IsEncrypted: {type: 'boolean'},
	EncryptionKeyId: {},
	InitializationVector: {},
	IsPrimary: {type: 'boolean'},
	LastModified: {type: 'date', static: true},
	Created: {type: 'date', static: true},
	MimeType: {type: very.VeryValidator().len(4000)},
	ContentChecksum: {type: very.VeryValidator().isHexadecimal()}
});
