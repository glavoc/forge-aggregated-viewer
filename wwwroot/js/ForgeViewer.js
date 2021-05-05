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

$(document).ready(function () {
  // in case we want to load this app with a model pre-loaded
  var urn = getParameterByName('urn');
  if (urn !== null && urn !== '')
    launchViewer(urn);
});

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var viewer;


function launchViewer( models ) {
  if( !models || models.length <= 0 )
    return console.error( 'Empty model input' );

  const options = {
    env: 'AutodeskProduction',
    getAccessToken: fetchForgeToken
  };

  const options3d = {
    viewerConfig: {
      disableBimWalkInfoIcon: true
    }
  };

  function loadManifest( documentId ) {
    return new Promise(( resolve, reject ) => {
      const onDocumentLoadSuccess = ( doc ) => {
        doc.downloadAecModelData(() => resolve(doc));
      };
      Autodesk.Viewing.Document.load( documentId, onDocumentLoadSuccess, reject );
    });
  }

  Autodesk.Viewing.Initializer( options, function() {
    //get the viewer div
    const viewerDiv = document.getElementById( 'viewer' );

    //initialize the viewer object
    const view = new Autodesk.Viewing.AggregatedView();
    view.init( viewerDiv, options3d );

    const viewer = view.viewer;

    const tasks = [];
    models.forEach( md => tasks.push( loadManifest( md.urn ) ) );


    Promise.all(tasks)
            .then( docs =>  Promise.resolve( docs.map( doc => {
              const bubbles = doc.getRoot().search({type:'geometry', role: '3d'});
              const bubble = bubbles[0];
              if( !bubble ) return null;

              return bubble;
            })))
            .then( bubbles => view.setNodes( bubbles ) );
  });


  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
  
}

