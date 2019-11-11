import Vue from 'vue';
import Vuex, { StoreOptions, Module } from 'vuex';
import { mutations } from './mutations';
import { actions } from './actions';
import { getters } from './getters';
import {
  DocTypeSearchPattern,
  StateFile,
  DocType,
  UploadMode,
  ProjectDocsState,
  RootState,
} from '@/types';

Vue.use(Vuex);

// Old initalizer
const state: ProjectDocsState = {
  mode: UploadMode.Unknown,
  counter: 0,
  loading: false,
  files: new Array<StateFile>(),
  docTypes: new Array<DocType>(),
  docTypeSearchPatterns: Array<DocTypeSearchPattern>(),
  // projectItem: { id: -1 },
  // options: {
  //   serverUrl: 'http://vm-arch',
  //   siteUrl: '/sites/documentation',
  //   listId: '{CA9F91AA-D391-41B8-A04C-C9D676CE2136}',
  //   folderUrl: '/documents',
  //   docPartNameListId: '{8b1d74ae-97bd-44a9-a314-6a48903df849}',
  //   projectListId: '{d0a9d56c-4d8a-43b1-9d0a-ceb123ec9b54}',
  //   projectId: -1,
  // },
};

const store: Module<ProjectDocsState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};

export default store;
