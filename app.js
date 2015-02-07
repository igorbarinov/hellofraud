var express = require('express')
var colors = require('colors')
var app = express()



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

 
 // classifier.addDocument([obj[0][0],obj[0][1],obj[0][2]],obj[0][3])


  if (req.query.ip && req.query.user_agent && req.query.referer)
  {
  	console.log('[OK]'.green + ' all parameters are set for a query. Evaluating.')
  	var classify =  classifier.classify([req.query.ip,req.query.user_agent, req.query.referer])
  	
  	console.log(classify)

  	if (classify == "true") {
  		console.log('[RESULT]'.green+ ' is not bot')
  		res.status(200).send('Not Fraud')
  	}
  	else {
  		console.log('im in else')
  		res.status(403).send('Fraud')
  		console.log('[RESULT]'.green+ ' is bot')
  	} 

  } 

})

app.get('/stats', function (req, res) {
	//TODO show stats for session
})




var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('HelloFraud app listening at http://%s:%s', host, port)

})
