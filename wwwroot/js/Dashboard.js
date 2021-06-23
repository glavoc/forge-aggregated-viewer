$(document).ready(function () {
    $('#pieChart').click(function () {
        data = new ModelData(d3.select('#forgeViewer'))

        var svg = d3.select("#forgeViewer").append('svg'),
            width = 600,
            height = 600,
            radius = Math.min(width, height) / 2,
            g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            
        svg.style("width","100%");
        svg.style("height","100%");
        svg.style("z-index",9);
        var color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);

        // Generate the pie
        var pie = d3.pie();

        // Generate the arcs
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        //Generate groups
        var arcs = g.selectAll("arc")
            .data()
            .enter()
            .append("g")
            .attr("class", "arc")

        //Draw arc paths
        arcs.append("path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("d", arc);
    });
});