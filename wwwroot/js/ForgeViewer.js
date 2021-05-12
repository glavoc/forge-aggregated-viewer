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

var viewer;

function launchViewer(urn) {
  if (!urn || urn.length <= 0)
    return console.error('Empty model input');

  var modelUrns = []
  modelUrns.map(urn)

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
  const viewerDiv = document.getElementById('forgeViewer');
  const view = new Autodesk.Viewing.AggregatedView();
  view.init(viewerDiv, options3d);
  const viewer = view.viewer;

  var callback = function () {
    alert("initialization complete");
  };
  Autodesk.Viewing.Initializer(options, callback);
  loadManifest("urn:" + urn)

  function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
      res.json().then(data => {
        callback(data.access_token, data.expires_in);
      });
    });
  }

  function loadManifest(documentId) {
    return new Promise((resolve, reject) => {
      const onDocumentLoadSuccess = (doc) => {
        doc.downloadAecModelData(() => resolve(doc));
      };
      Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, reject);
    });
  }

  function addModel(urn) {

    function getBubble(doc) {
      const bubbles = doc.getRoot().search({ type: 'geometry', role: '3d' });
      const bubble = bubbles[0];
      if (!bubble) return null;
      return bubble;
    }

    var modelUrns = function () {
      Promise(loadManifest("urn:" + urn)
      ).then(docs => Promise.resolve(docs.map(getBubble))
      ).then(bubbles => view.setNodes(bubbles))
    }
  }
}

/*
function launchViewer(models) {
  if (!models || models.length <= 0)
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
  const viewerDiv = document.getElementById('forgeViewer');
  const view = new Autodesk.Viewing.AggregatedView();
  view.init(viewerDiv, options3d);
  const viewer = view.viewer;

  function loadManifest(documentId) {
    return new Promise((resolve, reject) => {
      const onDocumentLoadSuccess = (doc) => {
        doc.downloadAecModelData(() => resolve(doc));
      };
      Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, reject);
    });
  }

  var modelUrns = function () {
    const tasks = [];
    models.forEach(md => tasks.push(loadManifest("urn:" + md)));
    Promise.all(tasks)
      .then(docs => Promise.resolve(docs.map(doc => {
        const bubbles = doc.getRoot().search({ type: 'geometry', role: '3d' });
        const bubble = bubbles[0];
        if (!bubble) return null;

        return bubble;
      })))
      .then(bubbles => view.setNodes(bubbles));
  }

  Autodesk.Viewing.Initializer(options, modelUrns);

  function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
      res.json().then(data => {
        callback(data.access_token, data.expires_in);
      });
    });

  }
}

*/