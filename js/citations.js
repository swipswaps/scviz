var nodes = {};
function init() {
  $.get("data/citations/nametooldcite.json", function (data) {
      namelist = Object.keys(data)
      for (var i in namelist) {
        $('#get-case').append('<option value="'+namelist[i]+'">'+namelist[i]+'</option>');
      }
  });
}
// loadauto("get-case");
targetCase = $("#get-case").val();

queue()
    .defer(d3.json, "data/citations/adjlist.json") //next, get the master list!
    .defer(d3.json, "data/citations/mastercaselist.json")
    .defer(d3.json, "data/citations/oldstyletodocket.json")
    .defer(d3.json, "data/citations/nametooldcite.json")
    .await(ready);

function ready(error, bigjson, caselist, dockets, namestocites) {

links = [];
  for(key in bigjson[testcase]){
        var temp = {}
        if(bigjson[testcase][key] == 1){
          temp["source"] = caselist[testcase] || testcase
          temp["target"] = caselist[key] || key
          temp["type"] = "suit"
          if(temp["source"] != temp["target"]){       //no case cites itself!!
            links.push(temp)
          }
        } else if (bigjson[testcase][key] == 2) {
          temp["source"] = caselist[key] || key
          temp["target"] = caselist[testcase] || testcase
          temp["type"] = "licensing"
          if(temp["source"] != temp["target"]){
            links.push(temp)
          }
        }
    }

  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });

  var width = 960,
      height = 500;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(150)
      .charge(-300)
      .on("tick", tick)
      .start();

  var svg = d3.select("#canvass").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll("path")
      .data(force.links())
    .enter().append("path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
var base = "http://caselaw.lp.findlaw.com/scripts/getcase.pl?court=us&vol=";
var regg = /\d+/gi;
  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter().append("circle")
      .attr("r", 6)
      .call(force.drag)
            .on("click", function(d) { 
              // REDRAW GRAPH ON CLICK OF A CIRCLE
        var mystr = d.name;
        bigregg = /\d{1,3}\s{1,3}U.S.(\s|,\sat\s)\d{1,3}/gi; //same as from python code
        targetCase = mystr.match(bigregg)[0]  //find the key for use in mastercaselist.json ERRORS HERE
        d3.select("svg").remove();          //remove the last graph viz
        ready(error,bigjson,caselist,dockets,namestocites)       //call ready again to create the new one
         });

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
    .enter().append("text")
      .attr("x", 8)
      .attr("y", ".31em")
      .text(function(d) { 
        return d.name
      })
      .on("click", function(d){ //open link in new window -- need to fix this for cases after 1997!
        var mystr = d.name;
        var numlist = mystr.match(regg);
        if(! numlist){
          console.log("hi")
          try {
            // x = caselist.getKeyByValue(d.name)
            // y = dockets[x]
            // url = base + "000&invol=" + y
          }
          catch(e) {
            url = "http://findlaw.com"
          }
        } 
        else {
          url = base + numlist[0] + "&invol=" + numlist[1];
        }
        window.open(url);
      });


  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }
}