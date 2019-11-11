// Executive documents mutations
const CONFIGURE_APP = 'setConfig';
const SET_LOADING = 'setLoading';
const SET_PROJECT = 'setProject';
const SET_EXEC_DOCS = 'setExecutiveDocs';
const ADD_EXEC_DOC = 'addExecutiveDoc';
const EDIT_EXEC_DOC = 'editExecutiveDoc';
const SET_EXEC_DOCS_TYPES = 'setExecutiveDocTypes';
const REMOVE_EXEC_DOC = 'removeExecutiveDoc';
const INIT_STORE = 'initializeStore';
const SET_EXEC_DOCS_ARCHIVED = 'setExecDocArchived';
const SET_EXEC_DOCS_ARCHIVE_READY = 'setExecDocReadyToArchive';
const SET_SCAN_DATA = 'setScanData';

// Project documents mutations
const SET_LOADING_STATE = 'setLoading';
const UPLOAD_FILE = 'uploadFile';
const SET_PART_FILE_NAMES = 'setPartFileNames';
const SET_DOC_TYPE_PATTERN = 'setDocTypePatterns';
const CHANGE_FILE = 'changeFile';
const SAVE_FILE = 'setFileSaved';
const SET_PROJECT_ITEM = 'setProjectData';
const SET_FILE_ITEM_DATA = 'setFileItemData';
const SET_UPLOAD_MODE = 'setUploadMode';
const DELETE_FILE = 'deleteFile';
const SET_FILE_UNSAVED = 'setFileUnsaved';
const APPLY_CHANGES = 'applyChanges';
const SET_OPTIONS = 'setOptions';
const CANCEL_FILE_CHANGE = 'cancelFileChange';
const SET_EXPERT_QUEUE = 'setExpertQueue';

export default {
    CONFIGURE_APP,
    SET_LOADING,
    SET_PROJECT,
    SET_EXEC_DOCS,
    ADD_EXEC_DOC,
    SET_EXEC_DOCS_TYPES,
    REMOVE_EXEC_DOC,
    EDIT_EXEC_DOC,
    INIT_STORE,
    SET_EXEC_DOCS_ARCHIVED,
    SET_EXEC_DOCS_ARCHIVE_READY,
    SET_SCAN_DATA,
    // Project documents
    SET_LOADING_STATE,
    UPLOAD_FILE,
    SET_PART_FILE_NAMES,
    SET_DOC_TYPE_PATTERN,
    CHANGE_FILE,
    SAVE_FILE,
    SET_PROJECT_ITEM,
    SET_FILE_ITEM_DATA,
    SET_UPLOAD_MODE,
    DELETE_FILE,
    SET_FILE_UNSAVED,
    APPLY_CHANGES,
    SET_OPTIONS,
    CANCEL_FILE_CHANGE,
    SET_EXPERT_QUEUE,
};
