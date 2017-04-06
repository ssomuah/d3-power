var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 110, left: 50 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    margin2 = { top: 430, right: 20, bottom: 30, left: 50 },
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;


svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);



var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");



function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || xe.range();
    x.domain(s.map(x2.invert, x2));

    //bandy.domain(s.map(x2.invert,x2))
    focus.select(".avg_line").attr("d", avgLine)
    focus.select(".power_line").attr("d", powerLine);
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x0).domain());
    focus.select(".avg_line").attr("d", avgLine);
    focus.select(".power_line").attr("d", powerLine);
    focus.select(".axis--x").call(xAxis);


    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}

//x0 is hidden axis for scaling
//x0 is not really needed anymore since we have the brush axis

//x is the avg
//x2 is the power line
//x0 is the brush axis

var x0 = d3.scaleTime().range([0, width])
var x = d3.scaleTime().range([0, width]);
var x2 = d3.scaleTime().range([0, width])

var y = d3.scaleLinear().rangeRound([height, 0]);
var y2 = d3.scaleLinear().rangeRound([height2, 0]);

var avgLine = d3.line()
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.avg); });

var powerLine = d3.line()
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.power); });

var contextLine = d3.line()
    .x(function (d) { return x0(d.date); })
    .y(function (d) { return y2(d.power); });

var xAxis = d3.axisBottom(x)
var xAxis2 = d3.axisBottom(x0)
var yAxis = d3.axisLeft(y)


d3.json("public/data.json"
    , function (error, data) {
        if (error) {
            console.log(error)
            throw error
        }


        data.forEach(function (x) { x.date = new Date(x.timestamp)})


        x0.domain(d3.extent(data, function (d) { return d.date; }));
        x.domain(x0.domain());
        x2.domain(x0.domain())

        avg_range = d3.extent(data, function (d) { return d.avg })
        power_range = d3.extent(data, function (d) { return d.power })
        ranges = avg_range.concat(power_range)
        y.domain(d3.extent(ranges));
        y2.domain(y.domain())


        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)


        focus.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Power Units?");

        focus.append("path")
            .datum(data)
            .attr("data-legend", "Average Power")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line avg_line")
            .attr("d", avgLine);

        focus.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line power_line")
            .attr("data-legend", function (d) { return "Customer Power" })
            .attr("d", powerLine);

        context.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("class", "line")
            .attr("d", contextLine);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(100,30)")
            .style("font-size", "12px")
            .call(d3.legend)



        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);
    });