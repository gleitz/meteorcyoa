(function($, window){
    function randRange(low, high) {
        var num = Math.floor(Math.random()*(high-low) + 1);
        return num + low;
    }
    var instance = null;
    var Graph = function(){
        var self = this,
            width = 150,
            height = 150,
            link = null,
            node = null,
            links = [],
            nodes = [],
            force = null,
            update = null;

        function flatten(root) {
            var nodes = [];
            function recurse(node) {
                if (node.children) node.children.forEach(recurse);
                nodes.push(node);
            }
            recurse(root);
            return nodes;
        }

        var color = d3.scale.category10();

        var svg = d3.select("#chart").append("svg")
            .attr("width", width)
            .attr("height", height);

        d3.json("nodes.json", function(error, graph) {
            nodes = flatten(graph),
            links = d3.layout.tree().links(nodes);

            nodes = _.map(nodes, function(e) {
                if (e.id == 1) {
                    e.fixed = true;
                }
                e['x'] = width / 2;
                e['y'] = height / 4;
                return e;
            });

            // Create the graph
            force = d3.layout.force()
                .gravity(0)
                .distance(20)
                .charge(-100)
                .on('tick', tick)
                .size([width, height]);

            var updateColor = function(d) {
                if (d.center) {
                    return 'green';
                } else if (d.visited) {
                    return '#7f7f7f';
                } else {
                    return 'black';
                }
            };

            update = function() {

                // Add the data
                force.nodes(nodes)
                    .links(links)
                    .start();

                // Draw the links
                link = svg.selectAll(".link").data(force.links());

                // Update the new links
                link.enter().append("line")
                    .attr("class", "link")
                    .style("stroke-width", function(d) {
                        return 3;
                    })
                    .style("stroke", function(d) { return "#000"; })
                    .style("stroke-opacity", function(d) { return .5; });

                // Remove the old links
                link.exit().remove();

                // Draw the nodes
                node = svg.selectAll(".node").data(force.nodes(), function(d) {return d.id;});

                // Insert the new nodes
                var svg_g = node.enter().append("svg:g");
                svg_g
                    .attr("class", "node")
                    .call(force.drag)

                .append("circle").attr("r", 10)
                    .style("fill", updateColor);

                svg_g.append("svg:text")
                    .style("font-size", "12px")
                    .attr("text-anchor", "middle")
                    .attr("dy", ".35em")
                    .attr('fill', '#FFF')
                    .text(function(d) {
                        if (_.contains([1,2], d.id)) {
                            return "";
                        }
                        return d.id;
                    });

                // Update existing nodes
                node.select('circle').style("fill", updateColor);

                // Remove the old nodes
                node.exit().remove();

                // make sure all the links are behind the nodes
                link.sort(function(a, b) {
                    return 1;
                });

            };

            // Create the tick function which animates the graph
            function tick (e) {

                var kx = .1 * e.alpha, ky = .1 * e.alpha;
                links.forEach(function(d, i) {
                    d.target.x += (d.source.x - d.target.x) * kx;
                    d.target.y += (d.source.y + 30 - d.target.y) * ky;
                });

                link.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
            }

        });

        $.extend(self, {
            findNode: function(id) {
                for (var i in nodes) {
                    if (nodes[i]["id"] === id) {
                        return nodes[i];
                    }
                }
                return null;
            },

            centerNode: function(id) {
                for (var i in nodes) {
                    if (nodes[i]["id"] === id) {
                        nodes[i].x = width / 2;
                        nodes[i].y = height / 4;
                        nodes[i].px = width / 2;
                        nodes[i].py = height / 4;
                        nodes[i].center = true;
                        nodes[i].fixed = true;
                        nodes[i].visited = true;
                    } else {
                        nodes[i].center = false;
                        nodes[i].fixed = false;
                    }
                };
                update();
                force.resume();
            },

            createLink: function(source_id, target_id) {
                var source_page = Pages.findOne({id: source_id}),
                    target_page = Pages.findOne({id: target_id});
                if (!_.contains(target_page.children, source_page.id) && source_page.id != 2) {
                    return;
                }
                var source = self.findNode(source_id),
                    target = self.findNode(target_id),
                    source_x = randRange(0, 100),
                    source_y = randRange(0, 100),
                    target_x = randRange(0, 100),
                    target_y = randRange(0, 100);
                source.x = source.px = source_x;
                source.y = source.py = source_y;
                target.x = target.px = target_x;
                target.y = target.py = target_y;
                links.push({source: source, target: target});
            },

            createNode: function(page) {
                var node = self.findNode(page.id);
                if (!node) {
                    nodes.push({id: page.id, x: 100, y: 100, color: page.color});
                }
            },

            addNode: function(page, linked_id) {
                if (!force) {
                    return;
                }
                force.stop();
                self.createNode(page);
                _.each(page.children, function(e) {
                    var child = Pages.findOne({id:e});
                    self.createNode(child);
                    self.createLink(child.id, page.id);
                });
                self.createLink(page.id, linked_id);
                update();
                force.resume();
            }

        });

    };

    $.graph = function(){
        if(instance === null){
            instance = new Graph();
        }
        return instance;
    };
})(jQuery, window);
