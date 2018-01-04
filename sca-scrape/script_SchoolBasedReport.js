//scrape p200 to the end for School Based Reports of 11162017_15_19_CapitalPlan.pdf

//dependencies
var extract = require('pdf-text-extract'),
fs = require('fs');

//this is the path to the pdftotext binary, which needs to be installed first for pdf-text-extract to work
//install xpdf somewhere on your workstation from http://www.foolabs.com/xpdf/download.html
//we will pass this path into the call to 'extract()' so that it knows where to find the pdftotext executable
// (delete) var pdftotextPath =  'C:\\Users\\a_doyle\\sites\\repos\\poppler\\pdftotext';


var filePath = 'sca-scrape/downloads/sca_plan.pdf'
var output = fs.createWriteStream('./data_scraping/sca-scrape/detailed_output_SchoolBasedReport.csv')

var headers = [
  'district', 
  'borough', 
  'building_id',
  'school_name', 
  'org_id',
  'project_#', 
  'description',
  'fy_constr_start', 
  'total'
]

//write the headers to the output csv first
output.write(headers.join(',') + '\n')

//extract gives an array of stings, each string contains the text of a full page
//we are passing an empty options object AND a path to the pdftotext executable
//so that we don't have to edit PATH in windows (which we don't have rights to do)
extract(filePath, { layout: "layout" }, function (err, pages) {

//Write page text to text file
  var tempOutput = fs.createWriteStream('./tempoutput.txt');
  var row;
  // we want pages 200 to the end
    for (var i=199; i<981; i++) {
      var pageText = pages[i];
      var lines = pageText.split('\n')
      var schoolLine;
      lines.forEach((line) => {
        const lineNoComma = line.replace(/\,/g,"");
        const trimmedLine = lineNoComma.trim();
      if (trimmedLine.match(/^[0-9]{2}/)) {
          // console.log('found a school line!', trimmedLine)
          schoolLine = parseSchoolLine(trimmedLine);
        }
      if (trimmedLine.match(/[A-Z]{3}[0-9]{10}/)) {
          // console.log('found a project line!', trimmedLine)
          parseProjectLine(trimmedLine);
          row = (schoolLine.concat(parseProjectLine(trimmedLine)));
          var csvLine;

          if (row.length === 8) { row.splice(4, 0, "") }
          if (row.length !== 9) { return; }

          csvLine = row.join(',') + '\n'
          // console.log(csvLine)
          output.write(csvLine);

        }
      });
    }
})

function parseSchoolLine(trimmedLine) {
            const schoolLine = trimmedLine.split(/\s\s+/g);
            //console.log('SCHOOL!', schoolLine);
            return schoolLine;
          }

function parseProjectLine(trimmedLine) {
            const projectLine = trimmedLine.split(/\s\s+/g)
            // console.log('parsing!', projectLine)
            return projectLine;
          } 