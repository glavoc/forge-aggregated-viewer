//this document gets and sets Forge token, clientid, 
//and handles sign in button


//this function is JQuery and will run only when DOM (Document Object Model)
//is ready for JS code to execute
//here we'll route client to oauthentication url
$(document).ready(function () {
  $.ajax({
    url: '/api/forge/oauth/token',
    success: function (res) {
      //got token, means user is signed in
      $('#signIn').hide();
      $('#signOut').show();
      // finally:
      prepareUserHubsTree();
      console.log($('#userHubs').jstree())
    }
  })

  $('#signIn').click(function () {
    //Perform an asynchronous HTTP (Ajax) request
    $.ajax({
      url: '/api/forge/oauth/url',
      //i thought that it'll redirect to url on success, but i'm wrong
      //!!!  further investigation needed
      success: function (url) {
        location.href = url;
      }
    })
  })

  $('#signOut').click(function () {
    location.href = '/api/forge/oauth/signout';
    $('#signOut').hide();
    $('#signIn').show();
  })

  $.getJSON("/api/forge/clientid", function (res) {
    $("#ClientID").val(res.id);
    $("#provisionAccountSave").click(function () {
      $('#provisionAccountModal').modal('toggle');
      $('#userHubs').jstree(true).refresh();
    });
  });

});

function prepareUserHubsTree() {
  var modelUrns = [];
  $('#userHubs').jstree({
    'core': {
      'themes': { "icons": true },
      'plugins': ["themes", "checkbox"],
      'multiple': false,
      'data': {
        "url": '/api/forge/datamanagement',
        "dataType": "json",
        'cache': false,
        'data': function (node) {
          $('#userHubs').jstree(true).toggle_node(node);
          return { "id": node.id };
        }
      }
    },
    'types': {
      'default': { 'icon': 'glyphicon glyphicon-question-sign' },
      '#': { 'icon': 'glyphicon glyphicon-user' },
      'hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png', a_attr: { class: "no_checkbox" } },
      'personalHub': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png', a_attr: { class: "no_checkbox" } },
      'bim360Hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png', a_attr: { class: "no_checkbox" } },
      'bim360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png', a_attr: { class: "no_checkbox" } },
      'a360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png', a_attr: { class: "no_checkbox" } },
      'folders': { 'icon': 'glyphicon glyphicon-folder-open', a_attr: { class: "no_checkbox" } },
      'items': { 'icon': 'glyphicon glyphicon-file', a_attr: { class: "no_checkbox" } },
      'bim360documents': { 'icon': 'glyphicon glyphicon-file', a_attr: { class: "no_checkbox" } },
      'versions': { 'icon': 'glyphicon glyphicon-time' },
      'unsupported': { 'icon': 'glyphicon glyphicon-ban-circle' }
    },
    'sort': function (a, b) {
      var a1 = this.get_node(a);
      var b1 = this.get_node(b);
      var parent = this.get_node(a1.parent);
      if (parent.type === 'items') { // sort by version number
        var id1 = Number.parseInt(a1.text.substring(a1.text.indexOf('v') + 1, a1.text.indexOf(':')))
        var id2 = Number.parseInt(b1.text.substring(b1.text.indexOf('v') + 1, b1.text.indexOf(':')));
        return id1 > id2 ? 1 : -1;
      }
      else if (a1.type !== b1.type) return a1.icon < b1.icon ? 1 : -1; // types are different inside folder, so sort by icon (files/folders)
      else return a1.text > b1.text ? 1 : -1; // basic name/text sort
    },
    'checkbox': {
      three_state: false,
      whole_node: false,    // should be set to false. otherwise checking the hidden checkbox
      // could be possible by clicking the node
      tie_selection: false, // necessary for whole_node to work
    },
    'plugins': ["types", "state", "sort", "checkbox"],
    'state': { "key": "autodeskHubs" }// key restore tree state
  }).each( function(){
    $("#userHubs").jstree().disable_node(this.id)
  }
  ).on("changed.jstree", function (evt, data) {
    if (data != null && data.node != null && (data.node.type == 'versions' || data.node.type == 'bim360documents')) {
      // in case the node.id contains a | then split into URN & viewableId
      var urn;
      if (data.node.id.indexOf('|') > -1) {
        urn = data.node.id.split('|')[1];
        var viewableId = data.node.id.split('|')[2];
        console.log(urn);
        launchViewer(urn, viewableId);
      }
      else {
        urn = data.node.id;
      }
      if (modelUrns.indexOf(urn) == -1) { modelUrns.push(urn); }
      else { modelUrns.pop(urn) }
      launchViewer(modelUrns);
    }
    else { //deselect parent nodes after selecting
      $('#userHubs').jstree(true).deselect_node(data.node);
      $('#userHubs').jstree(true).toggle_node(data.node);
    }
  });
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });

}

function launchViewer(models) {
  if (!models || models.length <= 0)
    return console.error('Empty model input');

  const options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };

  const options3d = {
    viewerConfig: {
      disableBimWalkInfoIcon: true
    }
  };

  function loadManifest(documentId) {
    return new Promise((resolve, reject) => {
      const onDocumentLoadSuccess = (doc) => {
        doc.downloadAecModelData(() => resolve(doc));
      };
      Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, reject);
    });
  }

  Autodesk.Viewing.Initializer(options, function () {
    //get the viewer div
    const viewerDiv = document.getElementById('forgeViewer');

    //initialize the viewer object
    const view = new Autodesk.Viewing.AggregatedView();
    view.init(viewerDiv, options3d);

    const viewer = view.viewer;

    const tasks = [];
    models.forEach(md => tasks.push(loadManifest(md.urn)));


    Promise.all(tasks)
      .then(docs => Promise.resolve(docs.map(doc => {
        const bubbles = doc.getRoot().search({ type: 'geometry', role: '3d' });
        const bubble = bubbles[0];
        if (!bubble) return null;

        return bubble;
      })))
      .then(bubbles => view.setNodes(bubbles));
  });
}


//toggle sidebar visibility
function openNav() {
  var navbarVisible = document.getElementById("userHubs").style.width;
  if (navbarVisible == "0px") {
    document.getElementById("projectNavigate").style.width = "400px";
    document.getElementById("userHubs").style.width = "360px";
    document.getElementById("userHubs").style.transition = "width 1s ease-in-out";
  }
  else {
    document.getElementById("projectNavigate").style.width = "40px";
    document.getElementById("userHubs").style.width = "0px";
    document.getElementById("userHubs").style.transition = "width 1s ease-in-out";
  }
}




