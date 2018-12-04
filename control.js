var RandomString = require("randomstring");
var _ = require('lodash/core');
// options:
// {
//     caseSensitive: false;
//     data: {
//     };
//    *model: "";
//     redux: "";
//     searchFields: ["",""];
//     searchText: "";
//     data: { };
//     uid: null;
//     match: { };
//     sort: null;// {createdBy: -1}
//     limit: null;// Numeric 
//     skip: null;// Numeric 
//     project: null;// {}
// }
var db = ""
var setDbConnection = function (connection) {
    db = connection;
}

var createSearchQuery = function (reqData) {
    let searchText = reqData.searchText || "";
    let searchFields = reqData.searchFields || false;
    let caseSensitive = reqData.caseSensitive || false;
    if (!searchText || searchText === "" || !searchFields || searchFields.length === 0) {
        return false;
	}
    let searchQueryArray = [];
    let searchTextArray = searchText.split(" ");
    for (let i = 0; i < searchFields.length; i++) {
        for (let j = 0; j < searchTextArray.length; j++) {
            let singleQuery = { [searchFields[i]]: { $regex: searchTextArray[j] } };
            if (caseSensitive) {
                _.extend(singleQuery, { $option: "i" });
            }
            searchQueryArray.push(singleQuery);
        }
    }
    return { $or: searchQueryArray };
};

var getAggregationArray = function (req) {
    let reqData = req;
    let match = reqData.match || {};
    let limit = reqData.limit || 10;
    let skip = reqData.skip || 0;
    let sort = reqData.sort || { createdBy: -1 };
    let project = reqData.project || 0;
    let aggregateArray = [];
    let searchQuery = createSearchQuery(reqData);
    match = _.extend(match, searchQuery);
    aggregateArray.push({ $match: match });
    aggregateArray.push({ $sort: sort });
    if (skip) {
        aggregateArray.push({ $skip: skip });
    }
    if (limit) {
        aggregateArray.push({ $limit: limit });
    }
    if (project) {
        aggregateArray.push({ $project: project });
    }
    return aggregateArray;
}
var validateModel = function (reqData) {
    if (reqData && reqData.model) {
        return true;
    }
    else return false;
}

var getAllItems = function (req, res) {
	let reqData = req.body.options;
	let reqModel = reqData.model;
	if (!validateModel(reqData)) {
		return res.json({ 'success': false, 'message': 'Model Error' });
	};
	let aggregateArray = getAggregationArray(reqData);
	db[reqModel].aggregate(aggregateArray, function (err, data) {
		return res.json(data);
	});
};

var updateAnItem = function (req, res) {
	let reqData = req.body.options;
	let reqModel = reqData.model;
	if (!validateModel(reqData)) {
		return res.json({ 'success': false, 'message': 'Model Error' });
	}
	if (!reqData.data) {
		reqData.data = {};
		return res.json({ 'success': false, 'message': 'Nothing to update' });
	}
	reqData.uid = reqData.uid || reqData.data.uid;
	reqData.data.updatedAt = new Date();
	db[reqModel].update({ uid: reqData.uid }, reqData.data, function (err, data) {
		if (data) {
			return getAllItems(req, res);
		}
		else return res.json({ 'success': false, 'message': 'Some Error' });
	});
};

var addAnItem = function (req, res) {
	let reqData = req.body.options;
	if (!validateModel(reqData)) {
		return res.json({ 'success': false, 'message': 'Model Error' });
	}
	reqData.uid = RandomString.generate();
	reqData.data.uid = reqData.uid;
	var newDate = new Date()
	reqData.data.createdAt = newDate;
	reqData.data.updateAt = newDate;
	let reqModel = reqData.model;
	db[reqModel].insert(reqData.data, function (err, data) {
		if (data) {
			return getAllItems(req, res);
		}
		else return res.json({ 'success': false, 'message': 'Some Error' });
	});
};

var removeAnItem = function (req, res) {
	let uid = req.body.options.uid;
	let reqData = req.body.options;
	if (!validateModel(reqData)) {
		return res.json({ 'success': false, 'message': 'Model Error' });
	}
	let reqModel = reqData.model;
	db[reqModel].remove({ uid: reqData.uid }, function (err, data) {
		if (data) {
			return getAllItems(req, res);
		}
		else return res.json({ 'success': false, 'message': 'Some Error' });
	});
}
module.exports = {
	setDbConnection:setDbConnection,
	getAllItems:getAllItems,
	updateAnItem:updateAnItem,
	addAnItem:addAnItem,
	removeAnItem:removeAnItem	
}
