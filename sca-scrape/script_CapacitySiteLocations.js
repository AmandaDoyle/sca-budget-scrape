//scrape p122-176 of 02212017_15_19_CapitalPlan.pdf

//dependencies
var extract = require('pdf-text-extract'),
fs = require('fs');

//this is the path to the pdftotext binary, which needs to be installed first for pdf-text-extract to work
//install xpdf somewhere on your workstation from http://www.foolabs.com/xpdf/download.html
//we will pass this path into the call to 'extract()' so that it knows where to find the pdftotext executable
// (delete) var pdftotextPath =  'C:\\Users\\a_doyle\\sites\\repos\\poppler\\pdftotext';

var filePath = 'sca-scrape/downloads/sca_plan.pdf'
var output = fs.createWriteStream('./data_scraping/sca-scrape/output_CapacitySiteLocations.csv')

var headers = [ 
  'district', 
  'school_name', 
  'borough', 
  'location'
]

//write the headers to the output csv first
output.write(headers.join(',') + '\n')

//extract gives an array of stings, each string contains the text of a full page
//we are passing an empty options object AND a path to the pdftotext executable
//so that we don't have to edit PATH in windows (which we don't have rights to do)
extract(filePath, { layout: "layout" }, function (err, pages) {

  //Write page text to text file
  var tempOutput = fs.createWriteStream('./tempoutput.txt');
  
  //we only want 76 thru 78 
    for (var i=75; i<78; i++) {
    var pageText = pages[i];

    // console.log(pageText);

    tempOutput.write(pageText);

    //console.log(pageText)
    //get the table (everything between the header rows and the page number)
    var tableText = pageText.match(/LOCATION([\s\S\n\r]*?)C[0-9]{2}/)[1];

    console.log(tableText)

    scrape(tableText);
  }
})


//scrape the table
function scrape(tableText) {


  //split on new lines
  //god damn it.  newlines on Windows are \r\n, but they are \n on linux/mac  FML
  var rows = tableText.split('\n');
  console.log(rows);

  //for each row, process and write to output
  rows.forEach( function(row) {
    // console.log(row);
    row = row.trim() //trim off white space on both ends of row

    //make sure row is not empty
    if (row.length > 0){
    
      //split on more than one white space
      var split = row.split(/\s{2,}/);
      // console.log(split)

      //prepend and append double quotes for each column so that they are valid CSV strings
      split.forEach( function(item, j ) { //item=content in list, j=index where content is located
        split[j] = '"' + item.trim() + '"'; //also trim off extra white space on both ends of item
      });

      //join together with commas, add a new line character
      var csvLine = split.join(',') + '\n';
      // console.log(csvLine);

      output.write(csvLine); //write the row
    }
  })
}

////////////////////////////////////////////////////////////////////////////////////////////////
// There are hanging lines in this table which I manually fixed in excel. 
// To script that edit, the code below needs to be modified to catch a hanging line which 
// belongs to the subsequent line instead of the previous line
////////////////////////////////////////////////////////////////////////////////////////////////

// //scrape the table
// function scrape(tableText) {

//   //split on new lines
//   var rows = tableText.split('\r\n');

//   var numrows = rows.length
//   // console.log(numrows)

//   for (var q=0; q<(numrows+1); q++){
//     // console.log(currow)
//     console.log(q)
//     if(q<numrows){
//       var currow = rows[q]
//       if(currow.length > 1) {
//         currow = currow.trim() //trim off white space on both ends of row
//         currow = currow.split(/\s{2,}/) //split on more than one white space
//         currow.forEach( function(item, j ) { //item=content in list, j=index where content is located
//             currow[j] = '"' + item.trim() + '"'; //trim off extra white space on both ends of item
//           });
//         // console.log(currow)
      
//       if ((q == 1) && (currow.length>1)){
//       //only if the row is the first row and contains more than one item
//       var prevrow = currow
//       // console.log(prevrow)

//       } else if ((q > 1) && (currow.length>1)){
//       // subsequent rows that contain more than one item
//       // console.log(currow.length)
//       var csvLine = prevrow.join(',') + '\n'
//       // console.log(csvLine)
//       output.write(csvLine); //write the row
//       prevrow = currow

//       } else {
//       // rows with only one item
//       // index number is column where you want to insert the hanging line
//       prevrow[2] = prevrow[2].concat(currow)
//       // console.log(prevrow[2])
//       // doesn't write the row because prevrow would get written twice
//         }
//       }
//     } else if (q == numrows){
//         // final row in rows
//         var csvLine = prevrow.join(',') + '\n'
//         // console.log(csvLine)
//         output.write(csvLine); //write the row
//     }
//   }
// }
