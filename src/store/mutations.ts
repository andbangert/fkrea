import {
    RootState,
    ProjectMainSettings,
    ProjectCardSettings,
    Project,
} from '@/types';

const CONFIGURE_APP = 'setConfig';
const SET_LOADING = 'setLoading';
const SET_PROJECT = 'setProject';

export const mutations = {
    [CONFIGURE_APP](state: RootState, payload: {
        setting: ProjectMainSettings,
        cardSettings: ProjectCardSettings,
    }) {
        state.cardSettings = payload.cardSettings;
        state.setting = payload.setting;
    },
    [SET_LOADING](state: RootState, loading: boolean) {
        state.loading = loading;
    },
    [SET_PROJECT](state: RootState, project: Project){
        state.project = project;
    },
};
