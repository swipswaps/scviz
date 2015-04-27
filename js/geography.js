var width = 960,
    height = 600;

var rateById = d3.map();

var issue = "All",
  issuenum = 15;
var issueKeys = {
"All":0,
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
"All":15}
var listissues=["All","Criminal Procedure", "Civil Rights", "First Amendment", "Due Process", "Privacy", "Attorneys", "Unions", "Economic Activity", "Judicial Power", "Federalism", "Interstate Relations", "Federal Taxation", "Miscellaneous", "Private Action"];

function init() {
  for (var i in listissues) {
    $('#get-issue').append('<option value="'+listissues[i]+'">'+listissues[i]+'</option>');
  }
}
//$("#get-issue").combobox();


var projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

counts = [];
queue()
  .defer(d3.json, "data/geog/us.json")
  .defer(d3.csv, "data/geog/issuesbyd3id.csv")
  .defer(d3.csv, "data/geog/issuesbystate.csv")
  .await(ready)
function ready(error, us, data, statemapping) {
    data.map(function(d) {
      if (d.id in counts) {
        counts[d.id].totalcases += 1;
        counts[d.id].All += 1;
        counts[d.id][listissues[d.issueArea]] += 1;
      } else {
        counts[d.id] = {};
        listissues.map(function (i){counts[d.id][i] = 0;});
        counts[d.id].totalcases = 1;
        counts[d.id].All = 1;
        counts[d.id][listissues[d.issueArea]] += 1;
      }
    });
    statemapping.map(function(d){counts[d.id].name = d.state;});
    counts.map(function(d){
      listissues.map(function (i) {
        d["p"+i] = (i == "All") ? d.All : 100*d[i]/d.All;
      });
    });
    var quantize = d3.scale.quantize()
        .domain([0, d3.max(counts, function(c) { if (c != null)return c["p"+issue]; }) ])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
    svg.append("g")
      .attr("class", "stateColors")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("class", function(d) { if (d.id in counts) return quantize(counts[d.id]["p"+issue]); })
      .attr("d", path)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);
    function mouseOver(d){
      d3.select("#tooltip").transition().duration(200).style("opacity", .9);      
      d3.select("#tooltip").html(toolTip(counts[d.id]))  
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    }
    function mouseOut(){
      d3.select("#tooltip").transition().duration(500).style("opacity", 0);      
    }
    function toolTip(d){ /* function to create html content string in tooltip div. */
        return "<h4>"+d.name+"</h4><table>"+
          "<tr><td>Number of cases in "+issue+"</td><td>"+d[issue]+"</td></tr>"+
          "<tr><td>Total cases</td><td>"+d.All+"</td></tr>"+
          "</table>";
    }
}

$( "#get-issue" ).change(function() {
  issue = $("#get-issue").val();
  //reset_colors();
  var quantize = d3.scale.quantize()
      .domain([0, d3.max(counts, function(c) { if (c != null)return c["p"+issue]; }) ])
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
  svg.selectAll("path")
    .attr("class", function(d){if (d.id in counts) return quantize(counts[d.id]["p"+issue])});
});


/* not necessary */
var reset_colors = function () {
  var deleteClasses = "";
  for (var i = 0; i < 9; i++) deleteClasses += "q"+i+"-9 ";
  svg.selectAll("path").classed(deleteClasses, false);
}

d3.select(self.frameElement).style("height", height + "px");

