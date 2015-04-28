//$("#words").combobox();
// should have parsed json to be case insensitive
var margin = {top: 20, right: 50, bottom: 30, left: 50},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y").parse,
bisectDate = d3.bisector(function(d) { return d.date; }).left,
formatHoverText = function (d, name) {
  return name + " appeared " + d.num + " times in " + d.date.getFullYear();
};
var charted = false;

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
    //.defined(function(d){return d.num != null})
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.num); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

$("#words").val("gay, same-sex, marriage");
ready();

function ready() {
  if (charted) {
    updateData();
    return;
  }
  wordss = $("#words").val();
  var wordFreqArr = wordss.split(', ')
  if(! wordFreqArr[1]) {
    wordFreqArr = wordss.split(",");
  }
  d3.json("data/lang/wordfreqsfinal.json", function(err, data) {
      counts = [];
      wordFreqArr.map(function(d, i){
        counts[i] = {};
        counts[i].name = d;
        counts[i].values = [];
        for(var year = 1991, c = 0;year < 2009; year++, c++) {
            counts[i].values[c] = {};
            counts[i].values[c].date = parseDate(String(year));
            counts[i].values[c].num = data[year][wordFreqArr[i]];
            if (counts[i].values[c].num == null) counts[i].values[c].num = 0;
        }
      });
      color.domain(counts);
      x.domain([parseDate("1991"), parseDate("2008")]);
      y.domain([
        d3.min(counts, function(c) { return d3.min(c.values, function(v) { if (v != null)return v.num; else return 0; }); }),
        d3.max(counts, function(c) { return d3.max(c.values, function(v) { if (v != null) return v.num; else return 0; }); })
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
          .text("Times word appeared per year");

      var wordchart = svg.selectAll(".wordchart")
          .data(counts)
          .enter().append("g")
          .attr("class", "wordchart");

      wordchart.append("path")
          .attr("class", "line")
          .attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return color(d.name); });

      wordchart.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.num) + ")"; })
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

      for (var ind = 0; ind < counts.length; ind++) {
        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("id", counts[ind].name)
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
          for (var j = 0; j < counts.length; j++) {
              var i = bisectDate(counts[j].values, x0, 1),
              d0 = counts[j].values[i - 1],
              d1 = counts[j].values[i];
              if (d0 == null || d1 == null || d0.num == null || d1.num == null 
                      || x0 < counts[j].values[0].date) { 
                  svg.select('#'+counts[j].name).style("display", "none");
                  continue;
              }
              var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
              var myfocus = svg.select('#'+counts[j].name);
              myfocus.attr("transform", "translate(" + x(d.date) + "," + y(d.num) + ")");
              myfocus.select("text").text(formatHoverText(d, counts[j].name));
          }
        }
      }

  });
  charted = true;
}

function updateData() {
    // Load the new data
    wordss = $("#words").val();
    var wordFreqArr = wordss.split(', ')
    if(! wordFreqArr[1]) {
      wordFreqArr = wordss.split(",");
    }
    d3.json("data/lang/wordfreqsfinal.json", function(err, data) {
          counts = [];
          wordFreqArr.map(function(d, i){
            counts[i] = {};
            counts[i].name = d;
            counts[i].values = [];
            for(var year = 1991, c = 0;year < 2009; year++, c++) {
                counts[i].values[c] = {};
                counts[i].values[c].date = parseDate(String(year));
                counts[i].values[c].num = data[year][wordFreqArr[i]];
                if (counts[i].values[c].num == null) counts[i].values[c].num = 0;
            }
          });
          color.domain(counts);
          // Scale the range of the data again 
          x.domain([parseDate("1991"), parseDate("2008")]);
          y.domain([
            d3.min(counts, function(c) { return d3.min(c.values, function(v) { if (v != null)return v.num; else return 0; }); }),
            d3.max(counts, function(c) { return d3.max(c.values, function(v) { if (v != null) return v.num; else return 0; }); })
          ]);
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

      svg.selectAll(".wordchart").remove();
      svg.selectAll(".focus").remove();

      var wordchart = svg.selectAll(".wordchart")
          .data(counts)
          .enter().append("g")
          .attr("class", "wordchart");

      wordchart.append("path")
          .attr("class", "line")
          .attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return color(d.name); });

      wordchart.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.num) + ")"; })
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

      for (var ind = 0; ind < counts.length; ind++) {
        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("id", counts[ind].name)
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
          for (var j = 0; j < counts.length; j++) {
              var i = bisectDate(counts[j].values, x0, 1),
              d0 = counts[j].values[i - 1],
              d1 = counts[j].values[i];
              if (d0 == null || d1 == null || d0.num == null || d1.num == null 
                      || x0 < counts[j].values[0].date) { 
                  svg.select('#'+counts[j].name).style("display", "none");
                  continue;
              }
              var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
              var myfocus = svg.select('#'+counts[j].name);
              myfocus.attr("transform", "translate(" + x(d.date) + "," + y(d.num) + ")");
              myfocus.select("text").text(formatHoverText(d, counts[j].name));
          }
        }
      }
  });
}