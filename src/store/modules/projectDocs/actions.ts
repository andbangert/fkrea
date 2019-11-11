import actionTypes from '@/store/action-types';
import mutationTypes from '@/store/mutation-types';
import { ActionTree } from 'vuex';
import {
    RootState,
    DocTypeSearchPattern,
    DocType,
    ItemData,
    StateFile,
    UploadMode,
    AppOptions,
    ProjectDocsState,
    ExpertDocsQueue,
    FieldValueCollection,
} from '@/types';
import { SPDataService } from '@/utils';
import { createOrUpdateItem } from '@/utilities';
import { FieldNames } from '@/constants';
import CamlBuilder, { IFieldExpression, ITextFieldExpression } from 'camljs';
import {
    getItemById,
    getItemsByQuery,
    createBatchItems,
    dateToFormString
} from '@/utilities';

export const actions: ActionTree<ProjectDocsState, RootState> = {
    async [actionTypes.SET_DOWNLOAD_QUEUE]({ commit, dispatch, state, rootState }, expertNum) {
        if (!rootState.projectSiteSettings) {
            throw new Error('rootState.projectSiteSettings should be set.');
        }
        if (!rootState.projectSiteSettings.serverRelativeUrl) {
            throw new Error('rootState.projectSiteSettings.serverRelativeUrl should be set.');
        }
        if (!rootState.projectSiteSettings.projectExpertCardsListId) {
            throw new Error('rootState.projectSiteSettings.projectDocsfolderUrl should be set.');
        }
        if (!rootState.project) {
            throw new Error('rootState.projectSiteSettings.projectDocsfolderUrl should be set.');
        }
        const values: FieldValueCollection = {
            [FieldNames.FieldNumber]: expertNum,
            [FieldNames.FieldTitle]: `${rootState.project.title} ${expertNum}`,
            [FieldNames.FieldQueued]: true,
            [FieldNames.FieldProject]: rootState.project.id,
        };
        const listId = rootState.projectSiteSettings.projectExpertCardsListId;
        const siteUrl = rootState.projectSiteSettings.siteUrl;
        const item = await createOrUpdateItem(siteUrl, listId, 0, values);
        const flds = item.get_fieldValues();
        const expertQueue: ExpertDocsQueue = {
            downloaded: flds[FieldNames.FieldDownloaded],
            queued: flds[FieldNames.FieldQueued],
            hasError: flds[FieldNames.FieldHasError],
            number: flds[FieldNames.FieldNumber],
        };
        commit(mutationTypes.SET_EXPERT_QUEUE, expertQueue);
    },
    async [actionTypes.GET_DOWNLOAD_QUEUE]({ commit, dispatch, state, rootState }) {
        if (!rootState.projectSiteSettings) {
            throw new Error('rootState.projectSiteSettings should be set.');
        }
        if (!rootState.projectSiteSettings.serverRelativeUrl) {
            throw new Error('rootState.projectSiteSettings.serverRelativeUrl should be set.');
        }
        if (!rootState.projectSiteSettings.projectExpertCardsListId) {
            throw new Error('rootState.projectSiteSettings.projectDocsfolderUrl should be set.');
        }
        if (!rootState.project) {
            throw new Error('rootState.projectSiteSettings.projectDocsfolderUrl should be set.');
        }
        const listId = rootState.projectSiteSettings.projectExpertCardsListId;
        const siteUrl = rootState.projectSiteSettings.siteUrl;
        const caml = new CamlBuilder()
            .View()
            .RowLimit(200, false)
            .Query()
            .Where()
            .LookupField(FieldNames.FieldProject).Id().EqualTo(rootState.project.id)
            .OrderBy(FieldNames.FieldTitle)
            .ToString();
        const expertItems = await getItemsByQuery(siteUrl, listId, caml);
        if (expertItems && expertItems.data && expertItems.data.length > 0) {
            const item = expertItems.data[0];
            const flds = item.get_fieldValues();
            const expertQueue: ExpertDocsQueue = {
                downloaded: flds[FieldNames.FieldDownloaded],
                queued: flds[FieldNames.FieldQueued],
                hasError: flds[FieldNames.FieldHasError],
                number: flds[FieldNames.FieldNumber],
            };
            commit(mutationTypes.SET_EXPERT_QUEUE, expertQueue);
        }
    },
    async [actionTypes.FETCH_FILES]({ commit, dispatch, state, rootState }) {
        // console.log("Fetch files");
        if (!rootState.projectSiteSettings) {
            throw new Error('rootState.projectSiteSettings should be set.');
        }
        if (!rootState.projectSiteSettings.serverRelativeUrl) {
            throw new Error('rootState.projectSiteSettings.serverRelativeUrl should be set.');
        }
        if (!rootState.projectSiteSettings.projectDocsfolderUrl) {
            throw new Error('rootState.projectSiteSettings.projectDocsfolderUrl should be set.');
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            throw new Error('rootState.projectSiteSettings.siteUrl should be set.');
        }
        if (!rootState.project) {
            throw new Error('!rootState.project should be set.');
        }

        let folderUrl = rootState.project.projectPathFolder ? rootState.project.projectPathFolder : '';
        folderUrl = `${rootState.projectSiteSettings.serverRelativeUrl}${folderUrl}`;
        const siteUrl = rootState.projectSiteSettings.serverRelativeUrl;
        const files = await SPDataService.Current().getFiles(siteUrl, folderUrl);
        const getExpertDocsQueue = dispatch(actionTypes.GET_DOWNLOAD_QUEUE);
        if (!state.docTypes) {
            throw Error('docTypes must be initialized first.');
        }
        if (files && files.get_count() > 0) {
            const num = files.get_count();
            const iterator = files.getEnumerator();
            const sfarr: StateFile[] = new Array<StateFile>(num);

            while (iterator.moveNext()) {
                const file: SP.File = iterator.get_current();
                const item: SP.ListItem = file.get_listItemAllFields();
                const itemId = item.get_id();
                const mjversion = file.get_majorVersion();
                const mnversion = file.get_minorVersion();
                const checkinComment = item.get_item(FieldNames.FieldComment); // file.get_checkInComment();
                const serverRelativeUrl = file.get_serverRelativeUrl();
                const fileName = file.get_name();
                const docType: SP.FieldLookupValue = item.get_item(FieldNames.FieldPartName) as SP.FieldLookupValue;
                const lastModified: Date = item.get_item(FieldNames.FieldModified) as Date;
                const icon = await SPDataService.mapToIcon(rootState.projectSiteSettings.serverRelativeUrl,
                    fileName, SP.Utilities.IconSize.size16);
                const fileSize = item.get_item(FieldNames.FieldFileSize);

                const dtId = docType ? docType.get_lookupId() : -1;
                const dtv: DocType | undefined = state.docTypes.find((d) => d.id === dtId);

                // then commit
                commit(mutationTypes.UPLOAD_FILE, {
                    id: itemId,
                    majorVersion: mjversion,
                    minorVersion: mnversion,
                    checkinComment, // : checkinComment,
                    serverRelativeUrl, // : serverRelativeUrl,
                    fileName, // : fileName,
                    lastModified, // : lastModified,
                    overwrite: false,
                    docType: dtv ? dtv : { id: -1, title: '' },
                    iconUrl: icon,
                    saved: true,
                    fileSize, // : fileSize,
                    info: checkinComment,
                });
                // Set Item
                await dispatch(actionTypes.SET_FILE_ITEM_DATA,
                    {
                        fileName, // : fileName,
                        itemId, // : itemId,
                        docType, // : docType,
                    });
            }
        }
        // end promise expert documents.
        try {
            await getExpertDocsQueue;
        }
        catch (e) {
            console.error(e);
        }
    },
    // Upload files
    [actionTypes.UPLOAD_FILES]({ commit, dispatch, state, rootState }, payload: {
        files: FileElement[], folderUrl: string,
    }) {
        console.log("Upload files");
        if (!rootState.projectSiteSettings) {
            throw new Error('rootState.projectSiteSettings should be set.');
        }
        if (!rootState.projectSiteSettings.serverRelativeUrl) {
            throw new Error('rootState.projectSiteSettings.serverRelativeUrl should be set.');
        }
        if (!rootState.projectSiteSettings.projectDocsfolderUrl) {
            throw new Error('rootState.projectSiteSettings.projectDocsfolderUrl should be set.');
        }
        if (!rootState.project) {
            throw new Error('!rootState.project should be set.');
        }

        let folderUrl = rootState.project.projectPathFolder;
        folderUrl = `${rootState.projectSiteSettings.serverRelativeUrl}${folderUrl}`;
        const files = payload.files;
        const siteUrl = rootState.projectSiteSettings.serverRelativeUrl;
        if (files && files.length !== 0) {
            files.sort((ele1, ele2) => {
                if (ele1.fileName > ele2.fileName) {
                    return 1;
                }
                if (ele1.fileName < ele2.fileName) {
                    return -1;
                }
                return 0;
            }).forEach(async (element) => {
                // Define default document type by name.
                let docTypeId: number = -1;
                if (state.docTypeSearchPatterns && state.docTypeSearchPatterns.length > 0) {
                    for (let i = 0; i < state.docTypeSearchPatterns.length; i++) {
                        const p = state.docTypeSearchPatterns[i].pattern;
                        if (element.fileName.indexOf(p, 0) === 0) {
                            docTypeId = state.docTypeSearchPatterns[i].itemId;
                            break;
                        }
                        // StartsWith conflicts with MS Ajax.
                        // if (element.fileName.startsWith(p, undefined)) {
                        //     docTypeId = state.docTypeSearchPatterns[i].itemId;
                        //     break;
                        // }
                    }
                }
                let docType: DocType = { id: -1, title: '' };
                if (state.docTypes && state.docTypes.length) {
                    const doctc = state.docTypes.find((docTypeElement) => {
                        return docTypeElement.id === docTypeId;
                    });
                    docType = doctc ? doctc : { id: -1, title: '' };
                }

                const fileUrl = `${folderUrl}/${element.fileName}`;
                // Element
                const prfile = SPDataService.Current().getFile(siteUrl, fileUrl);
                // fetch uploaded file
                prfile.then((a) => {
                    const itemId = a.listItem.get_id();
                    const mjversion = a.file.get_majorVersion();
                    const mnversion = a.file.get_minorVersion();
                    const checkinComment = a.file.get_checkInComment();
                    const serverRelativeUrl = a.file.get_serverRelativeUrl();
                    // then commit
                    commit(mutationTypes.UPLOAD_FILE, {
                        id: itemId,
                        majorVersion: mjversion,
                        minorVersion: mnversion,
                        checkinComment, // : checkinComment,
                        serverRelativeUrl, // : serverRelativeUrl,
                        fileName: element.fileName,
                        lastModified: new Date(element.droppedFile.lastModified),
                        overwrite: element.overwrite,
                        docType, // : docType,
                        changedDocType: docType,
                        changedInfo: checkinComment,
                        iconUrl: a.iconUrl,
                        fileSize: element.fileSize,
                        saved: false
                    });

                    let dtv; // = undefined;
                    if (docType.id > 0) {
                        dtv = new SP.FieldLookupValue();
                        dtv.set_lookupId(docType.id);
                    }

                    dispatch(actionTypes.SET_FILE_ITEM_DATA,
                        {
                            fileName: element.fileName,
                            itemId, // : itemId,
                            docType: dtv,
                        });
                }).catch((e) => {
                    throw e;
                });
            });
        }
    },
    [actionTypes.SET_FILE_ITEM_DATA]({ commit, state, rootState }, payload: {
        fileName: string, itemId: number, docType: SP.FieldLookupValue, comment: string,
    }) {
        if (rootState.project) {
            const projcard = new SP.FieldLookupValue();
            projcard.set_lookupId(rootState.project.id);

            const buildObject = new Array<SP.FieldLookupValue>();

            if (rootState.project && rootState.project.buildObject && rootState.project.buildObject.length > 0) {
                rootState.project.buildObject.forEach((bo) => {
                    const lv = new SP.FieldLookupValue();
                    lv.set_lookupId(bo.LookupId);
                    buildObject.push(lv);
                });
            }
            const item: ItemData = {
                id: payload.itemId,
                [FieldNames.FieldProjectCardID]: projcard,
                [FieldNames.FieldComment]: payload.comment,
                [FieldNames.FieldBuildObjForFile]: buildObject,
                // state.projectItem[FieldNames.BuildObj],
            };

            if (payload.docType) {
                item[FieldNames.FieldPartName] = payload.docType;
            }
            commit(mutationTypes.SET_FILE_ITEM_DATA, { fileName: payload.fileName, item });
        }
    },
    async [actionTypes.SET_DOC_TYPES]({ commit, state, rootState }) {
        if (!rootState.projectSiteSettings) {
            throw Error('rootState.projectSiteSettings');
        }
        if (!rootState.projectSiteSettings.projectDocsDocPartNameListId) {
            throw Error('rootState.projectSiteSettings.projectDocsDocPartNameListId');
        }
        if (!rootState.projectSiteSettings.serverRelativeUrl) {
            throw Error('rootState.projectSiteSettings.serverRelativeUrl');
        }
        // Initialize Doc Types
        const spsvc = new SPDataService();
        const dct = await spsvc.getItemsAsync(rootState.projectSiteSettings.serverRelativeUrl,
            rootState.projectSiteSettings.projectDocsDocPartNameListId, {
            query: '<Query><OrderBy><FieldRef Name="PartNum" Ascending="True" /></OrderBy></Query>',
        });
        // 
        const items = dct.items; // new Array<SP.ListItem>();
        const docTypePatterns = new Array<DocTypeSearchPattern>();
        const docTypes = new Array<DocType>();
        // Add default empty DocType
        docTypes.push({ id: -1, title: '', sortNum: -1 });
        items.forEach((element) => {
            // Get pattern string from listitem
            const pnum: string = element.get_item('PartNum');
            const pnums: string[] = pnum.split('.');

            docTypes.push({
                id: element.get_id(),
                title: element.get_item('Title'),
                partNum: pnum,
                sortNum: pnums && pnums.length > 0 ? Number(pnums[0]) : Number(0),
            });
            const pattern: string = element.get_item('SearchPattern');
            if (pattern && pattern !== '') {
                // Split pattern string
                const patterns = pattern.split(';') as string[];
                if (patterns !== null && patterns.length > 0) {
                    const id = element.get_id();
                    patterns.forEach((p) => {
                        if (p !== '') {
                            docTypePatterns.push({ itemId: id, pattern: p });
                        }
                    });
                }
            }
        });
        commit(mutationTypes.SET_DOC_TYPE_PATTERN, docTypePatterns);
        commit(mutationTypes.SET_PART_FILE_NAMES, docTypes.
            // Sort by number
            sort((a, b) => {
                const an: number = Number(a.sortNum);
                const bn: number = Number(b.sortNum);
                if (an > bn) {
                    return 1;
                }
                if (an < bn) {
                    return -1;
                }
                if (an === bn) {
                    return 0;
                }
                return -1;
            }));
    },
    [actionTypes.CHANGE_FILE_ACTION]({ commit, state }, payload: {
        fileName: string, docType: DocType, info?: string,
    }) {
        const file = state.files.find((f) => f.fileName === payload.fileName);
        if (!file) {
            throw new Error('File can not be null!');
        }
        commit(mutationTypes.CHANGE_FILE, payload);
    },
    [actionTypes.SAVE_FILE]({ commit, state, rootState }, payload: {
        checkinType: SP.CheckinType, file: StateFile,
    }) {
        if (!rootState.projectSiteSettings) {
            throw new Error('rootState.projectSiteSettings should be set.');
        }

        if (!rootState.projectSiteSettings.serverRelativeUrl) {
            throw new Error('rootState.projectSiteSettings.serverRelativeUrl should be set.');
        }

        if (!rootState.projectSiteSettings.projectDocLibListId) {
            throw new Error('rootState.projectSiteSettings.projectDocLibListId should be set.');
        }

        if (!payload.file.saved) {
            // Apply changes first.
            commit(mutationTypes.APPLY_CHANGES, payload.file);
            SPDataService.Current().saveFile(
                rootState.projectSiteSettings.serverRelativeUrl,
                rootState.projectSiteSettings.projectDocLibListId,
                payload.file,
                payload.checkinType,
            ).then((f) => {
                commit(mutationTypes.SAVE_FILE, payload.file);
            }).catch((e) => {
                throw e;
            });
        }
    },
    [actionTypes.SAVE_FILES]({ commit, dispatch, state, rootState }, payload: {
        checkinType: SP.CheckinType,
    }) {
        if (!rootState.projectSiteSettings) {
            throw new Error('rootState.projectSiteSettings should be set.');
        }

        if (!rootState.projectSiteSettings.serverRelativeUrl) {
            throw new Error('rootState.projectSiteSettings.serverRelativeUrl should be set.');
        }

        if (!rootState.projectSiteSettings.projectDocLibListId) {
            throw new Error('rootState.projectSiteSettings.projectDocLibListId should be set.');
        }

        const siteUrl = rootState.projectSiteSettings.serverRelativeUrl;
        const listId = rootState.projectSiteSettings.projectDocLibListId;
        if (state.files && state.files.length > 0) {
            state.files.forEach((file) => {
                if (!file.saved) {
                    // Apply changes first.
                    commit(mutationTypes.APPLY_CHANGES, file);
                    SPDataService.Current().saveFile(
                        siteUrl,
                        listId,
                        file,
                        payload.checkinType,
                    ).then((f) => {
                        commit(mutationTypes.SAVE_FILE, file);
                    }).catch((e) => {
                        throw e;
                    });
                }
            });
            // Upload mode should be saved!
            dispatch(actionTypes.SET_UPLOAD_MODE, UploadMode.New);
        }
    },
    [actionTypes.SET_PROJECT_ITEM]({ commit, state }, item: SP.ListItem) {
        const project: ItemData = {
            id: item.get_id(),
        };
        const oi = item.get_fieldValues();
        Object.keys(item.get_fieldValues()).forEach((key) => {
            if (key !== 'id') {
                project[key] = oi[key];
            }
        });
        commit(mutationTypes.SET_PROJECT_ITEM, project);
    },
    [actionTypes.SET_UPLOAD_MODE]({ commit }, mode: UploadMode) {
        if (mode !== UploadMode.Unknown) {
            commit(mutationTypes.SET_UPLOAD_MODE, mode);
        } else {
            throw new Error('Unknown Upload mode');
        }
    },
    async [actionTypes.DELETE_FILE]({ commit, state, rootState }, file: StateFile) {
        if (!rootState.projectSiteSettings) {
            throw new ReferenceError('rootState.projectSiteSettings can not be null or undefined.');
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            throw new ReferenceError('rootState.projectSiteSettings.siteUrl can not be null or undefined.');
        }
        if (!file) {
            throw new ReferenceError('File can not be null or undefined.');
        }
        const sf = state.files.find((f) => f.fileName === file.fileName);
        if (!sf) {
            throw new ReferenceError('File with name ' + file.fileName +
                'does not exists in collection.');
        }
        await SPDataService.Current().deleteFile(rootState.projectSiteSettings.siteUrl, file.serverRelativeUrl);
        commit(mutationTypes.DELETE_FILE, { file });
    },
    [actionTypes.SET_OPTIONS]({ commit, state }, options: AppOptions) {
        commit(mutationTypes.SET_OPTIONS, options);
    },
    [actionTypes.CANCEL_FILE_CHANGE]({ commit, state }, fileName: string) {
        commit(mutationTypes.CANCEL_FILE_CHANGE, fileName);
    },
    [actionTypes.CANCEL_ALL_FILES_CHANGE]({ commit, state }, files: StateFile[]) {
        if (files && files.length > 0) {
            files.forEach((f) => {
                commit(mutationTypes.CANCEL_FILE_CHANGE, f.fileName);
            });
        } else {
            throw new Error('Argument Exception: files should be set.');
        }
    },
    [actionTypes.SET_FILE_UNSAVED]({ commit, state }, fileName: string) {
        commit(mutationTypes.SET_FILE_UNSAVED, fileName);
    },
};
