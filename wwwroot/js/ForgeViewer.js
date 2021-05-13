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
    var callback = function () { };
    Autodesk.Viewing.Initializer(options, callback);
  }
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
        globalOffset: {x: 0, y: 0, z: 0}
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
