// analyze the haikus!

var sentences = require('./sentences.json');

function sumSyllables(arr) {
  return arr.reduce((accumulator, elem) => accumulator + (elem.syllables || 0), 0);
}

function join(arr) {
  return arr.reduce((accumulator, elem) => accumulator + (elem.word || '') + (elem.word ? ' ' : ''), '');
}

var haikus = '';

sentences.forEach((sentence, index) => {
  for(var i = 0; i < sentence.length; i++) {
    var segment = sentence.slice(i);
    
    // sentence is long enough
    // let's see if it hits 5 syllables, 12 syllables, and 17 syllables
    if(sumSyllables(segment) >= 17) {
      
      var syllablesHit = [];
      
      for(var j = 0; j < segment.length; j++) {
        syllablesHit.push(sumSyllables(segment.slice(0, j)));
      }
      
      if(syllablesHit.indexOf(5) >= 0 && syllablesHit.indexOf(12) >= 0 && syllablesHit.indexOf(17) >= 0) {
        // MATCH!!!
        //console.log(segment.slice(0, syllablesHit.indexOf(17)));
        
        var firstLine = join(segment.slice(0, syllablesHit.indexOf(5)));
        var secondLine = join(segment.slice(syllablesHit.indexOf(5), syllablesHit.indexOf(12)));
        var thirdLine = join(segment.slice(syllablesHit.indexOf(12), syllablesHit.indexOf(17)));
        var haiku = [firstLine, secondLine, thirdLine].join('\n') + '\n\n';
        haikus += haiku;
      }
      
      // uncomment following line to disable multiple haikus from same source
      break;
      
    }
  }
});

// split into 5000 character blocks
function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}

haikus = chunkSubstr(haikus, 5000).join('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');

var fs = require('fs');
fs.writeFile("./haikus.txt", haikus, function(err) {
  if(err) return console.log(err);
  console.log("done");
}); 