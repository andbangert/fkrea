declare interface VueSelectOptions {
    open?: boolean;
    /**
    * Contains the currently selected value. Very similar to a
    * `value` attribute on an <input>. You can listen for changes
    * using 'change' event using v-on
    * @type {Object||String||null}
    */
    value?:  Object | String | null;

    /**
     * An array of strings or objects to be used as dropdown choices.
     * If you are using an array of objects, vue-select will look for
     * a `label` key (ex. [{label?: 'This is Foo', value?: 'foo'}]). A
     * custom label key can be set with the `label` prop.
     * @type {Array}
     */
    options?: Array<any>;

    /**
     * Disable the entire component.
     * @type {Boolean}
     */
    disabled?:  boolean;

    /**
     * Can the user clear the selected property.
     * @type {Boolean}
     */
    clearable?:  boolean;

    /**
    * Sets the max-height property on the dropdown list.
    * @deprecated
    * @type {String}
    */
    maxHeight?:  string;

    /**
     * Enable/disable filtering the options.
     * @type {Boolean}
     */
    searchable?:  boolean;
    
    /**
     * Equivalent to the `multiple` attribute on a `<select>` input.
     * @type {Boolean}
     */
    multiple?:  boolean;
    
    /**
     * Equivalent to the `placeholder` attribute on an `<input>`.
     * @type {String}
     */
    placeholder?:  string;

        /**
     * Sets a Vue transition property on the `.dropdown-menu`. vue-select
     * does not include CSS for transitions, you'll need to add them yourself.
     * @type {String}
     */
    transition?:  string;

    /**
     * Enables/disables clearing the search text when an option is selected.
     * @type {Boolean}
     */
    clearSearchOnSelect?: boolean;

    /**
     * Close a dropdown when an option is chosen. Set to false to keep the dropdown
     * open (useful when combined with multi-select, for example)
     * @type {Boolean}
     */
    closeOnSelect?: boolean;

    /**
     * Tells vue-select what key to use when generating option
     * labels when each `option` is an object.
     * @type {String}
     */
    label?: string,


    /**
     * Value of the 'autocomplete' field of the input
     * element.
     * @type {String}
     */
    autocomplete?: string;

    /**
     * Tells vue-select what key to use when generating option
     * values when each `option` is an object.
     * @type {String}
     */
    index?: string | null;

    /**
     * Callback to generate the label text. If {option}
     * is an object, returns option[this.label] by default.
     *
     * Label text is used for filtering comparison and
     * displaying. If you only need to adjust the
     * display, you should use the `option` and
     * `selected-option` slots.
     *
     * @type {Function}
     * @param  {Object || String} option
     * @return {String}
     */
    getOptionLabel?: (option?: any | string) => any;

        /**
     * An optional callback function that is called each time the selected
     * value(s) change. When integrating with Vuex, use this callback to trigger
     * an action, rather than using :value.sync to retreive the selected value.
     * @type {Function}
     * @param {Object || String} val
     */
    onChange?: (val: Object | String) => void;

    onInput?: (val?: any) => void;

        /**
     * Select the current value if selectOnTab is enabled
     */
    onTab?: () => void;

    /**
     * Enable/disable creating options from searchInput.
     * @type {Boolean}
     */
    taggable?: boolean;

    /**
     * Set the tabindex for the input field.
     * @type {Number}
     */
    tabindex?:  number | null;

    /**
     * When true, newly created tags will be added to
     * the options list.
     * @type {Boolean}
     */
    pushTags?: boolean;

    /**
     * When true, existing options will be filtered
     * by the search text. Should not be used in conjunction
     * with taggable.
     * @type {Boolean}
     */
    filterable?: boolean;

    /**
     * Callback to determine if the provided option should
     * match the current search text. Used to determine
     * if the option should be displayed.
     * @type   {Function}
     * @param  {Object || String} option
     * @param  {String} label
     * @param  {String} search
     * @return {Boolean}
     */
    filterBy?: (option:any, label: string | number, search: string) => boolean;

    /**
     * Callback to filter results when search text
     * is provided. Default implementation loops
     * each option, and returns the result of
     * this.filterBy.
     * @type   {Function}
     * @param  {Array} list of options
     * @param  {String} search text
     * @param  {Object} vSelect instance
     * @return {Boolean}
     */
    filter?: (options: any, search: string) => boolean;

    /**
     * User defined function for adding Options
     * @type {Function}
     */
    createOption?: (newOption: any) => any;

    /**
     * When false, updating the options will not reset the select value
     * @type {Boolean}
     */
    resetOnOptionsChange?: boolean;

    /**
     * Disable the dropdown entirely.
     * @type {Boolean}
     */
    noDrop?: boolean;

    /**
     * Sets the id of the input element.
     * @type {String}
     * @default {null}
     */
    inputId?: string | null;

        /**
     * Sets RTL support. Accepts 'ltr', 'rtl', 'auto'.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
     * @type {String}
     * @default 'auto'
     */
    dir?: string;
    /**
     * When true, hitting the 'tab' key will select the current select value
     * @type {Boolean}
     */
    selectOnTab?: boolean;

    loading?: boolean;
    /**
     * Accept a callback function that will be
     * run when the search text changes.
     *
     * loading() accepts a boolean value, and can
     * be used to toggle a loading class from
     * the onSearch callback.
     *
     * @param {search}  String          Current search text
     * @param {loading} Function(bool)  Toggle loading class
     */
    onSearch?: (searchText: string, loading: (val: boolean) => void) => void;

    /**
     * when Multi true
     */
    valueAsArray?: Array<any> | null | undefined;
}