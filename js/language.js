var word1 = "civil"
var word2 = "freedom"

function ready() {
  wordss = $("#words").combobox().val();
  console.log(wordss)
  var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
      .defined(function(d){return d.num != null})
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.num); });

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var wordFreqArr = wordss.split(', ')
  if(typeof wordFreqArr === undefined) {
    wordFreqArr = wordss.split(",")
  }
  d3.json("data/lang/wordfreqsfinal.json", function(err, data) {
      counts = new Object();
      for(i in wordFreqArr) {
        for(year=1991;year < 2009; year++) {
            counts[year] = {};
            counts[year][wordFreqArr[i]] = data[year][wordFreqArr[i]]
        }
        
    }
    console.log(counts)
  });
}