var natural = require('natural')
tkz = new natural.RegexpTokenizer({pattern: /\t/});
//console.log(tokenizer.tokenize("flea\tdog"));


var stringToBool = function(s) {
    return s === 'true';
}

var convert = function(s) {
    if (s === "true") { return "false";}
    else { return "true";}
}

var success_rate = function(inarray, classifier) {
    total = 0, false_positive = 0, false_negative = 0, true_positive = 0;
    true_negative = 0;
    for (var i=0;i<inarray.length;i++) {
        total += 1
        predicted = classifier.classify(inarray[i].slice(0, -1));
        actual = inarray[i].slice(-1)[0]
        if (actual === "true") {
            if (predicted === "true") {
                true_positive += 1;
            } else {
                false_negative += 1;
            }
        } else {
            if (predicted === "true") {
                false_positive += 1;
            } else {
                true_negative += 1;
            }
        }
    }
    output = {
        true_positive: true_positive,
        true_negative: true_negative,
        false_positive: false_positive,
        false_negative: false_negative,
        accuracy: (true_positive + true_negative) / total
    }
    return output
}

var fs = require('fs')
fs = require('fs')
var inputset = [];
var testset = []

fi_wri = function(err, obj) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}

var clsf; 
fs.readFile('classifier2.json', 'utf8', function (err,data) {
    clsf = natural.BayesClassifier.restore(JSON.parse(data));
});
var inds = [0]
fs.readFile('train_data.tsv', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    var thingy = [];
    var fileLines = data.toString().split("\n");
    //console.log(fileLines);
    for (var i=0;i<fileLines.length;i++) {
        if (fileLines[i].length===0) { continue;}
        parsed_line = fileLines[i].split('\t');
        inputset.push(parsed_line);
        //console.log(inputset.length);
        length = parsed_line.length;
        if (i >9000 === 1) {
            clsf.addDocument(
                parsed_line.slice(0, -1),
                parsed_line[length-1]
            );
        } else {
            testset.push(parsed_line)
        }
    }
    clsf.train();
    //fs.writeFile("classifier.json", JSON.stringify(clsf), fi_wri)
    //clsf.save('classifier2.json', fi_wri);
    zog = success_rate(
        testset,
        clsf
    );
    console.log(zog);
    //console.log(clsf);
});

//console.log(clsf.classify(inputset[testline].slice(0, -1)));
