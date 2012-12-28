Meteor.startup(function () {
    var width = 300,
        height = 300;

    var color = d3.scale.category10();

    var force = d3.layout.force()
        .gravity(0)
        .charge(-5000)
        .linkDistance(30)
        .size([width, height]);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    function flatten(root) {
        var nodes = [];
        function recurse(node) {
            if (node.children) node.children.forEach(recurse);
            nodes.push(node);
        }
        recurse(root);
        return nodes;
    }

    d3.json("nodes.json", function(error, graph) {
        var nodes = flatten(graph),
        links = d3.layout.tree().links(nodes);

        graph.fixed = true;
        graph.x = width / 2;
        graph.y = 50;

        force
            .nodes(nodes)
                .links(links)
            .start();

        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("line")
            .attr("class", "link");

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        node.append("image")
            .attr("xlink:href", "https://github.com/favicon.ico")
            .attr("x", -8)
            .attr("y", -8)
            .attr("width", 16)
            .attr("height", 16);

        node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .attr('fill', '#fff')
            .text(function(d) { return d.name });


        force.on("tick", function(e) {

            var kx = .4 * e.alpha, ky = 1.4 * e.alpha;
            links.forEach(function(d, i) {
                d.target.x += (d.source.x - d.target.x) * kx;
                d.target.y += (d.source.y + 80 - d.target.y) * ky;
            });

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
    });
});