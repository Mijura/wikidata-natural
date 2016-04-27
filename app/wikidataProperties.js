var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
var request = require('sync-request');
var fs = require('fs');

var properties = [];
var MAX_PROPERTY_NUMBER = 3000;

for (var i = 1; i < MAX_PROPERTY_NUMBER; i++) {
  var pId = "P" + i;
  var url = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=" + pId;
  var queryData = JSON.parse(decoder.write(request("GET", url).getBody()));
  if (queryData.entities[pId].missing == '') {
    console.log("After P" + i + ", actual number of properties: ", properties.length);
    continue;
  }
  var property = {};
  property[pId] = {};
  property[pId].label = queryData.entities[pId].labels.en.value;
  property[pId].aliases = [];
  var aliasesWbObjects = queryData.entities[pId].aliases.en;
  // not all properties habe (english) aliases
  if (aliasesWbObjects) {
    for (var j = 0; j < aliasesWbObjects.length; j++) {
      property[pId].aliases.push(aliasesWbObjects[j].value);
    }
  }
  properties.push(property);

  console.log("After P" + i + ", actual number of properties: ", properties.length);
}

fs.writeFile("./../public/propertiesWithSynonyms.json", JSON.stringify(properties), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
