//scrape p122-176 of 03312016_15_19_CapitalPlan.pdf

//dependencies
var extract = require('pdf-text-extract'),
fs = require('fs');

//this is the path to the pdftotext binary, which needs to be installed first for pdf-text-extract to work
//install xpdf somewhere on your workstation from http://www.foolabs.com/xpdf/download.html
//we will pass this path into the call to 'extract()' so that it knows where to find the pdftotext executable
var pdftotextPath =  'C:\\Users\\a_doyle\\sites\\repos\\xpdf\\pdftotext';

var filePath = 'data/03312016_15_19_CapitalPlan.pdf'
var output = fs.createWriteStream('./output.csv')

var headers = [
  'district',
  'buildingID',
  'school',
  'boro',
  'programCategory'
]

//write the headers to the output csv first
output.write(headers.join(',') + '\n')

//extract gives an array of stings, each string contains the text of a full page
//we are passing an empty options object AND a path to the pdftotext executable
//so that we don't have to edit PATH in windows (which we don't have rights to do)
extract(filePath, {}, pdftotextPath, function (err, pages) {
  
  //we only want 121 thru 176 
  // for (var i=121; i<177; i++) {
      for (var i=121; i<125; i++) {
    var pageText = pages[i];

    //get the table (everything between the header rows and the page number)
    var tableText = pageText.match(/Program Category([\s\S]*?)C[0-9]{2}/)[1];

    scrape(tableText);
  }
})


//scrape the table
function scrape(tableText) {

  //split on new lines
  var rows = tableText.split('\n');

  //for each row, process and write to output
  rows.forEach( function(row) {
    console.log(row);
    //check if row has no length or starts with a space
    if (row.length > 0 && row.substring(0,1) != ' ') { 

      //split on more than one white space
      var split = row.split(/\s{2,}/);

      //prepend and append double quotes for each column so that they are valid CSV strings
      split.forEach( function(item, j ) {
        split[j] = '"' + item + '"';
      });

      //join together with commas, add a new line character
      var csvLine = split.join(',') + '\n'

      //console.log(csvLine);    
      output.write(csvLine); //write the row
    }
  })
}