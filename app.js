var express = require('express')
var colors = require('colors')
var app = express()

app.get('/', function (req, res) {
 
  console.log('[QUERY]'.green+ ' ' + JSON.stringify(req.query))

  if (req.query.ip && req.query.user_agent && req.query.referer)
  {
  	console.log('[OK]'.green + ' all parameters are set for a query. Evaluating.')
  	if (evaluate) {
  		res.status(204).send('Not Fraud')
  	}
  	else {
  		res.status(403).send('Fraud')
  	}

  } 
  
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
