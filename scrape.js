// scrape

const request = require('request');

var pageIds = [];
var getRequests = 5;  // gets 50 pages

// get 100 random wikipedia articles
for(var i = 0; i < getRequests; i++) {
  request('https://en.wikipedia.org/w/api.php?format=json&action=query&list=random&rnlimit=10', { json: true }, (err, res, body) => {
    if(err) return console.log(err);

    for(var randomPage of body.query.random) {
      pageIds.push(randomPage.id);;
    }
    
    callBack();
  });  
}

var finished = 0;
function callBack() {
  if(++finished == getRequests) {
    console.log('finished getting wikipedia data');
    afterWards();
  }
}


function afterWards() {
  
  // get content, break up into sentences
  var sentences = [];
  request('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&pageids=' + pageIds.join('|'), { json: true }, (err, res, body) => {
    for(var pageId of Object.keys(body.query.pages)) {
      var page = body.query.pages[pageId];
      if(page.extract) {
        sentences = sentences.concat(page.extract.split('.'));
      }
    }
    
    // remove extraneous characters
    var numWords = 0;
    for(var i = 0; i < sentences.length; i++) {
      sentences[i] = sentences[i].replace(/\n|\\/g, '').trim().split(' ');
      numWords += sentences[i].length;
      for(var j = 0; j < sentences[i].length; j++) {
        if(/[^0-9a-zA-Z\'\-]/.test(sentences[i][j])) sentences[i][j] = '';
        
        console.log('word ' + (numWords-sentences[i].length+j) + ' being requested: ' + sentences[i][j]);
        
        (function(i, j) {
          request('https://api.datamuse.com/words?md=s&max=1&sp=' + sentences[i][j], { json: true }, (err, res, body) => {
            console.log('finished getting word ' + sentences[i][j]);
            
            if(body === undefined || body.length === 0 || body[0].numSyllables === undefined) {
              sentences[i][j] = {};
            } else {
              sentences[i][j] = { word: sentences[i][j], syllables: body[0].numSyllables };
            }
            
            //wordsCallBack();
          });
        })(i, j);
      }
    }
    
    // trim sentences and write to file
    /*var wordsFinished = 0;
    function wordsCallBack() {
      console.log(wordsFinished + ' of ' + numWords + ' finished');
      if(++wordsFinished == numWords) {
        wordsAfterWards();
      }
    }*/
    setTimeout(function() {
      wordsAfterWards();
    }, 10000);
    function wordsAfterWards() {
      // remove punctuation and fix undone words
      sentences.forEach((sentence, sentenceIndex) => {
        sentence.forEach((word, wordIndex) => {
          if(typeof word === 'string') {
            console.log(word);
            sentences[sentenceIndex][wordIndex] = {};
            return;
          }
          
          sentences[sentenceIndex][wordIndex] = Object.keys(word).length == 0 ? {} : {word: word.word.replace(/[^a-zA-Z\-\']/g, ''), syllables: word.syllables};
        })
      });
      
      // concat to already scraped sentences
      var oldSentences = require('./sentences.json');
      sentences = sentences.concat(oldSentences);
      
      var fs = require('fs');
      fs.writeFile("./sentences.json", JSON.stringify(sentences), function(err) {
        if(err) return console.log(err);
        console.log("done");
        process.exit();
      }); 
    }
  });
}