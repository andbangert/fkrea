import { ActionTree } from 'vuex';
import types from '@/store/action-types';
import mutations from '@/store/mutation-types';
import {
    ExecutiveDocsState,
    RootState,
    ExecutiveDocument,
    IndexedExecDocs,
    IndexedExecDocsTypes,
    SelectLookupValue,
} from '@/types';
import { getExecutiveDocs, getExecutiveDocTypes, addExecutiveDoc, scanForDocuments } from '@/docHelper';
import { removeListItemById } from '@/utilities';
import { FieldNames } from '@/constants';

export const actions: ActionTree<ExecutiveDocsState, RootState> = {
    async [types.LOAD_EXEC_DOCS]({ commit, dispatch, state, rootState }) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }
        if (!rootState.project) {
            return;
        }

        // Initialize documents
        const docs = await getExecutiveDocs(
            rootState.projectSiteSettings.siteUrl,
            rootState.projectSiteSettings.executiveDocCardsListId,
            rootState.project.id);

        commit(mutations.SET_EXEC_DOCS, { docs });
    },
    async [types.ADD_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }
        const file = await addExecutiveDoc(
            rootState.projectSiteSettings.siteUrl,
            rootState.projectSiteSettings.executiveDocCardsListId,
            doc,
        );
        commit(mutations.ADD_EXEC_DOC, [file]);
    },
    async [types.EDIT_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }

        const file = await addExecutiveDoc(
            rootState.projectSiteSettings.siteUrl,
            rootState.projectSiteSettings.executiveDocCardsListId,
            doc,
        );

        if (file && file.id > 0) {
            commit(mutations.EDIT_EXEC_DOC, file);
        }
    },
    async [types.REMOVE_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
        if (!rootState.projectSiteSettings) {
            return;
        }
        if (!rootState.projectSiteSettings.siteUrl) {
            return;
        }
        if (!rootState.projectSiteSettings.executiveDocCardsListId) {
            return;
        }

        if (doc.required) {
            const execDocEmpty: ExecutiveDocument = {
                id: doc.id,
                title: doc.title,
                required: true,
                docTypeId: doc.docTypeId,
                docTypeName: doc.docTypeName,
                hasRemarks: false,
                jobTypeId: doc.jobTypeId,
                projectId: doc.projectId,
                changed: false,
                barCode: '',
                comment: '',
                formType: '',
                remarks: '',
                scanDate: null,
                scanLink: '',
                scanSize: 0,
            };
            try {
                const newDoc = await addExecutiveDoc(
                    rootState.projectSiteSettings.siteUrl,
                    rootState.projectSiteSettings.executiveDocCardsListId,
                    execDocEmpty, false);
                commit(mutations.EDIT_EXEC_DOC, newDoc);
            }
            catch (e) {
                console.error(e);
            }
        } else {
            await removeListItemById(
                rootState.projectSiteSettings.siteUrl,
                rootState.projectSiteSettings.executiveDocCardsListId,
                doc.id);
            commit(mutations.REMOVE_EXEC_DOC, doc);
        }
    },
    async [types.SCAN_EXEC_DOC]({ commit, dispatch, state, rootState }, barCode: string) {
        if (!rootState.project) {
            return;
        }
        if (!rootState.project.jobTypes) {
            return;
        }
        if (barCode === '') {
            return [];
        }

        const bc = barCode + '.pdf';
        const docs = [];
        if (rootState.projectSiteSettings &&
            rootState.projectSiteSettings.siteUrl &&
            rootState.projectSiteSettings.executiveDocLibListId) {
            const files = await scanForDocuments(
                rootState.projectSiteSettings.siteUrl,
                rootState.projectSiteSettings.executiveDocLibListId,
                FieldNames.FieldFileLeafRef,
                [bc]);
            if (files.length) {
                docs.push(...files);
            }
        }

        if (rootState.archiveSiteSettings &&
            rootState.archiveSiteSettings.siteUrl &&
            rootState.archiveSiteSettings.scanDocLibListId) {
            const files = await scanForDocuments(
                rootState.archiveSiteSettings.siteUrl,
                rootState.archiveSiteSettings.scanDocLibListId,
                FieldNames.FieldFileLeafRef,
                [bc]);
            if (files.length) {
                docs.push(...files);
            }
        }
        return docs;
    },
    async [types.SCAN_ALL_EXEC_DOC]({ commit, dispatch, state, rootState }) {
        if (!rootState.project) {
            return;
        }
        if (!rootState.project.jobTypes) {
            return;
        }

        const barCodes: string[] = [];
        rootState.project.jobTypes.forEach((jt) => {
            const arr = state.documents.filter((d) => d.jobTypeId === jt.LookupId); //state.groupedDocs[jt.LookupId];
            // arr.filter((d) => d.barCode && d.scanLink);
            arr.forEach((d) => {
                if (d.barCode && !d.scanLink) {
                    barCodes.push(d.barCode + '.pdf');
                }
            });
        });

        const docs = [];
        if (rootState.projectSiteSettings &&
            rootState.projectSiteSettings.siteUrl &&
            rootState.projectSiteSettings.executiveDocLibListId) {
            const files = await scanForDocuments(
                rootState.projectSiteSettings.siteUrl,
                rootState.projectSiteSettings.executiveDocLibListId,
                FieldNames.FieldFileLeafRef,
                barCodes);
            if (files.length) {
                docs.push(...files);
            }
        }

        if (rootState.archiveSiteSettings &&
            rootState.archiveSiteSettings.siteUrl &&
            rootState.archiveSiteSettings.scanDocLibListId) {
            const files = await scanForDocuments(
                rootState.archiveSiteSettings.siteUrl,
                rootState.archiveSiteSettings.scanDocLibListId,
                FieldNames.FieldFileLeafRef,
                barCodes);
            if (files.length) {
                docs.push(...files);
            }
        }
    },
};

