// Graph a justice's votes by issue

$('.dropdown-toggle').dropdown();
$('#dropdownList li').on('click', function() {
    $('#dropdownMenu1').html($(this).html());
    });

var justice_names = ['TMarshall', 'FMVinson'];
//['AFortas', 'AJGoldberg', 'AMKennedy', 'AScalia', 'BRWhite', 'CEWhittaker', 'CThomas', 'DHSouter', 'EKagan', 'EWarren', 'FFrankfurter', 'FMurphy', 'FMVinson', 'HABlackmun', 'HHBurton', 'HLBlack', 'JGRoberts', 'JHarlan2', 'JPStevens', 'LFPowell', 'PStewart', 'RBGinsburg', 'RHJackson', 'SAAlito', 'SDOConnor', 'SFReed', 'SGBreyer', 'SMinton', 'SSotomayor', 'TCClark', 'TMarshall', 'WBRutledge', 'WEBurger', 'WHRehnquist', 'WJBrennan', 'WODouglas'];

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
    formatHoverText = function (d) {
      return "Voted in the Majority " + d.vote + " times out of " +
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
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.vote); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", function(error, csv_data) {
  targetJustice = "TMarshall";
  target2 = "FMVinson";
  
  csv_data.forEach(function(d) {
    d.term = parseDate(d.term);
    d.vote = +d.vote;
    if (d.justiceName !== targetJustice && d.justiceName !== target2) return 1;
    if (data.length == 0 || data[data.length-1].date.getTime() != d.term.getTime()) {
      var sccase = new Object();
      sccase.date = d.term;
      sccase[d.justiceName] = [];
      if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
        sccase[d.justiceName].vote = 1;
      else sccase.vote = 0;
      sccase[d.justiceName].totalvotes = 1;
      data.push(sccase);
    }
    else {
      if (data[data.length-1][d.justiceName] == null) {
        data[data.length-1][d.justiceName] = [];
        data[data.length-1][d.justiceName].vote = 0;
        data[data.length-1][d.justiceName].totalvotes = 0;
      }
      if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
        data[data.length-1][d.justiceName].vote += 1;
      data[data.length-1][d.justiceName].totalvotes += 1;
    }
  });

  color.domain(justice_names);
  justices = color.domain().map(function(name) {
     return {
       name: name,
       values: data.map(function(d) {
          if (d[name] != null)
           return {date: d.date, vote: +d[name].vote, totalvotes: +d[name].totalvotes};
          else
            return {date: d.date, vote: +0, totalvotes: +0};
       })
     };
  });

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  x.domain([data[0].date, data[data.length - 1].date]);
  y.domain([
    d3.min(justices, function(c) { return d3.min(c.values, function(v) { if (v != null)return v.vote; else return 999 }); }),
    d3.max(justices, function(c) { return d3.max(c.values, function(v) { if (v != null) return v.vote; else return 0; }); })
  ]);

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
      .style("stroke", function(d) { if (d.values.vote == 0) return "white";return color(d.name); });

  justice.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.vote) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
      /*
  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  var focus = svg.append("g")
      .attr("class", "focus")
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
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.vote) + ")");
    focus.select("text").text(formatHoverText(d));
  }
  */
});

// ** Update data section (Called from the onclick)
function updateData() {
    targetJustice = $("#get-name").val();
    targetissue = issueKeys[$("#dropdownMenu1").text()];
    data = [];
    // Get the data again
    d3.csv("data/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", function(error, csv_data) {
      csv_data.forEach(function(d) {
        d.term = parseDate(d.term);
        if (d.justiceName !== targetJustice) return 1;
        if (targetissue != null && targetissue != +d.issueArea) return 1;
        else if (data.length == 0 || data[data.length-1].date.getTime() != d.term.getTime()) {
          var sccase = new Object();
          sccase.date = d.term;
          if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
            sccase.vote = 1;
          else sccase.vote = 0;
          sccase.totalvotes = 1;
          data.push(sccase);
        }
        else {
          d.vote = +d.vote;
          if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
            data[data.length-1].vote += 1;
          data[data.length-1].totalvotes += 1;
        }
      });

      // Scale the range of the data again 
      x.domain([data[0].date, data[data.length - 1].date]);
      y.domain(d3.extent(data, function(d) { return d.vote; }));

      // Select the section we want to apply our changes to
      var svg = d3.select("body").transition();

      // Make the changes
        svg.select(".line")   // change the line
            .duration(750)
            .attr("d", line(data));
        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);
    });
}
