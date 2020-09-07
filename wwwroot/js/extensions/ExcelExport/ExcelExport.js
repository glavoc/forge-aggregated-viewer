class ExcelExport extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
        this._panel = null;
    }

    load() {
        console.log('ExcelExport has been loaded');
        return true;
    }
    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        console.log('ExcelExport has been unloaded');
        return true;
    }
    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('allMyAwesomeExtensionsToolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
            this.viewer.toolbar.addControl(this._group);
        }
        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('ExcelExportButton');
        this._button.onClick = (ev) => {
            // Execute an action here
            // Check if the panel is created or not
            if (this._panel == null) {
                this._panel = new ExcelExport(this.viewer, this.viewer.container, 'ExcelExport', 'Export to Excel');
            }
            // Show/hide docking panel
            this._panel.setVisible(!this._panel.getVisible());

            // If panel is NOT visible, exit the function
            if (!this._panel.getVisible())
                return;

            this._button.setToolTip('Export wall parameters to Excel');
            this._button.addClass('ExcelExportIcon');
            this._group.addControl(this._button);
        }
    }
}
Autodesk.Viewing.theExtensionManager.registerExtension('ExcelExport', ExcelExport);

function XLSExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
  }
  
  XLSExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
  XLSExtension.prototype.constructor = XLSExtension;
  
  
    function statusCallback(completed, message) {
      $.notify(message, { className: "info", position:"bottom right" });
      $('#downloadExcel').prop("disabled", !completed);
    }
  
  
  XLSExtension.prototype.load = function () {
    var _viewer = this.viewer;
  
  
    // get Forge token (use your data:read endpoint here)
    // this sample is using client-side JavaScript only, so no
    // back-end that authenticate with Forge nor files, therefore
    // is using files from another sample. On your implementation,
    // you should replace this with your own Token endpoint
    function getForgeToken(callback) {
      jQuery.ajax({
        url: '/forge/oauth/token',
        success: function (oauth) {
          if (callback)
            callback(oauth.access_token, oauth.expires_in);
        }
      });
    }
  
  
    createUI = function () {
      // Button 1
      var button1 = new Autodesk.Viewing.UI.Button('toolbarXLS');
      button1.onClick = function (e) {
          ForgeXLS.downloadXLSX(documentId, fileName + ".xlsx", token, statusCallback, fileType );/*Optional*/
      };
      button1.addClass('toolbarXLSButton');
      button1.setToolTip('Export to .XLSX');
  
      // SubToolbar
      this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('myAppGroup1');
      this.subToolbar.addControl(button1);
  
      _viewer.toolbar.addControl(this.subToolbar);
    };
  
    createUI();
  
    return true;
  };
  
  
  XLSExtension.prototype.unload = function () {
    alert('XLSExtension is now unloaded!');
    return true;
  };
  
  Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Sample.XLSExtension', XLSExtension);