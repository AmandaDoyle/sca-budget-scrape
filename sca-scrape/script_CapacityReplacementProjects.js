//scrape p122-176 of 02212017_15_19_CapitalPlan.pdf

//dependencies
var extract = require('pdf-text-extract'),
fs = require('fs');

//this is the path to the pdftotext binary, which needs to be installed first for pdf-text-extract to work
//install xpdf somewhere on your workstation from http://www.foolabs.com/xpdf/download.html
//we will pass this path into the call to 'extract()' so that it knows where to find the pdftotext executable
// (delete) var pdftotextPath =  'C:\\Users\\a_doyle\\sites\\repos\\poppler\\pdftotext';

var filePath = 'sca-scrape/downloads/sca_plan.pdf'
var output = fs.createWriteStream('./data_scraping/sca-scrape/output_ReplacementProjects.csv')

var headers = [
  'special_notes', 
  'district', 
  'project_#', 
  'school_name', 
  'borough', 
  'forecast_capacity', 
  'design_start', 
  'constr_start',
  'actual_est_completion', 
  'total_est_cost', 
  'previous_appropriations', 
  'funding_reqd_fy15-19', 
  'needed_to_complete'
]

//write the headers to the output csv first
output.write(headers.join(',') + '\n')

//extract gives an array of stings, each string contains the text of a full page
//we are passing an empty options object AND a path to the pdftotext executable
//so that we don't have to edit PATH in windows (which we don't have rights to do)
extract(filePath, { layout: "layout" }, function (err, pages) {

  //Write page text to text file
  var tempOutput = fs.createWriteStream('./tempoutput.txt');
  
  //we only want 88 thru 88 
    for (var i=87; i<88; i++) {
    var pageText = pages[i];

    // console.log(pageText);

    tempOutput.write(pageText);

    //console.log(pageText)
    //get the table (everything between the header rows and the page number)
    var tableText = pageText.match(/Complete([\s\S\n\r]*?)\*[\s\S]School/)[1];

    // console.log(tableText)

    scrape(tableText);
  }
})


//scrape the table
function scrape(tableText) {

  //split on new lines
  var rows = tableText.split('\n\n');

  var numrows = rows.length
  // console.log(numrows)

  for (var q=0; q<(numrows+1); q++){
    console.log(q)
    if(q<numrows){
      var currow = rows[q]
      if(currow.length > 0) {
        currow = currow.trim() //trim off white space on both ends of row
        currow = currow.split(/\s{2,}/) //split on more than one white space
        currow.forEach( function(item, j ) { //item=content in list, j=index where content is located
            currow[j] = '"' + item.trim() + '"'; //trim off extra white space on both ends of item
          });
        firstThree = currow[0].substring(0,3)
        if ((firstThree.indexOf('*') > -1) || (firstThree.indexOf('L') > -1)){
        currow = currow
        // console.log(currow)
        } else if (currow.length > 1){
        currow.unshift('"NA"')
        // console.log(currow)
        }
        currow.forEach( function(item, k ) { //item=content in list, j=index where content is located
          if(k>5 && k<9){
          currow[k] = item.replace("-", " 20");
          console.log(currow[k])
          }
        })
      }

      if ((q == 2) && (currow.length>1)){
      //only if the row is the first row and contains more than one item
      var prevrow = currow
      // console.log(prevrow)

      } else if ((q > 2) && (currow.length>1)){
      // subsequent rows that contain more than one item
      // console.log(currow.length)
      var csvLine = prevrow.join(',') + '\n'
      // console.log(csvLine)
      output.write(csvLine); //write the row
      prevrow = currow

      } else if (currow.length == 1){
      // rows with only one item
      hanging = currow[0].slice(1,currow[0].length)
      // console.log(hanging)
      // index number is column where you want to insert the hanging line
      prevrow[3] = prevrow[3].slice(0,-1).concat(' ',hanging)
      console.log(prevrow[3])
      // doesn't write the row because prevrow would get written twice
      }
    } else if (q == numrows){
        // final row in rows
        var csvLine = prevrow.join(',') + '\n'
        // console.log(csvLine)
        output.write(csvLine); //write the row
    }
  }
}
