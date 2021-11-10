/** Class for Boilerplate H5P widget */
export default class CustomLibrarySelector {

  /**
   * @constructor
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;

    this.contentTypesToHide = [];

    this.field.customLibrarySelector = CustomLibrarySelector.extend(
      { hide: [] },
      this.field.customLibrarySelector || {}
    );

    // Callbacks to call when parameters change
    this.changes = [];

    // Let parent handle ready callbacks of children
    this.passReadies = true;

    // DOM
    this.$container = H5P.jQuery('<div>', {
      class: 'h5peditor-column'
    });

    // Instantiate original field (or create your own and call setValue)
    this.fieldInstance = new H5PEditor.widgets[this.field.type](this.parent, this.field, this.params, this.setValue);
    this.fieldInstance.appendTo(this.$container);

    // Errors (or add your own)
    this.$errors = this.$container.find('.h5p-errors');

    // Use H5PEditor.t('H5PEditor.CustomLibrarySelector', 'foo'); to output translatable strings

    if (this.fieldInstance.field?.options.length === 1) {
      return; // Only one option, don't do anything
    }

    this.selectDOM = this.fieldInstance.$select.get(0);
    this.selectDOM.setAttribute('disabled', 'disabled');

    // Wait for 1 minute max before giving up
    this.waitForChildren(this.selectDOM, () => {
      this.handleSelectDOMpopulated();
      this.handleSelectDOMReady();
    }, 100, 600);

    // Once gone, gone forever ...
    this.fieldInstance.change(() => {
      this.handleSelectDOMpopulated();
    });
  }

  /**
   * Handle select dom field ready.
   */
  handleSelectDOMReady() {
    this.selectDOM.removeAttribute('disabled');
  }

  /**
   * Handle select dom field populated with options.
   */
  handleSelectDOMpopulated() {
    // Remove options, first option is '-'
    for (let i = this.selectDOM.children.length - 1; i >= 1; i--) {
      const option = this.selectDOM.children[i].value.split(' ')[0];
      const currentMachineName = (this.params?.library) ?
        this.params.library.split(' ')[0] :
        '';

      if (
        this.field.customLibrarySelector.hide.includes(option) &&
        currentMachineName !== option // Keep if existing content
      ) {
        this.selectDOM.removeChild(this.selectDOM.children[i]);
      }
    }
  }

  /**
   * Wait for options to be loaded to DOM.
   * @param {HTMLElement} field Select field DOM.
   * @param {object} callback Callback function.
   * @param {number} [timeout=200] Timeout in seconds, minimum 100ms.
   * @param {number} [retries=100] Maximum number of retries.
   */
  waitForChildren(field, callback, timeout = 200, retries = 100) {
    if (typeof callback !== 'function' || !field) {
      return;
    }

    if (typeof timeout !== 'number' || timeout < 100) {
      timeout = 200;
    }

    if (typeof retries !== 'number') {
      retries = 100;
    }

    if (retries === 0) {
      this.handleSelectDOMReady();
      return; // Failed to load options
    }

    if (!field.children || field.children.length === 1) {
      setTimeout(() => {
        this.waitForChildren(field, callback, timeout, retries - 1);
      }, timeout);
    }
    else {
      callback();
    }
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    this.$container.appendTo($wrapper);
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @return {boolean} True, if current value is valid, else false.
   */
  validate() {
    return this.fieldInstance.validate();
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.remove();
  }

  /**
   * Extend an array just like JQuery's extend.
   * @param {object} arguments Objects to be merged.
   * @return {object} Merged objects.
   */
  static extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  }
}
