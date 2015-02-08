var express = require('express');
var colors = require('colors');

var app = express();


// Remove console log in production mode
if (process.env.NODE_ENV == "production") {    
    console.log = function() {};
}

/* Db setup
 */


var db = "redis";
var client;
if (db === "aerospike") {
    var aerospike = require('aerospike');
    var operator = aerospike.operator;
    var aerostatus = aerospike.status;
    var MAIN_KEY = aerospike.key("test", "stats", "MAIN_KEY");

    client = aerospike.client({
        hosts: [{
            addr: '192.241.207.138',
            port: 4000
        }]
    });
    client.connect(connect_cb)
    client.put(MAIN_KEY, {
        NUM_FRAUD: 0,
        NUM_NON_FRAUD: 0,
        NUM_REQUESTS: 0
    }, aerocallback);

    function connect_cb(err, client) {
        if (err.code == aerostatus.AEROSPIKE_OK) {
            console.log("Aerospike Connection Success")
        } else {
            console.log(err);
        }
    }

    var aerocallback = function(err, rec, meta) {

        // Check for errors 
        if (err.code == aerostatus.AEROSPIKE_OK) {
            // The record was successfully read. 
            console.log(rec, meta);
        } else {
            // An error occurred 
            console.error('error:', err);
        }
    }
} else if (db === "redis") {
    var redis = require('redis');
    client = redis.createClient();
    client.on('connect', function() {
        console.log('connected');
    });
}


function set_key(key_string, val) {
    if (db === "aerospike") {
        client.put(MAIN_KEY, {
            key_string: val
        }, function(err) {
            if (err.code != aerospike.status.AEROSPIKE_OK) {
                console.log("error: %s", err.message);
            }
        });
    } else if (db === "redis") {
        client.set(key_string, val);
    }
}

function incr_key(key_string) {
    if (db === "aerospike") {
        client.operate(
            MAIN_KEY, [operator.incr(key_string, 1)], aerocallback);
    } else if (db === "redis") {
        client.incr(key_string);
    }
}
var output;

function get_key(key_string, callback) {
    if (db === "aerospike") {
        client.select(MAIN_KEY, [key_string], function(err, rec, meta, key) {
            if (err.code == aerostatus.AEROSPIKE_OK) {
                console.log("Found record")
                output = rec[key_string];
            } else {
                console.log(err);
            }
        });
    } else if (db === "redis") {
        client.get(key_string, function(err, reply) {})
    }
}

/* End Db setup */

var NUM_REQUESTS = "NUM_REQUESTS";
var NUM_FRAUD = "NUM_FRAUD";
var NUM_NON_FRAUD = "NUM_NON_FRAUD";
set_key(NUM_REQUESTS, 0);
set_key(NUM_FRAUD, 0);
set_key(NUM_NON_FRAUD, 0);


var color = require('colors')
var natural = require('natural'),
    classifier = new natural.BayesClassifier()
var fs = require('fs')

var tsv = require("node-tsv-json")
tsv({
    input: "train_data.tsv",
    output: "output.json",
    parseRows: true
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {

    }
});

var obj = JSON.parse(fs.readFileSync('output.json', 'utf8'))

for (var i = 0; i < obj.length; ++i) {
    classifier.addDocument([obj[i][0], obj[i][1], obj[i][2]], obj[i][3])
}
classifier.train()
console.log('[OK]'.green + " train complete.")
    /* debug for train complete
    for (var i=0; i< obj.length; ++i){
        
        console.log(obj[i][3] + ' ' + classifier.classify([obj[i][0],obj[i][1],obj[i][2]]));
    } */

app.get('/', function(req, res) {

    console.log('[QUERY]'.green + ' ' + JSON.stringify(req.query));
    incr_key(NUM_REQUESTS);
    ip = req.query.ip || "";
    user_agent = req.query.user_agent || "";
    referer = req.query.referer || "";
    var classify = classifier.classify([ip, user_agent, referer]);

    if (classify == "true") {
        incr_key(NUM_NON_FRAUD);
        console.log('[RESULT]'.green + ' of IP: ' + ip + ' is classified as not bot')
        console.log(classifier.getClassifications([ip, user_agent, referer]))
        res.status(204).send('Not Fraud')
    } else {
        incr_key(NUM_FRAUD);
        res.status(403).send('Fraud')
        console.log('[RESULT]'.green + ' is classified as bot')
    }
})

app.get('/stats', function(req, res) {

    if (db === "redis") {
        ret_obj = {};
        client.get(NUM_FRAUD, function(err, data) {
            ret_obj[NUM_FRAUD] = data
            client.get(NUM_NON_FRAUD, function(err, data) {
                ret_obj[NUM_NON_FRAUD] = data
                client.get(NUM_REQUESTS, function(err, data) {
                    ret_obj[NUM_REQUESTS] = data
                    console.log(ret_obj)
                    res.status(200).send(ret_obj)
                })
            })
        });
    }
})


var server = app.listen(3000, function() {

    var host = server.address().address
    var port = server.address().port

    console.log('HelloFraud app listening at http://%s:%s', host, port)

})