// export const actions: ActionTree<ExecutiveDocsState, RootState> = {
//     async [types.LOAD_EXEC_DOCS]({ commit, dispatch, state, rootState }) {
//         if (!rootState.projectSiteSettings) {
//             return;
//         }
//         if (!rootState.projectSiteSettings.executiveDocCardsListId) {
//             return;
//         }
//         if (!rootState.project) {
//             return;
//         }

//         // Initialize documents
//         const docs = await getExecutiveDocs(
//             rootState.projectSiteSettings.siteUrl,
//             rootState.projectSiteSettings.executiveDocCardsListId,
//             rootState.project.id);

//         const jobTypeIds = new Array<number>();
//         commit(mutations.SET_EXEC_DOCS, { docs });
//         // const grouped = docs.reduce((rv: IndexedExecDocs, x: ExecutiveDocument) => {
//         //     let jobType = x.jobTypeId;
//         //     if (!jobType) {
//         //         jobType = 0;
//         //     }
//         //     else {
//         //         jobTypeIds.push(jobType);
//         //     }
//         //     (rv[jobType] = rv[jobType] || []).push(x);
//         //     return rv;
//         // }, {});
//         // commit(mutations.SET_EXEC_DOCS, { docs, grouped });
//     },
//     async [types.ADD_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
//         if (!rootState.projectSiteSettings) {
//             return;
//         }
//         if (!rootState.projectSiteSettings.siteUrl) {
//             return;
//         }
//         if (!rootState.projectSiteSettings.executiveDocCardsListId) {
//             return;
//         }
//         const file = await addExecutiveDoc(
//             rootState.projectSiteSettings.siteUrl,
//             rootState.projectSiteSettings.executiveDocCardsListId,
//             doc,
//         );
//         commit(mutations.ADD_EXEC_DOC, [file]);
//     },
//     async [types.EDIT_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
//         if (!rootState.projectSiteSettings) {
//             return;
//         }
//         if (!rootState.projectSiteSettings.siteUrl) {
//             return;
//         }
//         if (!rootState.projectSiteSettings.executiveDocCardsListId) {
//             return;
//         }

//         const file = await addExecutiveDoc(
//             rootState.projectSiteSettings.siteUrl,
//             rootState.projectSiteSettings.executiveDocCardsListId,
//             doc,
//         );

//         if (file && file.id > 0) {
//             commit(mutations.EDIT_EXEC_DOC, file);
//         }
//     },
//     async [types.REMOVE_EXEC_DOC]({ commit, dispatch, state, rootState }, doc: ExecutiveDocument) {
//         if (!rootState.projectSiteSettings) {
//             return;
//         }
//         if (!rootState.projectSiteSettings.siteUrl) {
//             return;
//         }
//         if (!rootState.projectSiteSettings.executiveDocCardsListId) {
//             return;
//         }

