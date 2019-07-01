import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from '@/types';

Vue.use(Vuex);


// const state: RootState {
//   serverUrl: 'http://vm-arch',
//   siteUrl: '/sites/documentation',
//   listId: '{CA9F91AA-D391-41B8-A04C-C9D676CE2136}',
//   folderUrl: '/documents',
//   projectListId: '{d0a9d56c-4d8a-43b1-9d0a-ceb123ec9b54}',
//   projectId: -1,
// }

const store: StoreOptions<RootState> = {

};

export default new Vuex.Store({
  state: {

  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
});
