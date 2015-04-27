var width = 960,
    height = 600;

var rateById = d3.map();

var issue = "All"
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
"All":15}


function init() {
  var listissues=["Criminal Procedure", "Civil Rights", "First Amendment", "Due Process", "Privacy", "Attorneys", "Unions", "Economic Activity", "Judicial Power", "Federalism", "Interstate Relations", "Federal Taxation", "Miscellaneous", "Private Action"]
  for (var i in listissues) {
    $('#get-issue').append('<option value="'+listissues[i]+'">'+listissues[i]+'</option>');
  }
}
$("#get-issue").combobox();

var quantize = d3.scale.quantize()
    .domain([0, 250])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

counts = {}
queue()
  .defer(d3.json, "data/geog/us.json")
  .defer(d3.csv, "data/geog/issuesbyd3id.csv")
  .defer(d3.csv, "data/geog/issuesbystate.csv")
  .await(ready)
var x ;
function ready(error, us, data, statemapping) {
  x = statemapping;
    for(i in data) {
      if(data[i].issueArea == issueKeys[issue] || issueKeys[issue] == 15) {
        if (data[i].id in counts) {
          counts[data[i].id].numcases += 1
        } else {
          counts[data[i].id] = {};
          counts[data[i].id].numcases = 1
        }
      }
    }
    statemapping.map(function(d){counts[d.id].name = d.state;});
    svg.append("g")
      .attr("class", "stateColors")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("class", function(d) { if (counts[d.id] != null) return quantize(counts[d.id].numcases); })
      .attr("d", path)
      .on("mouseover", mouseOver).on("mouseout", mouseOut);
    function mouseOver(d){
      d3.select("#tooltip").transition().duration(200).style("opacity", .9);      
      d3.select("#tooltip").html(toolTip(counts[d.id]))  
        .style("left", (d3.event.pageX) + "px")     
        .style("top", (d3.event.pageY - 28) + "px");
    }
    function mouseOut(){
      d3.select("#tooltip").transition().duration(500).style("opacity", 0);      
    }
}

d3.select(self.frameElement).style("height", height + "px");

function toolTip(d){ /* function to create html content string in tooltip div. */
    return "<h4>"+d.name+"</h4><table>"+
      "<tr><td>Number of cases</td><td>"+d.numcases+"</td></tr>"+
      "<tr><td>High</td><td>"+/*(d.high)+*/"</td></tr>"+
      "</table>";
}
