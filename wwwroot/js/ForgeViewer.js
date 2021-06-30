/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var view;
var viewer;

function launchViewer(urn) {
  if (!urn || urn.length <= 0)
    return console.error('Empty model input');

  //viewer options
  const options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };
  const options3d = {
    viewerConfig: {
      disableBimWalkInfoIcon: true
    }
  };

  //initialize the viewer object 
  if (!viewer) {
    const viewerDiv = document.getElementById('forgeViewer');
    view = new Autodesk.Viewing.AggregatedView();
    view.init(viewerDiv, options3d);
    viewer = view.viewer;
    var callback = function () {};
    Autodesk.Viewing.Initializer(options, callback);
  }
  //call dashboard loader once geometry has loaded
  viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function () {
    populateDashboard();
  })

  addViewable(urn);

  function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
      res.json().then(data => {
        callback(data.access_token, data.expires_in);
      });
    });
  }
}

async function addViewable(urn, xform) {
  return new Promise(function (resolve, reject) {
    function onDocumentLoadSuccess(doc) {
      const viewable = doc.getRoot().getDefaultGeometry();
      const options = {
        preserveView: true,
        keepCurrentModels: true,
        globalOffset: {
          x: 0,
          y: 0,
          z: 0
        }
      };
      if (xform) {
        options.placementTransform = xform;
      }
      viewer.loadDocumentNode(doc, viewable, options)
        .then(resolve)
        .catch(reject);
    }

    function onDocumentLoadFailure(code) {
      reject(`Could not load document (${code}).`);
    }
    Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function removeModel(urn) {
  const models = viewer.impl.modelQueue().getModels();
  const urns = models.map((model) => model.loader.svfUrn) //!<< The model you want to unload
  var index = urns.indexOf(urn)
  viewer.unloadModel(models[index])
}

function populateDashboard() {
  var data = new ModelData(viewer);
  var propertyName = 'Material';

  //kill the children
  var pieContainer = $("#dashboardViewer");
  while (pieContainer.firstChild) {
    pieContainer.removeChild(pieContainer.firstChild);
  }

  data.init(function () {
    var chartData = [];
    for (material in data.getLabels(propertyName)) {
      var input = {};
      input['Name'] = material;
      input['Values'] = data.getIds(propertyName, material);
      input['Size'] = data.getIds(propertyName, material).length;
      chartData.push(input)
    }
    var width = 400
    var height = 400
    var margin = 50
    var radius = Math.min(width, height) / 2 - margin

    var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
      '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
      '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
      '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
      '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
      '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
      '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
      '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
      '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
      '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
    ];


    var svg = d3.select('#dashboardViewer')
      .append("div")
      // Container class to make it responsive.
      .classed("svg-container", true)
      .append("svg")
      // Responsive SVG needs these 2 attributes and no width and height attr.
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + width + " " + height)
      // Class to make it responsive.
      .classed("svg-content-responsive", true)
    //.attr("width", width)
    //.attr("height", height)
    //.style("display", "block")
    //.style("margin", "auto")


    var g = svg
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")


    var color = d3.scaleOrdinal()
      .domain(chartData)
      .range(colorArray);

    // Generate the pie
    var pie = d3.pie()
      .sort(null)
      .value(function (d) {
        return d.Size
      })

    // Generate the arcs
    var arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius - 50);
    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.6)

    //Generate groups
    var arcs = g.selectAll("arc")
      .data(pie(chartData))
      .enter().append("path")
      .attr("fill", function (d, i) {
        return (color(i))
      })
      .attr("d", arc)
      .attr('class', "arc")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
    //.on("click", function (e, d) { alert(d.data.capacity); })

    //Draw arc paths
    function handleMouseOver(d, i) { // Add interactivity
      // Specify where to put label of text
      d3.select(d.target).transition()
        .attr("transform", "scale(1.4,1.4)")
    }

    function handleMouseOut(d, i) {
      d3.select(d.target).transition()
        .attr("transform", "scale(1,1)")
    }

    // Add the polylines between chart and labels:
    g
      .selectAll('allPolylines')
      .data(pie(chartData))
      .enter()
      .append('polyline')
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', function (d) {
        var posA = arc.centroid(d) // line insertion in the slice
        var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.85 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })


    // Add the polylines between chart and labels:
    g
      .selectAll('allLabels')
      .data(pie(chartData))
      .enter()
      .append('text')
      .text(function (d) {
        console.log(d.data.Name);
        return d.data.Name
      })
      .attr('transform', function (d) {
        var pos = outerArc.centroid(d);
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .style('text-anchor', function (d) {
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
      })

  })
}