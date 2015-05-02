var nodes = {};
var namelist = {};
var testcase = "LAURENCE M. POWELL v. UNITED STATES"
function init() {
  $.get("data/citations/allnamestocitations.json", function (data) {
      namelist = data;
      thislist = Object.keys(namelist);
      for (var i in thislist) {
        $('#get-case').append('<option value="'+thislist[i]+'">'+thislist[i]+'</option>');
      }
  });
}
$("#get-case").combobox();

queue()
    .defer(d3.json, "data/citations/theycite.json")
    .defer(d3.json, "data/citations/citedby.json")
    .defer(d3.json, "data/citations/mastercaselist1890-pres.json")
    .defer(d3.json, "data/citations/oldstyletodocket.json")
    .defer(d3.json, "data/citations/allnamestocitations.json")
    .await(ready);

function ready(error, theycite, citedby, oldtoname, oldtodockets, namestocites) {
// testcase = $("#get-case").combobox().val();
if(testcase in namestocites) { thiscase = namestocites[testcase] } else { 
  bigregg = /\d{1,3}\s{1,3}U.S.(\s|,\sat\s)\d{1,4}/gi;
  if(testcase.match(bigregg)) {
        thiscase = testcase.match(bigregg)[0];
        if(thiscase in theycite || thiscase in citedby) {} else {thiscase = "err";console.log(error)}
  }
}
links = [];
  for(key in theycite[thiscase]){
        var temp = {}
        temp["source"] = testcase || thiscase
        temp["target"] = oldtoname[theycite[thiscase][key]] || theycite[thiscase][key]
        temp["type"] = "suit"
        if(temp["source"] != temp["target"]){       //no case cites itself!!
            links.push(temp)
          }
  }
  for(key in citedby[thiscase]) {
          var temp = {}
          temp["source"] = oldtoname[citedby[thiscase][key]] || citedby[thiscase][key]
          temp["target"] = testcase || thiscase
          temp["type"] = "licensing"
          if(temp["source"] != temp["target"]){
            links.push(temp)
          }
        }

  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });
  var width = 1000,
      height = 700;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(200)
      .charge(-500)
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
      .attr("r", 10)
      .call(force.drag()
        .on("dragstart",dragstart))
            .on("click", function(d) { 
              // REDRAW GRAPH ON CLICK OF A CIRCLE
        var mystr = d.name;
        if(mystr in namestocites) {
          testcase = mystr
        } else if (mystr in oldtoname) {
              testcase = oldtoname[mystr]
            } else {
              try {
                    bigregg = /\d{1,3}\s{1,3}U.S.(\s|,\sat\s)\d{1,4}/gi; //same as from python code
                    if(mystr.match(bigregg)) {
                        xx = mystr.match(bigregg)[0]  //find the key for use in mastercaselist.json ERRORS HERE
                        if(xx in oldtoname) {
                          testcase = oldtoname[xx]
                        } else {
                        }
                    }
              } catch(e) {
                console.log(e)
              }
          }
        d3.select("svg").remove();          //remove the last graph viz
        ready(error, theycite, citedby, oldtoname, oldtodockets, namestocites)       //call ready again to create the new one
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
        if(! numlist){  //no easy citation -> link mapping
          try {
            lastpart = namestocites[mystr].split("U.S. ")[1]
            url = base + namestocites[mystr].substring(0,3) + "&invol=" + lastpart
          }
          catch(e) {
            url = "http://findlaw.com"  //ok, give up
          }
        }
        
        else {  //easy!
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
function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}
  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }
}

function testme() {
  testcase = $("#get-case").val();
  console.log(testcase)
  var nodes = {};
  var namelist = {};
  function init() {
    $.get("data/citations/allnamestocitations.json", function (data) {
      namelist = data;
      thislist = Object.keys(namelist);
      for (var i in thislist) {
        $('#get-case').append('<option value="'+thislist[i]+'">'+thislist[i]+'</option>');
      }
  });
}
  d3.selectAll("circle").remove();
  d3.selectAll("text").remove();
  d3.selectAll("svg").remove();          //remove the last graph viz
  // d3.selectAll("canvass").remove();
  queue()
    .defer(d3.json, "data/citations/theycite.json")
    .defer(d3.json, "data/citations/citedby.json")
    .defer(d3.json, "data/citations/mastercaselist1890-pres.json")
    .defer(d3.json, "data/citations/oldstyletodocket.json")
    .defer(d3.json, "data/citations/allnamestocitations.json")
    .await(ready);

function ready(error, theycite, citedby, oldtoname, oldtodockets, namestocites) {
// testcase = $("#get-case").combobox().val();
if(testcase in namestocites) {thiscase = namestocites[testcase]; console.log(thiscase); } else { 
  bigregg = /\d{1,3}\s{1,3}U.S.(\s|,\sat\s)\d{1,4}/gi;
  if(testcase.match(bigregg)) {
        thiscase = testcase.match(bigregg)[0];
        if(thiscase in theycite || thiscase in citedby) {} else {thiscase = "err";console.log("EER" + error)}
  }
}
links = [];
  for(key in theycite[thiscase]){
        var temp = {}
        temp["source"] = testcase || thiscase
        temp["target"] = oldtoname[theycite[thiscase][key]] || theycite[thiscase][key]
        temp["type"] = "suit"
        if(temp["source"] != temp["target"]){       //no case cites itself!!
            console.log(temp["target"])
            links.push(temp)
          }
  }
  for(key in citedby[thiscase]) {
          var temp = {}
          temp["source"] = oldtoname[citedby[thiscase][key]] || citedby[thiscase][key]
          temp["target"] = testcase || thiscase
          temp["type"] = "licensing"
          if(temp["source"] != temp["target"]){
            links.push(temp)
          }
        }

  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });
  var width = 1000,
      height = 700;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(200)
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
      .attr("r", 10)
      .call(force.drag()
        .on("dragstart",dragstart))
            .on("click", function(d) { 
              // REDRAW GRAPH ON CLICK OF A CIRCLE
        var mystr = d.name;
        if(mystr in namestocites) {
          testcase = mystr
        } else if (mystr in oldtoname) {
              testcase = oldtoname[mystr]
            } else {
              try {
                    bigregg = /\d{1,3}\s{1,3}U.S.(\s|,\sat\s)\d{1,4}/gi; //same as from python code
                    if(mystr.match(bigregg)) {
                        xx = mystr.match(bigregg)[0]  //find the key for use in mastercaselist.json ERRORS HERE
                        if(xx in oldtoname) {
                          testcase = oldtoname[xx]
                        } else {
                        }
                    }
              } catch(e) {
                console.log(e)
              }
          }
        d3.select("svg").remove();          //remove the last graph viz
        ready(error, theycite, citedby, oldtoname, oldtodockets, namestocites)       //call ready again to create the new one
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
        if(! numlist){  //no easy citation -> link mapping
          try {
            lastpart = namestocites[mystr].split("U.S. ")[1]
            url = base + namestocites[mystr].substring(0,3) + "&invol=" + lastpart
          }
          catch(e) {
            url = "http://findlaw.com"  //ok, give up
          }
        }
        
        else {  //easy!
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
function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}
  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }
}
  
}