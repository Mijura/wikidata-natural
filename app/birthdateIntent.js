var Client = require('node-rest-client').Client;
var client = new Client();
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var queryBuilder = require('./queryBuilder');
var wikidataIdLookup = require('./wikidataIdLookup');
var async = require('async');

exports.answer = function(question, callback) {
	var parameter = parse(question);
	async.waterfall([
        async.apply(wikidataIdLookup.getWikidataId, parameter),
        doBirtdateQuery,
    ], function (err, result) {
        callback(null, result);
    });
}

function parse(question) {
	var searchText;
	if (question.indexOf('of') > -1 ) {
		searchText = question.substring(question.indexOf('of') + 3, question.length);
	} else if (question.indexOf('born') > -1 ) {
		var start = question.indexOf('is') > -1 ? question.indexOf('is') + 3 : question.indexOf('was') + 4
		searchText = question.substring(start, question.indexOf('born') - 1 );
	}
	searchText = searchText.charAt(0).toUpperCase() + searchText.slice(1);
	var interpretation = 'When was ' + searchText + ' born?';
	return { 
		interpretation: interpretation,
		searchText: searchText
	};
}

function doBirtdateQuery(data, callback) {
    client.get( queryBuilder.dateOfBirth(data.id), function(queryData, response) {
        var jsonResponse = JSON.parse(decoder.write(queryData));
        if (jsonResponse.results.bindings.length == 0) {
            data.speechOutput = "Sorry, I didn't find an answer on Wikidata. Maybe its data is incomplete. " +
                            "You would do me a big favour if you could look it up and add it to Wikidata."
            callback(null, data);
            return;
        }

        var resultDate = jsonResponse.results.bindings[0].date.value;
        resultDate = resultDate.substring(0, resultDate.search('T'));
        data.speechOutput = data.searchText + " was born on " + resultDate;
        callback(null, data);
    }); 
}