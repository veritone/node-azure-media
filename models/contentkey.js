var very = require('verymodel');

module.exports = new very.VeryModel({
	Id: {static: true},
	Created: {type: 'date', static: true},
	LastModified: {type: 'date', static: true},
	ContentKeyType: {type: very.VeryValidator().isInt().isIn([0, 1, 2])},
	EncryptedContentKey: {type: very.VeryValidator().len(0, 4000)},
	Name: {type: very.VeryValidator().len(0, 4000)},
	ProtectionKeyId: {type: very.VeryValidator().len(0, 4000)},
	ProtectionKeyType: {},
	Checksum: {type: very.VeryValidator().len(0, 4000)}
});