//         if (doc.required) {
//             const execDocEmpty: ExecutiveDocument = {
//                 id: doc.id,
//                 title: doc.title,
//                 required: true,
//                 docTypeId: doc.docTypeId,
//                 docTypeName: doc.docTypeName,
//                 hasRemarks: false,
//                 jobTypeId: doc.jobTypeId,
//                 projectId: doc.projectId,
//                 changed: false,
//                 barCode: '',
//                 comment: '',
//                 formType: '',
//                 remarks: '',
//                 scanDate: null,
//                 scanLink: '',
//                 scanSize: 0,
//             };
//             try {
//                 const newDoc = await addExecutiveDoc(
//                     rootState.projectSiteSettings.siteUrl,
//                     rootState.projectSiteSettings.executiveDocCardsListId,
//                     execDocEmpty, false);
//                 console.log('changed');
//                 console.log(newDoc);
//                 commit(mutations.EDIT_EXEC_DOC, newDoc);
//             }
//             catch (e) {
//                 console.error(e);
//             }
//         } else {
//             await removeListItemById(
//                 rootState.projectSiteSettings.siteUrl,
//                 rootState.projectSiteSettings.executiveDocCardsListId,
//                 doc.id);
//             commit(mutations.REMOVE_EXEC_DOC, doc);
//         }
//     },
//     async [types.SCAN_EXEC_DOC]({ commit, dispatch, state, rootState }, barCode: string) {
//         if (!rootState.project) {
//             return;
//         }
//         if (!rootState.project.jobTypes) {
//             return;
//         }

//         if (barCode === '') {
//             return [];
//         }

//         const bc = barCode + '.pdf';
//         const docs = [];
//         if (rootState.projectSiteSettings &&
//             rootState.projectSiteSettings.siteUrl &&
//             rootState.projectSiteSettings.executiveDocLibListId) {
//             const files = await scanForDocuments(
//                 rootState.projectSiteSettings.siteUrl,
//                 rootState.projectSiteSettings.executiveDocLibListId,
//                 FieldNames.FieldFileLeafRef,
//                 [bc]);
//             if (files.length) {
//                 docs.push(...files);
//             }
//         }

//         if (rootState.archiveSiteSettings &&
//             rootState.archiveSiteSettings.siteUrl &&
//             rootState.archiveSiteSettings.scanDocLibListId) {
//             const files = await scanForDocuments(
//                 rootState.archiveSiteSettings.siteUrl,
//                 rootState.archiveSiteSettings.scanDocLibListId,
//                 FieldNames.FieldFileLeafRef,
//                 [bc]);
//             if (files.length) {
//                 docs.push(...files);
//             }
//         }
//         return docs;
//     },
//     async [types.SCAN_ALL_EXEC_DOC]({ commit, dispatch, state, rootState }) {
//         if (!rootState.project) {
//             return;
//         }
//         if (!rootState.project.jobTypes) {
//             return;
//         }

//         const barCodes: string[] = [];
//         rootState.project.jobTypes.forEach((jt) => {
//             const arr = state.groupedDocs[jt.LookupId];
//             // arr.filter((d) => d.barCode && d.scanLink);
//             arr.forEach((d) => {
//                 if (d.barCode && !d.scanLink) {
//                     barCodes.push(d.barCode + '.pdf');
//                 }
//             });
//         });

//         const docs = [];
//         if (rootState.projectSiteSettings &&
//             rootState.projectSiteSettings.siteUrl &&
//             rootState.projectSiteSettings.executiveDocLibListId) {
//             const files = await scanForDocuments(
//                 rootState.projectSiteSettings.siteUrl,
//                 rootState.projectSiteSettings.executiveDocLibListId,
//                 FieldNames.FieldFileLeafRef,
//                 barCodes);
//             if (files.length) {
//                 docs.push(...files);
//             }
//         }

//         if (rootState.archiveSiteSettings &&
//             rootState.archiveSiteSettings.siteUrl &&
//             rootState.archiveSiteSettings.scanDocLibListId) {
//             const files = await scanForDocuments(
//                 rootState.archiveSiteSettings.siteUrl,
//                 rootState.archiveSiteSettings.scanDocLibListId,
//                 FieldNames.FieldFileLeafRef,
//                 barCodes);
//             if (files.length) {
//                 docs.push(...files);
//             }
//         }
//     },
// };
