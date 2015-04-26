/* TODO
 * change to percentages
 * try to get the dropdown menu on the autofill to be there
 * Error check for bad input from user
 * write a little blurb about what this does at the top
 * transition lines?
 * check how much faster it is to use the parsed files by judge
 * extra:
 * add ability to look at multiple issues
 * add ability to look at it by court (roberts court, Rehnquist court)
    * either shows the people in the reign of the court
        or each court is one line
*/
var listjustices=['AFortas', 'AJGoldberg', 'AMKennedy', 'AScalia', 'BRWhite', 'CEWhittaker', 'CThomas', 'DHSouter', 'EKagan', 'EWarren', 'FFrankfurter', 'FMurphy', 'FMVinson', 'HABlackmun', 'HHBurton', 'HLBlack', 'JGRoberts', 'JHarlan2', 'JPStevens', 'LFPowell', 'PStewart', 'RBGinsburg', 'RHJackson', 'SAAlito', 'SDOConnor', 'SFReed', 'SGBreyer', 'SMinton', 'SSotomayor', 'TCClark', 'TMarshall', 'WBRutledge', 'WEBurger', 'WHRehnquist', 'WJBrennan', 'WODouglas'];

function init() {
  var listissues=["Criminal Procedure", "Civil Rights", "First Amendment", "Due Process", "Privacy", "Attorneys", "Unions", "Economic Activity", "Judicial Power", "Federalism", "Interstate Relations", "Federal Taxation", "Miscellaneous", "Private Action"]
  for (var i in listjustices) {
    $('#combobox').append('<option value="'+listjustices[i]+'">'+listjustices[i]+'</option>');
    $('#get-name').append('<option value="'+listjustices[i]+'">'+listjustices[i]+'</option>');
    $('#get-name2').append('<option value="'+listjustices[i]+'">'+listjustices[i]+'</option>');
  }
  for (var i in listissues) {
    $('#get-issue').append('<option value="'+listissues[i]+'">'+listissues[i]+'</option>');
  }
}
loadauto("combobox");
loadauto("get-name");
loadauto("get-name2");
loadauto("get-issue");

var justices;
/* 
 *from old issue drop down
$('.dropdown-toggle').dropdown();
$('#dropdownList li').on('click', function() {
    $('#dropdownMenu1').html($(this).html());
});
*/

