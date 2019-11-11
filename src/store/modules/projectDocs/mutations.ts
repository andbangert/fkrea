import types from '@/store/mutation-types';
import {
    ProjectDocsState,
    StateFile,
    DocTypeSearchPattern,
    DocType,
    ItemData,
    UploadMode,
    ExpertDocsQueue,
} from '@/types';
import { Fields } from '@/utils/constants';
import Vue from 'vue';

export const mutations = {
    [types.SET_EXPERT_QUEUE](state: ProjectDocsState, expertDocs: ExpertDocsQueue) {
        Vue.set(state, 'expertDocsQueue', expertDocs);
    },
    [types.UPLOAD_FILE](state: ProjectDocsState, stateFile: StateFile) {
        // console.log('Mutation upload file');
        // console.log(stateFile);
        const oldFile = state.files.find((f) => f.fileName === stateFile.fileName);
        // if (stateFile.file.overwrite) {
        if (stateFile.overwrite) {
            if (oldFile) {
                // just oerwrite file
                oldFile.changed = true;
                oldFile.saved = false;
                oldFile.lastModified = stateFile.lastModified;
                oldFile.majorVersion = stateFile.majorVersion;
                oldFile.minorVersion = stateFile.minorVersion;
                oldFile.fileSize = stateFile.fileSize;
                // oldFile.file = stateFile.file;
            } else {
                stateFile.changed = true;
                stateFile.saved = false;
                state.files.push(stateFile);
            }
        } else if (!oldFile) {
            stateFile.changed = true;
            // stateFile.saved = false;
            state.files.push(stateFile);
        }
    },
    [types.SET_PART_FILE_NAMES](state: ProjectDocsState, items: DocType[]) {
        state.docTypes = items;
    },
    [types.SET_DOC_TYPE_PATTERN](state: ProjectDocsState, docTypePatterns: DocTypeSearchPattern[]) {
        state.docTypeSearchPatterns = docTypePatterns;
    },
    [types.CHANGE_FILE](state: ProjectDocsState, payload: { fileName: string, docType: DocType, info?: string }) {
        const file = state.files.find((f) => f.fileName === payload.fileName);
        if (!file) {
            throw new Error('File can not be null!');
        }
        if (file.docType.id !== payload.docType.id) {
            file.changedDocType = payload.docType;
            file.changed = true;
            file.saved = false;
        }

        if (file.info !== payload.info) {
            file.changedInfo = payload.info;
            file.changed = true;
            file.saved = false;
        }
    },
    [types.SAVE_FILE](state: ProjectDocsState, file: StateFile) {
        console.log('Mutatio save file.')
        const sf = state.files.find((f) => f.fileName === file.fileName);
        console.log('Mutatio save file.')
        if (!sf) {
            throw new Error('File can not be undefined or null!');
        }

        sf.majorVersion += 1;
        sf.minorVersion = 0;
        sf.changed = false;
        sf.saved = true;
    },
    [types.SET_PROJECT_ITEM](state: ProjectDocsState, project: ItemData) {
        Vue.set(state, 'projectItem', project);
    },
    [types.SET_FILE_ITEM_DATA](state: ProjectDocsState, payload: { fileName: string, item: ItemData }) {
        const file = state.files.find((f) => f.fileName === payload.fileName);
        if (!file) {
            throw new Error('File can not be null!');
        }
        Vue.set(file, 'item', payload.item);
        // file.item = payload.item;
    },
    [types.SET_UPLOAD_MODE](state: ProjectDocsState, mode: UploadMode) {
        if (mode !== UploadMode.Unknown) {
            state.mode = mode;
        } else {
            throw new Error('Unknown Upload mode');
        }
    },
    [types.DELETE_FILE](state: ProjectDocsState, payload: { file: StateFile }) {
        const sf = state.files.find((f) => f.fileName === payload.file.fileName);
        if (!sf) {
            throw new Error('File with name ' + payload.file.fileName +
                ' could not be found in the collection.');
        }
        const index = state.files.indexOf(sf);
        state.files.splice(index, 1);
    },
    [types.SET_FILE_UNSAVED](state: ProjectDocsState, fileName: string) {
        const sf = state.files.find((f) => f.fileName === fileName);
        if (!sf) {
            throw new Error('File with name ' + fileName +
                ' could not be found in the collection.');
        }
        sf.saved = false;
    },
    [types.APPLY_CHANGES](state: ProjectDocsState, payload: StateFile) {
        const file = state.files.find((f) => f.fileName === payload.fileName);
        if (!file) {
            throw new Error('File can not be null!');
        }
        if (payload.changedDocType && file.docType.id !== payload.changedDocType.id) { // ERROR HERE
            file.docType = payload.changedDocType;
            if (file.docType.id <= 0) {
                Vue.set(file.item, Fields.PartName, null);
            } else {
                const lv = file.item[Fields.PartName] as SP.FieldLookupValue;
                if (lv) {
                    lv.set_lookupId(payload.docType.id);
                } else {
                    const pn = new SP.FieldLookupValue();
                    pn.set_lookupId(payload.docType.id);
                    Vue.set(file.item, Fields.PartName, pn);
                }
            }
        }

        if (file.info !== payload.changedInfo) {
            file.info = payload.changedInfo;
            file.checkinComment = payload.changedInfo;
            Vue.set(file.item, Fields.Comment, file.info);
        }
    },
    [types.CANCEL_FILE_CHANGE](state: ProjectDocsState, fileName: string) {
        const file = state.files.find((f) => f.fileName === fileName);
        if(!file) {
            throw new Error('File can not be null!');
        }
        file.changed = false;
        file.saved = true;
    },
};
