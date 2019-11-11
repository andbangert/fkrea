// 

// Executive documents
const LOAD_PROJECT = 'loadProject';
const INIT_STATE = 'initState';
const LOAD_EXEC_DOCS = '';
const ADD_EXEC_DOC = 'addExecDoc';
const EDIT_EXEC_DOC = 'editExecDoc';
const REMOVE_EXEC_DOC = 'removeExecDoc';
const SCAN_ALL_EXEC_DOC = 'scanExecDocsForFile';
const SCAN_EXEC_DOC = 'scanExecDocByBarCode';
const SET_EXEC_DOCS_ARCHIVED = 'setExecDocArchived';
const SET_EXEC_DOCS_ARCHIVE_READY = 'setExecDocReadyToArchive';

// Project documents
const UPLOAD_FILES = 'uploadFiles';
const SET_DOC_TYPES = 'setDocTypes';
const GET_PART_FILE_NAMES = 'getPartFileNames';
const CHANGE_FILE_ACTION = 'changeFile';
const SAVE_FILE = 'saveFile';
const SAVE_FILES = 'saveFiles';
const SET_PROJECT_ITEM = 'setProjectItem';
const SET_FILE_ITEM_DATA = 'setFileItemData';
const EDIT_FILE_ITEM_DATA = 'editFile';
const FETCH_FILES = 'fetchFiles';
const SET_UPLOAD_MODE = 'setUploadMode';
const DELETE_FILE = 'deleteFile';
const SET_OPTIONS = 'setOptions';
const CANCEL_FILE_CHANGE = 'cancelFileChange';
const CANCEL_ALL_FILES_CHANGE = 'cancelAllFilesChange';
const SET_FILE_UNSAVED = 'setFileUnsaved';
const GET_DOWNLOAD_QUEUE = 'getDownloadQueue';
// Expert docs
const SET_DOWNLOAD_QUEUE = 'setProjectToUploadQueue';


export default {
    // Executive documents
    LOAD_PROJECT,
    LOAD_EXEC_DOCS,
    ADD_EXEC_DOC,
    INIT_STATE,
    EDIT_EXEC_DOC,
    REMOVE_EXEC_DOC,
    SCAN_EXEC_DOC,
    SCAN_ALL_EXEC_DOC,
    SET_EXEC_DOCS_ARCHIVED,
    SET_EXEC_DOCS_ARCHIVE_READY,

    // Project Documents
    SET_OPTIONS,
    SAVE_FILE,
    SAVE_FILES,
    UPLOAD_FILES,
    SET_DOC_TYPES,
    GET_PART_FILE_NAMES,
    CHANGE_FILE_ACTION,
    SET_PROJECT_ITEM,
    SET_FILE_ITEM_DATA,
    EDIT_FILE_ITEM_DATA,
    FETCH_FILES,
    SET_UPLOAD_MODE,
    DELETE_FILE,
    SET_FILE_UNSAVED,
    CANCEL_FILE_CHANGE,
    CANCEL_ALL_FILES_CHANGE,

    // Expert Documents
    SET_DOWNLOAD_QUEUE,
    GET_DOWNLOAD_QUEUE,
}