var justice_names = 
['JGRoberts', 'AFortas'];


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
  14:"Private Action"
}

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

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .defined(function(d){return d.percent != null})
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.percent); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", function(error, csv_data) {
  justices = [];
  for (var i = 0; i < justice_names.length; i++) {
    justices[i] = new Object();
    justices[i].name = justice_names[i];
    justices[i].values = [];
  }
  csv_data.forEach(function(d) {
    if (d.justiceName !== justices[0].name && d.justiceName !== justices[1].name) return 1;
    d.date = parseDate(d.term);
    d.vote = +d.vote;
    var data = d.justiceName == justices[0].name ? justices[0].values : justices[1].values;
    if (data.length == 0 || data[data.length-1].date.getTime() != d.date.getTime()) {
      var sccase = new Object();
      sccase.date = d.date, sccase.vote = 0, sccase.totalvotes = 1, sccase.split = 0, sccase.splittotals = 0;
      if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
        sccase.vote += 1;
      if (d.majVotes == 5 && d.minVotes == 4) {
        if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
          sccase.split += 1;
        sccase.splittotals += 1;
      }
      data[data.length] = sccase;
    }
    else {
      var sccase = data[data.length-1];
      sccase.totalvotes += 1;
      if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
        sccase.vote += 1;
      if (d.majVotes == 5 && d.minVotes == 4) {
        if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
          sccase.split += 1;
        sccase.splittotals += 1;
      }
    }
  });
  justices.map(function (j){j.values.map(function (d){
    d.percent=100*d.vote/d.totalvotes;
    d.splitpercent = 100*d.split/d.splittotals;
  })});

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  color.domain(justices);
  x.domain([
    d3.min(justices, function(c) { return d3.min(c.values, function(v) { if (v != null)return v.date; else return 9999 }); }),
    d3.max(justices, function(c) { return d3.max(c.values, function(v) { if (v != null) return v.date; else return 0; }); })
  ]);
  y.domain([0, 100]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Times voted with the majority");

  var justice = svg.selectAll(".justice")
      .data(justices)
      .enter().append("g")
      .attr("class", "justice");

  justice.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

  justice.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.percent) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  for (var ind = 0; ind < justices.length; ind++) {
      var focus = svg.append("g")
          .attr("class", "focus")
          .attr("id", justices[ind].name)
          .style("display", "none");
      focus.append("circle")
          .attr("r", 4.5);
      focus.append("text")
          .attr("x", 9)
          .attr("dy", ".35em");

      svg.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { /*svg.selectAll('.focus').style("display", null);*/})
          .on("mouseout", function() { svg.selectAll('.focus').style("display", "none");})
          .on("mousemove", mousemove);

      function mousemove() {
        svg.selectAll('.focus').style("display", null);
        var x0 = x.invert(d3.mouse(this)[0]);
        for (var j = 0; j < justices.length; j++) {
            var i = bisectDate(justices[j].values, x0, 1),
            d0 = justices[j].values[i - 1],
            d1 = justices[j].values[i];
            if (d0 == null || d1 == null || d0.percent == null || d1.percent == null 
                    || x0 < justices[j].values[0].date) { 
                svg.select('#'+justices[j].name).style("display", "none");
                continue;
            }
            var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            var myfocus = svg.select('#'+justices[j].name);
            myfocus.attr("transform", "translate(" + x(d.date) + "," + y(d.percent) + ")");
            myfocus.select("text").text(formatHoverText(d, justices[j].name));
        }
      }
  }
});
// ** Update data section (Called from the onclick)
function updateData() {
    targetJustice = $("#get-name").val();
    var tJexists = $.inArray(targetJustice, listjustices) > -1;
    targetJustice2 = $("#get-name2").val();
    var tJexists2 = $.inArray(targetJustice2, listjustices) > -1;
    targetissue = issueKeys[$("#get-issue").val()];
    var onlysplitdata = $("#splitdata").prop('checked');
    //targetissue = issueKeys[$("#dropdownMenu1").text()];
    justice_names = [targetJustice, targetJustice2];
    // Load the new data
    d3.csv("data/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", function(error, csv_data) {
          justices = [];
          for (var i = 0; i < justice_names.length; i++) {
            justices[i] = new Object();
            justices[i].name = justice_names[i];
            justices[i].values = [];
          }
          color.domain(justices);
          csv_data.forEach(function(d) {
            if (tJexists && d.justiceName !== justices[0].name &&
                tJexists2 && d.justiceName !== justices[1].name) return 1;
            if (targetissue != null && +d.issueArea != targetissue) return 1;
            d.date = parseDate(d.term);
            d.vote = +d.vote;
            var data = d.justiceName == justices[0].name ? justices[0].values : justices[1].values;
            if (data.length == 0 || data[data.length-1].date.getTime() != d.date.getTime()) {
              var sccase = new Object();
              sccase.date = d.date, sccase.vote = 0, sccase.totalvotes = 1, sccase.split = 0, sccase.splittotals = 0;
              if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
                sccase.vote += 1;
              if (d.majVotes == 5 && d.minVotes == 4) {
                if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
                  sccase.split += 1;
                sccase.splittotals += 1;
              }
              data[data.length] = sccase;
            }
            else {
              var sccase = data[data.length-1];
              sccase.totalvotes += 1;
              if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
                sccase.vote += 1;
              if (d.majVotes == 5 && d.minVotes == 4) {
                if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
                  sccase.split += 1;
                sccase.splittotals += 1;
              }
            }
          });
          justices.map(function (j){j.values.map(function (d){
            d.percent=100*d.vote/d.totalvotes;
            d.splitpercent = 100*d.split/d.splittotals;
            if (onlysplitdata) {
              d.vote = d.split;
              d.totalvotes = d.splittotals;
              d.percent = d.splitpercent;              
            }
          })});
             
          // Scale the range of the data again 
          x.domain([
            d3.min(justices, function(c) { return d3.min(c.values, function(v) { if (v != null)return v.date; else return 9999 }); }),
            d3.max(justices, function(c) { return d3.max(c.values, function(v) { if (v != null) return v.date; else return 0; }); })
          ]);
          y.domain([0, 100 ]);

      // Select the section we want to apply our changes to
      var svgtrans = d3.select("body").transition();
      var svg = d3.select("svg").select("g");

      // Make the changes
        svgtrans.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svgtrans.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);
        /*
        svgtrans.selectAll(".line")   // change the line using transitions
            .duration(500)
            .style("stroke", "white");
        svgtrans.selectAll(".justice")
            .duration(500)
            .remove()
            .transition().call(function(){console.log("done")});
            */
      svg.selectAll(".justice")
          .remove();
      svg.selectAll('.focus').style("display", "none");
      $.each(justices, function(key, value){$('.focus:eq('+key+')').attr("id", value.name)});
      justice = svg.selectAll(".justice")
          .data(justices)
          .enter().append("g")
          .attr("class", "justice");

      justice.append("path")
          .attr("class", "line")
          .attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return color(d.name); });

      justice.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.percent) + ")"; })
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

      svg.select("rect")
          .on("mousemove", mousemove);
      //try to just update the mousemove function in focus?
      function mousemove() {
        svg.selectAll('.focus').style("display", null);
        var x0 = x.invert(d3.mouse(this)[0]);
        for (var j = 0; j < justices.length; j++) {
            var i = bisectDate(justices[j].values, x0, 1),
            d0 = justices[j].values[i - 1],
            d1 = justices[j].values[i];
            if (d0 == null || d1 == null || d0.percent == null || d1.percent == null
                    || x0 < justices[j].values[0].date) { 
                svg.select('#'+justices[j].name).style("display", "none");
                continue;
            }
            var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            var myfocus = svg.select("#"+justices[j].name);
            myfocus.attr("transform", "translate(" + x(d.date) + "," + y(d.percent) + ")");
            myfocus.select("text").text(formatHoverText(d, justices[j].name));
        }
      }
    });
}
