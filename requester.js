var http = require('http');
var fs = require('fs');

function query_string(ip, user_agent, referer) {
    return "?ip=" + ip + "&user_agent=" + user_agent + "&referer=" + referer;
}


var responder = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      console.log(str);
    });
}


function file_to_requests(host, filename) {
/* Given a tsv file in `filename`, hit the `host` with a request with the
 * corresonding keys of the query string set on the assumption that the 
 * first three tab-delimited fields of the file are ip address, user
 * agent, and referrer (further fields on a line are ignored)
 */
    // first, read in files to query strings, them make requests with
    // those query strings
    query_strings = []
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var fileLines = data.toString().split("\n");
        //console.log(fileLines);
        for (var i=0; i<fileLines.length; i++) {
            if (fileLines[i].length===0) { continue;}
            // parse the line
            pl = fileLines[i].split('\t');
            query_strings.push(
                query_string(pl[0], pl[1], pl[2])
            );
        };
        var start = new Date().getTime();
        for (var i=0; i<query_strings.length; i++) {
            options = {
                host: host,
                port: 3000,
                path: "/" + query_strings[i]
            };
            http.request(options, responder).end();
        }
        var theend = new Date().getTime();
        console.log(query_strings.length.toString() + "requests took " + (theend - start) + "milliseconds");
    });
}

file_to_requests("localhost", "../min_data.tsv")
