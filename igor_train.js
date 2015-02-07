
var color = require('colors')
var natural = require('natural'),
  classifier = new natural.BayesClassifier()
var fs = require('fs')
// convert tsv to json

var tsv = require("node-tsv-json")
  tsv({
    input: "train_data.tsv", 
    output: "output.json"
    ,parseRows: true
  }, function(err, result) {
    if(err) {
      console.error(err);
    }else {
      //console.log('[OK]'.green + ' TVS to JSON complete');

    }
  });

  var obj =  JSON.parse(fs.readFileSync('output.json', 'utf8'))
  console.log(obj.length)
  for (var i=0; i < obj.length/2; ++i){
  	classifier.addDocument([obj[i][0],obj[i][1],obj[i][2]],obj[i][3])
  }
  classifier.train()
  console.log('[OK]'.green + " train complete.")
  for (var i=0; i< obj.length; ++i){
  	  console.log(obj[i][3] + ' ' + classifier.classify([obj[i][0],obj[i][1],obj[i][2]]));
  }








