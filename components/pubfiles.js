var SteamUser = require('../index.js');
var SteamID = require('steamid');

SteamUser.prototype.getPublishedFileDetails = function(ids, language, callback) {
	if (!(ids instanceof Array)) {
		ids = [ids];
	}

	if (typeof language === 'function') {
		callback = language;
		language = SteamUser.ELanguage.English;
	}

	this._sendUnified("PublishedFile.GetDetails#1", {
		"publishedfileids": ids,
		"includetags": true,
		"includeadditionalpreviews": true,
		"includechildren": true,
		"includekvtags": true,
		"includevotes": true,
		"includeforsaledata": true,
		"includemetadata": true,
		"language": language
	}, false, function(body) {
		var results = {};
		var invalidSid = SteamID.fromIndividualAccountID(0).getSteamID64();

		(body.publishedfiledetails || []).forEach(function(item) {
			if (!item.publishedfileid) {
				return;
			}

			for (var i in item) {
				if (item.hasOwnProperty(i) && item[i] && typeof item[i] === 'object' && item[i].constructor.name == 'Long') {
					item[i] = item[i].toString();
				}
			}

			if (typeof item.creator === 'string' && item.creator != invalidSid) {
				item.creator = new SteamID(item.creator);
			} else {
				item.creator = null;
			}

			if (typeof item.banner === 'string' && item.banner != invalidSid) {
				item.banner = new SteamID(item.banner);
			} else {
				item.banner = null;
			}

			if (typeof item.incompatible_actor === 'string' && item.incompatible_actor != invalidSid) {
				item.incompatible_actor = new SteamID(item.incompatible_actor);
			} else {
				item.incompatible_actor = null;
			}

			var tags = {};
			(item.kvtags || []).forEach(function(tag) {
				tags[tag.key] = tag.value;
			});

			item.kvtags = tags;

			results[item.publishedfileid] = item;
		});

		callback(results);
	});
};