import Vue from 'vue';
import Vuex, { StoreOptions, Module } from 'vuex';
import {
    ExecutiveDocsState,
    RootState,
    ExecutiveDocument,
} from '@/types';
import { actions } from './actions';
import { mutations } from './mutations';
import { getters } from './getters';

const state: ExecutiveDocsState = {
    siteUrl: '/',
    docCardListId: '/',
    documents: new Array<ExecutiveDocument>(),
    // groupedDocs: {},
    //groupedDocTypes: {},
};

const store: Module<ExecutiveDocsState, RootState> = {
    namespaced: true,
    state,
    actions,
    mutations,
    getters,
};

export default store;