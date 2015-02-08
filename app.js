var express = require('express')
var colors = require('colors')
var app = express()

var aerospike = require('aerospike');
var operator = aerospike.operator;
var inc_op = operator.incr('val', 1);
var aerostatus = aerospike.status;
var client = aerospike.client({
    hosts: [{addr: '192.241.207.138', port: 4000}]
});

function connect_cb( err, client) {
    if (err.code == aerostatus.AEROSPIKE_OK) {
        console.log("Aerospike Connection Success")
    } else {
        console.log(err);
    }
}

var aerocallback = function(err, rec, meta) {
    
    // Check for errors 
    if ( err.code == aerostatus.AEROSPIKE_OK ) {
        // The record was successfully read. 
        console.log(rec, meta);
    }
    else {
        // An error occurred 
        console.error('error:', err);
    }
}

client.connect(connect_cb)
//var NUM_REQUESTS = aerospike.key("test", "stats", "NUM_REQUESTS");
//var NUM_FRAUD = aerospike.key("test", "stats", "NUM_FRAUD");
//var NUM_NON_FRAUD = aerospike.key("test", "stats", "NUM_NON_FRAUD");
//client.put(NUM_REQUESTS, {val: 0}, aerocallback);
//client.put(NUM_FRAUD, {val: 0}, aerocallback);
//client.put(NUM_NON_FRAUD, {val: 0}, aerocallback);
var NUM_REQUESTS = "NUM_REQUESTS";
var NUM_FRAUD = "NUM_FRAUD";
var NUM_NON_FRAUD = "NUM_NON_FRAUD";
ALL_BINS = [NUM_REQUESTS, NUM_NON_FRAUD, NUM_FRAUD];
var MAIN_KEY = aerospike.key("test", "stats", "MAIN_KEY");
client.put(MAIN_KEY, {
    NUM_FRAUD: 0, NUM_NON_FRAUD: 0, NUM_REQUESTS: 0
}, aerocallback);


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

 for (var i=0; i < obj.length; ++i){
   classifier.addDocument([obj[i][0],obj[i][1],obj[i][2]],obj[i][3])
 }
 classifier.train()
 console.log('[OK]'.green + " train complete.")
 /* debug for train complete
 for (var i=0; i< obj.length; ++i){
     
     console.log(obj[i][3] + ' ' + classifier.classify([obj[i][0],obj[i][1],obj[i][2]]));
 } */

app.get('/', function (req, res) {
 
  console.log('[QUERY]'.green+ ' ' + JSON.stringify(req.query));
  client.operate(MAIN_KEY, [operator.incr(NUM_REQUESTS, 1)], aerocallback);
  if (req.query.ip && req.query.user_agent && req.query.referer)
  {
    console.log('[OK]'.green + ' all parameters are set for a query. Evaluating.')
    var classify =  classifier.classify([req.query.ip,req.query.user_agent, req.query.referer])
    
    //console.log(classify)

    if (classify == "true") {
      client.operate(MAIN_KEY, [operator.incr(NUM_NON_FRAUD, 1)], aerocallback);
      console.log('[RESULT]'.green+ ' of IP: ' + req.query.ip +  ' is not bot')
      console.log(classifier.getClassifications([req.query.ip,req.query.user_agent, req.query.referer]))
      res.status(204).send('Not Fraud')
    }
    else {
      client.operate(MAIN_KEY, [operator.incr(NUM_FRAUD, 1)], aerocallback);
      res.status(403).send('Fraud')
      console.log('[RESULT]'.green+ ' is bot')
    }

  }
  else {
    res.status(200).send('Please specify params')
  }

})

app.get('/stats', function (req, res) {
  client.select(MAIN_KEY, ALL_BINS, function(err, rec, meta, key){
    if (err.code == aerostatus.AEROSPIKE_OK) {
        console.log("Found record")
        res.status(200).send(rec);
    } else {
        console.log(err);
    }
  });
})


var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('HelloFraud app listening at http://%s:%s', host, port)

})
