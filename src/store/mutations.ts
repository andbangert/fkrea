import {
    RootState,
    ProjectSiteSettings,
    ArchiveSiteSettings,
    Project,
    StorageAddressSettings,
} from '@/types';

import mt from './mutation-types';
import store from './store';
import Vue from 'vue';
// const CONFIGURE_APP = 'setConfig';
// const SET_LOADING = 'setLoading';
// const SET_PROJECT = 'setProject';

export const mutations = {
    [mt.CONFIGURE_APP](state: RootState, payload: {
        projectSiteSettings: ProjectSiteSettings,
        archiveSiteSettings: ArchiveSiteSettings,
        storageSettings: StorageAddressSettings,
    }) {
        state.archiveSiteSettings = payload.archiveSiteSettings;
        state.projectSiteSettings = payload.projectSiteSettings;
        state.storageSvcSettings = payload.storageSettings;
    },
    [mt.SET_LOADING](state: RootState, loading: boolean) {
        state.loading = loading;
    },
    [mt.SET_PROJECT](state: RootState, project: Project) {
        Vue.set(state, 'project', project);
        //state.project = project;
    },
    [mt.SET_EXEC_DOCS_ARCHIVED](state: RootState, payload: {
        archived: boolean,
        date?: Date | null
    }) {
        if (state.project) {
            state.project.executiveDocsArchived = payload.archived;
            state.project.executiveDocsArchivedDate = payload.date;
        }
    },
    [mt.SET_EXEC_DOCS_ARCHIVE_READY](state: RootState, payload: {
        archived: boolean,
        date: Date
    }) {
        if (state.project) {
            state.project.executiveDocsReadyToArchive = payload.archived;
            state.project.executiveDocsReadyToArchiveDate = payload.date;
        }
    },
    [mt.INIT_STORE](state: RootState) {
        if (state.project) {
            const storeStr = localStorage.getItem('store_' + state.project.id);
            if (storeStr) {
                store.replaceState(Object.assign(state, JSON.parse(storeStr)));
            }
        }
    }
};
