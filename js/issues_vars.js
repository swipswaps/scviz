var justices;
$("#get-name").val("JGRoberts");
$("#get-name2").val("AScalia");

/*
$('.dropdown-toggle').dropdown();
$('#dropdownList li').on('click', function() {
    $('#dropdownMenu1').html($(this).html());
    });
*/

var justice_names = 
['JGRoberts', 'AFortas'];
/*['AFortas', 'AJGoldberg', 'AMKennedy', 'AScalia', 'BRWhite', 'CEWhittaker', 'CThomas', 'DHSouter', 'EKagan', 'EWarren', 'FFrankfurter', 'FMurphy', 'FMVinson', 'HABlackmun', 'HHBurton', 'HLBlack', 'JGRoberts', 'JHarlan2', 'JPStevens', 'LFPowell', 'PStewart', 'RBGinsburg', 'RHJackson', 'SAAlito', 'SDOConnor', 'SFReed', 'SGBreyer', 'SMinton', 'SSotomayor', 'TCClark', 'TMarshall', 'WBRutledge', 'WEBurger', 'WHRehnquist', 'WJBrennan', 'WODouglas'];
 */

var issueKeys = {
"Criminal Procedure":1,
"Civil Rights":2,
"First Amendment":3,
"Due Process":4,
"Privacy":5,
"Attorneys":6,
"Unions":7,
"Economic Activity":8,
"Judicial Power":9,
"Federalism":10,
"Interstate Relations":11,
"Federal Taxation":12,
"Miscellaneous":13,
"Private Action":14,
1:"Criminal Procedure",
2:"Civil Rights",
3:"First Amendment",
4:"Due Process",
5:"Privacy",
6:"Attorneys",
7:"Unions",
8:"Economic Activity",
9:"Judicial Power",
10:"Federalism",
11:"Interstate Relations",
12:"Federal Taxation",
13:"Miscellaneous",
14:"Private Action"}

var data = [];
var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatHoverText = function (d, name) {
      return name +" Voted in the Majority " + d.vote + " times out of " +
        d.totalvotes + " cases";
    };