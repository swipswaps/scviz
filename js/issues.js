// Graph a justice's votes by issue
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// var parseDate = d3.time.format("%y").parse;

var issueKeys = {1:"Criminal Procedure",
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

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.term); })
    .y(function(d) { return y(d.vote); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.csv("data/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", function(error, data) {
  data.forEach(function(d) {
  	// if(inputname == d.justiceName) {
	    d.term = +d.term;
	    d.vote = +d.vote;
	    d.issue = issueKeys[d.issueArea];
	    d.justice = +d.justiceName
	// }
  });

  x.domain(d3.extent(data, function(d) { return d.term; }));
  y.domain(d3.extent(data, function(d) { return d.vote; })); //TODO: needs to be sum of votes

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
      .text("Price ($)");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
});
