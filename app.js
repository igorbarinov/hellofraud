var express = require('express')
var colors = require('colors')
var app = express()

// TODO init



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
  // DEBUG console 
  // console.log(obj.length)
  
  for (var i=0; i < obj.length/2; ++i){
  	classifier.addDocument([obj[i][0],obj[i][1],obj[i][2]],obj[i][3])
  }
  classifier.train()
  console.log('[OK]'.green + " train complete.")
  /* debug for train complete
  for (var i=0; i< obj.length; ++i){
  	  
  	  console.log(obj[i][3] + ' ' + classifier.classify([obj[i][0],obj[i][1],obj[i][2]]));
  } */




app.get('/', function (req, res) {
 
  console.log('[QUERY]'.green+ ' ' + JSON.stringify(req.query))

  console.log(obj[0][3] + ' ' + classifier.classify([obj[0][0],obj[0][1],obj[0][2]]));
  classifier.addDocument([obj[0][0],obj[0][1],obj[0][2]],obj[0][3])
  res.status(403).send('Fraud')

  if (req.query.ip && req.query.user_agent && req.query.referer)
  {
  	console.log('[OK]'.green + ' all parameters are set for a query. Evaluating.')
  /*	if (evaluate) {
  		res.status(204).send('Not Fraud')
  	}
  	else {
  		res.status(403).send('Fraud')
  	} */

  } 

})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('HelloFraud app listening at http://%s:%s', host, port)

})
