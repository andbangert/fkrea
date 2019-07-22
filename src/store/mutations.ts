import {
    RootState,
    ProjectSiteSettings,
    ArchiveSiteSettings,
    Project,
} from '@/types';

const CONFIGURE_APP = 'setConfig';
const SET_LOADING = 'setLoading';
const SET_PROJECT = 'setProject';

export const mutations = {
    [CONFIGURE_APP] (state: RootState, payload: {
        projectSiteSettings: ProjectSiteSettings,
        archiveSiteSettings: ArchiveSiteSettings,
    }) {
        state.archiveSiteSettings = payload.archiveSiteSettings;
        state.projectSiteSettings = payload.projectSiteSettings;
    },
    [SET_LOADING] (state: RootState, loading: boolean) {
        state.loading = loading;
    },
    [SET_PROJECT] (state: RootState, project: Project) {
        state.project = project;
    },
};
