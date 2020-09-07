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


});

function prepareUserHubsTree() {
  $('#userHubs').jstree({
    'core': {
      'themes': { "icons": true },
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
      'hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'personalHub': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'bim360Hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png' },
      'bim360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png' },
      'a360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png' },
      'folders': { 'icon': 'glyphicon glyphicon-folder-open' },
      'items': { 'icon': 'glyphicon glyphicon-file' },
      'bim360documents': { 'icon': 'glyphicon glyphicon-file' },
      'versions': { 'icon': 'glyphicon glyphicon-time' },
      'unsupported': { 'icon': 'glyphicon glyphicon-ban-circle' }
    },
    "sort": function (a, b) {
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
    "plugins": ["types", "state", "sort"],
    "state": { "key": "autodeskHubs" }// key restore tree state
  }).bind("activate_node.jstree", function (evt, data) {
    if (data != null && data.node != null && (data.node.type == 'versions' || data.node.type == 'bim360documents')) {
      // in case the node.id contains a | then split into URN & viewableId
      if (data.node.id.indexOf('|') > -1) {
        var urn = data.node.id.split('|')[1];
        var viewableId = data.node.id.split('|')[2];
        launchViewer(urn, viewableId);
      }
      else {
        launchViewer(data.node.id);
      }
    }
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



