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

var success_rate = function(inarray, classifier, feat_inds) {
    total = 0, false_positive = 0, false_negative = 0, true_positive = 0;
    true_negative = 0;
    for (var i=0;i<inarray.length;i++) {
        total += 1;
        featset = [];
        for (var j=0; j<feat_inds.length; j++) {
            featset.push(inarray[i][feat_inds[j]]);
        }
        predicted = classifier.classify(featset);
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

var clsf = new natural.BayesClassifier();
//fs.readFile('classifier2.json', 'utf8', function (err,data) {
//    clsf = natural.BayesClassifier.restore(JSON.parse(data));
//});
var inds = [0, 1, 3];

function to_train_set(ind) {
    return ind < 5000 && ind >= 4000;
}

fs.readFile('btr_train_data.tsv', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    var fileLines = data.toString().split("\n");
    //console.log(fileLines);
    for (var i=0;i<fileLines.length;i++) {
        var featset = [];  // array of features acutally used
        if (fileLines[i].length===0) { continue;}
        parsed_line = fileLines[i].split('\t');
        for (var j=0; j<inds.length; j++) {
            featset.push(parsed_line[inds[j]]);
        }
        length = parsed_line.length;
        //console.log(featset);
        //console.log(parsed_line[length -1]);
        if (to_train_set(i)) {
            clsf.addDocument(
                featset,
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
        clsf,
        inds
    );
    console.log(zog);
});

fs.writeFile("classifier_dump.json", JSON.stringify(clsf), function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 
