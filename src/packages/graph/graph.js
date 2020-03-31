const GraphView = require("./GraphView.svelte");

patchfox.package({
  name: "graph",
  view: GraphView,
  messageTypes: [
    {
        type: "graph",
        view: GraphView
    }
  ],
  menu: [
    {
      group: "Graph",
      items: [
        {
          label: "View",
          event: "package:go",
                    data: {
                        pkg: "graph",
                        view: "view",
                        data: {
                          currentSubView: "rdf2h"
                        }
                    }
        },
        {
          label: "Edit",
          event: "package:go",
                    data: {
                        pkg: "graph",
                        view: "view",
                        data: {
                          currentSubView: "triplitdown"
                        }
                    }
        },
        {
          label: "SPARQL ",
          event: "package:go",
                    data: {
                        pkg: "graph",
                        view: "view",
                        data: {
                          currentSubView: "sparql"
                        }
                    }
        },
        {
          label: "Turtle ",
          event: "package:go",
                    data: {
                        pkg: "graph",
                        view: "view",
                        data: {
                          currentSubView: "turtle"
                        }
                    }
        }
      ]
    }
  ]
});
