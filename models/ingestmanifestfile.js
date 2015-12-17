var very = require('verymodel');
// http://msdn.microsoft.com/en-us/library/windowsazure/jj853024.aspx

module.exports = new very.VeryModel({
	Id: {static: true},
	Created: {type: 'date', static: true},
	LastModified: {type: 'date', static: true},
	Name: {},
	State: {static: true, type: very.VeryValidator().isInt().isIn([0, 1, 2])},
	ParentIngestManifestId: {required: true},
	ParentIngestManifestAssetId: {required: true},
	ErrorDetail: {static: true},
	MimeType: {},
	IsPrimary: {type: 'boolean'},
	EncryptionVersion: {},
	EncryptionSchema: {type: very.VeryValidator().isIn(['StorageEncryption', 'CommonEncryption'])},
	IsEncrypted: {type: 'boolean'},
	EncryptionKeyId: {},
	InitializationVector: {}
});
