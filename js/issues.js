// Graph a justice's votes by issue

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

data = [];
var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//var parseDate = d3.time.format("%d-%b-%y").parse,
var parseDate = d3.time.format("%Y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    //CHANGE: this is what it will print out on hover for y axis
    formatValue = d3.format(",.2f"),
    formatCurrency = function(d) { return "$" + formatValue(d); },
    formatHoverText = function (d) {
      return "Voted in the Majority " + d.vote + " times out of " +
        d.totalvotes + " cases";
    };

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
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.vote); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//d3.csv("data/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", function(error, data) {
d3.csv("data/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", function(error, csv_data) {
  csv_data.forEach(function(d) {
    d.term = parseDate(d.term);
    if (d.justiceName == "TMarshall"){ 
    if (data.length == 0) {
      var sccase = new Object();
      sccase.date = d.term;
      if (d.vote == 1 || d.vote == 3 || d.vote == 4) //only count consents
        sccase.vote = 1;
      else sccase.vote = 0;
      sccase.totalvotes = 1;
      data.push(sccase);
    }
    else if (data[data.length-1].date.getTime() != d.term.getTime()) {
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
  }
  });

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  x.domain([data[0].date, data[data.length - 1].date]);
  //y.domain(d3.extent(data, function(d) { return d.close; }));
  y.domain(d3.extent(data, function(d) { return d.vote; }));

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
});
