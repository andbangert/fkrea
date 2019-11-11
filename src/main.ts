import Vue from 'vue';
import {
  ProjectCardSettings,
  ProjectMainSettings,
  RootState,
  ProjectSiteSettings,
  ArchiveSiteSettings,
  StorageAddressSettings,
  ExecutiveDocument,
  FieldValueCollection,
} from './types';
import { ProjectFieldInitializer } from '@/projectCardInitializer';
import ProjectForm from './components/project/ProjectForm.vue';
import ProjectSearch from './components/project/ProjectSearch.vue';
// import ProjectExcecutiveDocsForm from './components/project/ProjectExcecutiveDocsForm.vue';
import PrintExecDocsDialog from '@/components/PrintExecDocsDialog.vue';
import ProjectViewForm from '@/components/project/ProjectViewForm.vue';
import actions from '@/store/action-types';
import store from './store/store';
import '@/scss/v-select.css';
import '@/scss/form.css';
import '@/scss/executive.css';

Vue.config.productionTip = false;

export async function InitProjectViewForm(
  projSiteSettings?: ProjectSiteSettings,
  archSiteSettings?: ArchiveSiteSettings,
  storageSettings?: StorageAddressSettings) {

  const pidStr = GetUrlKeyValue('ID');
  if (!pidStr && pidStr === '') {
    throw Error('Project id must be set as get parameter.');
  }

  const projectId: number = Number(pidStr);
  if (isNaN(projectId)) {
    throw Error('Project id must be a number.');
  }
  // Storage Address API
  if (!storageSettings) {
    storageSettings = {
      url: 'http://5.200.53.136/classes/workBase.php',
      userId: '4C54FB6E-7D7B-49B1-9E8C-7D560BB630AE',
    };
  }
  // Archive site
  if (!archSiteSettings) {
    archSiteSettings = {
      siteUrl: 'http://vm-arch/',
      docListId: '',
      scanDocLibListId: '',
    };
  }
  // Project Site
  if (!projSiteSettings) {
    projSiteSettings = {
      serverUrl: 'http://vm-arch',
      serverRelativeUrl: '/sites/documentation',
      siteUrl: 'http://vm-arch/sites/documentation',
      buildingsListId: 'faefac83-f507-48ed-89bc-f2a62d338bfe',
      contractorsListId: '080cbb6c-c2d3-4a85-bea6-fe7a82b91103',
      executiveDocLibListId: '8ce27767-7234-43c9-a78e-c81f3b042b49',
      executiveDocCardsListId: 'e7fbd4fb-ed60-475f-9f2d-dc0bfa7a021c',
      projectListId: 'd0a9d56c-4d8a-43b1-9d0a-ceb123ec9b54',
      typesOfJobsListId: 'ea94fe6e-fdb0-4609-93bf-f5d752e9c400',
      executiveDocTypesListId: '6647f002-47e0-4e8f-a2c0-d0bc8dfe2ab4',
      projectDocsDocPartNameListId: '{8b1d74ae-97bd-44a9-a314-6a48903df849}',
      projectDocLibListId: '{70e129bd-68ac-4b61-8242-133d6eb48c3e}',
      projectDocsfolderUrl: '/ProjectScan',
      projectExpertCardsListId: '{C5EA8EBC-000A-49E6-8BD3-20F411BC8042}',
    };
  }

  // Waiting dialog. It's better use this inside component.
  // TODO: Error page.
  SP.SOD.executeFunc('sp.ui.dialog.js', 'SP.UI.ModalDialog.showWaitScreenWithNoClose', () => {
    const loadingDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Пожалуйста подождите', 'Загружаем информацию', 150, 500);
    try {
      window.localStorage.removeItem('store_' + projectId);
      store.subscribe((mutation, state: RootState) => {
        // Remove an old
        window.localStorage.setItem('store_' + projectId, JSON.stringify(state));
      });

      // Initialize settings
      store.dispatch(actions.INIT_STATE, {
        projectSiteSettings: projSiteSettings,
        archiveSiteSettings: archSiteSettings,
        storageSettings: storageSettings,
      }).then(() => {
        if (projSiteSettings) {
          // Initialize project
          store.dispatch(actions.LOAD_PROJECT, {
            siteUrl: projSiteSettings.siteUrl,
            listId: projSiteSettings.projectListId,
            itemId: projectId,
          }).then(() => {
            if (projSiteSettings) {
              const prms = new Array<Promise<any>>();
              // Initialize project document types
              prms.push(store.dispatch('projectDocs/' + actions.SET_DOC_TYPES));
              // Initialize project document's data
              prms.push(store.dispatch('projectDocs/' + actions.FETCH_FILES));
              // Initialize executive document's data
              prms.push(store.dispatch('executiveDocs/' + actions.LOAD_EXEC_DOCS, {
                siteUrl: projSiteSettings.siteUrl,
                listId: projSiteSettings.executiveDocLibListId,
                itemId: projectId,
              }));

              Promise.all(prms).then(() => {
                // Load Application
                const v1 = new Vue({
                  components: { ProjectViewForm },
                  render: (h) => h(ProjectViewForm, {
                    props: {
                      projectId: projectId
                    }
                  }),
                  store,
                }).$mount('#app');
                // Close dialog
                loadingDialog.close(SP.UI.DialogResult.OK);
              }).catch((e) => {
                console.error(e);
                // Initialize document's data fails
                loadingDialog.close(SP.UI.DialogResult.cancel);
              });
            }
          }).catch((e) => {
            console.error(e);
            // Initialize project data fails
            loadingDialog.close(SP.UI.DialogResult.cancel);
          });
        }
      }).catch((e) => {
        // Initialize settings fails
        console.error(e);
        loadingDialog.close(SP.UI.DialogResult.cancel);
      });
    } catch (e) {
      console.error(e);
      loadingDialog.close(SP.UI.DialogResult.cancel);
    }
  });
}

export async function PrintExecutiveDocs() {

  const pidStr = GetUrlKeyValue('pid');
  if (!pidStr && pidStr === '') {
    throw Error('Project id must be set as get parameter.');
  }

  console.log(pidStr);

  const projectId: number = Number(pidStr);
  console.log(projectId);
  if (isNaN(projectId)) {
    throw Error('Project id must be a number.');
  }
  const v1 = new Vue({
    components: { PrintExecDocsDialog },
    render: (h) => h(PrintExecDocsDialog, {
      props: {
        projectId
      }
    }),
    store,
  }).$mount('#app');
}

// export async function InitializeProjectExecutiveDocs(
//   projSiteSettings?: ProjectSiteSettings,
//   archSiteSettings?: ArchiveSiteSettings,
//   storageSettings?: StorageAddressSettings) {

//   const pidStr = GetUrlKeyValue('pid');
//   if (!pidStr && pidStr === '') {
//     throw Error('Project id must be set as get parameter.');
//   }

//   const projectId: number = Number(pidStr);
//   if (isNaN(projectId)) {
//     throw Error('Project id must be a number.');
//   }
//   // Storage Address API
//   if (!storageSettings) {
//     storageSettings = {
//       url: 'http://5.200.53.136/classes/workBase.php',
//       userId: '4C54FB6E-7D7B-49B1-9E8C-7D560BB630AE',
//     };
//   }
//   // Archive site
//   if (!archSiteSettings) {
//     archSiteSettings = {
//       siteUrl: 'http://vm-arch/',
//       docListId: '',
//       scanDocLibListId: '',
//     };
//   }
//   // Project Site
//   if (!projSiteSettings) {
//     projSiteSettings = {
//       siteUrl: 'http://vm-arch/sites/documentation',
//       buildingsListId: 'faefac83-f507-48ed-89bc-f2a62d338bfe',
//       contractorsListId: '080cbb6c-c2d3-4a85-bea6-fe7a82b91103',
//       executiveDocLibListId: '8ce27767-7234-43c9-a78e-c81f3b042b49',
//       executiveDocCardsListId: 'e7fbd4fb-ed60-475f-9f2d-dc0bfa7a021c',
//       projectListId: 'd0a9d56c-4d8a-43b1-9d0a-ceb123ec9b54',
//       typesOfJobsListId: 'ea94fe6e-fdb0-4609-93bf-f5d752e9c400',
//       executiveDocTypesListId: '6647f002-47e0-4e8f-a2c0-d0bc8dfe2ab4',
//     };
//   }

//   // Waiting dialog. It's better use this inside component.
//   // TODO: Error page.
//   SP.SOD.executeFunc('sp.ui.dialog.js', 'SP.UI.ModalDialog.showWaitScreenWithNoClose', () => {
//     const loadingDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Пожалуйста подождите', 'Загружаем информацию', 150, 500);
//     try {
//       window.localStorage.removeItem('store_' + projectId);
//       store.subscribe((mutation, state: RootState) => {
//         // Remove an old
//         window.localStorage.setItem('store_' + projectId, JSON.stringify(state));
//       });

//       // Initialize settings
//       store.dispatch(actions.INIT_STATE, {
//         projectSiteSettings: projSiteSettings,
//         archiveSiteSettings: archSiteSettings,
//         storageSettings: storageSettings,
//       }).then(() => {
//         if (projSiteSettings) {
//           // Initialize project
//           store.dispatch(actions.LOAD_PROJECT, {
//             siteUrl: projSiteSettings.siteUrl,
//             listId: projSiteSettings.projectListId,
//             itemId: projectId,
//           }).then(() => {
//             if (projSiteSettings) {
//               // Initialize document's data
//               store.dispatch('executiveDocs/' + actions.LOAD_EXEC_DOCS, {
//                 siteUrl: projSiteSettings.siteUrl,
//                 listId: projSiteSettings.executiveDocLibListId,
//                 itemId: projectId,
//               }).then(() => {
//                 // Load Application
//                 const v1 = new Vue({
//                   components: { ProjectExcecutiveDocsForm },
//                   render: (h) => h(ProjectExcecutiveDocsForm, {
//                     props: {
//                       projectId: projectId
//                     }
//                   }),
//                   store,
//                 }).$mount('#app');
//                 // Close dialog
//                 loadingDialog.close(SP.UI.DialogResult.OK);
//               }).catch(() => {
//                 // Initialize document's data fails
//                 loadingDialog.close(SP.UI.DialogResult.cancel);
//               });
//             }
//           }).catch(() => {
//             // Initialize project data fails
//             loadingDialog.close(SP.UI.DialogResult.cancel);
//           });
//         }
//       }).catch(() => {
//         // Initialize settings fails
//         loadingDialog.close(SP.UI.DialogResult.cancel);
//       });
//     } catch (e) {
//       console.error(e);
//       loadingDialog.close(SP.UI.DialogResult.cancel);
//     }
//   });
// }

export function InitializeProjectCardPage(mainSettings: ProjectMainSettings,
  projectCardSettings: ProjectCardSettings) {
  const payload = mainSettings;
  const ele = document.getElementById('Ribbon.ListForm.Edit.Commit');
  if(ele) {
    ele.style.display = 'none';
  }

  SP.SOD.executeFunc('sp.ui.dialog.js', 'SP.UI.ModalDialog.showWaitScreenWithNoClose', () => {
    const loadingDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Пожалуйста подождите', 'Загружаем информацию', 150, 500);
    ProjectFieldInitializer.InitializeFields(payload,
      ['BuildObj',
        'Title',
        'Path',
        'Designer',
        'DesignerContracts',
        'Contractor',
        'Contracts',
        'TypeOfJobs']).then((fields) => {

          const pcSettings = projectCardSettings;

          // TEST
          // {
          //   siteUrl: '/', // Main site
          //   contractContentTypeId: '0x01001296385648F95241BBCCBCCFDFD5836703004CF8F01617F9024E8120D4BF07B4F616', // Main site
          //   contractorListId: '{c79a969e-a687-40c1-8015-f176f18b2337}', // Main site
          //   docListId: '{1c2c050f-4e47-448f-9e48-5c25643939f8}', // Main site
          //   BuildingsListId: '{94833f97-7310-4e99-954d-68b471ecd082}', // Main site
          //   scanLib: '{70e129bd-68ac-4b61-8242-133d6eb48c3e}',
          //   executiveLib: '{8CE27767-7234-43C9-A78E-C81F3B042B49}', // Project Site
          //   designerListId: '{CA0D80D4-08AF-41C6-A572-31E7105D1D2F}', // Project Site 
          // };

          // PROD
          // {
          //   siteUrl: '/',
          //   contractContentTypeId: '0x01001296385648F95241BBCCBCCFDFD5836703004CF8F01617F9024E8120D4BF07B4F616', // Main site
          //   contractorListId: '{0d2d2424-dee8-48d4-8bc2-a70a88b31956}', // Main site
          //   docListId: '{4d45929a-e485-44e7-9d45-69a3f7fe711c}', // Main site
          //   BuildingsListId: '{91d722bb-ea2c-4821-b90b-fd834b0e69b8}', // Main site
          //   scanLib: '{f966ae2c-75f9-4e64-b37a-c5c2b9e408c8}',
          //   executiveLib: '{47367CDD-BF16-4604-91B5-85A5446D39B4}', // Project Site
          //   designerListId: '{CA0D80D4-08AF-41C6-A572-31E7105D1D2F}', // Project Site 
          // };
          ProjectFieldInitializer.InitializeFieldOptions(payload, fields, projectCardSettings).
            then((options) => {
              // Initialize State
              const v1 = new Vue({
                el: '#app',
                components: {
                  ProjectForm,
                },
                render: (h) => h(ProjectForm, {
                  props: {
                    fields,
                    settings: projectCardSettings,
                    options,
                    siteUrl: payload.siteUrl,
                    listId: payload.listId,
                    itemId: payload.itemId,
                    mode: payload.mode,
                    scanLibId: projectCardSettings.scanLib,
                    executiveDocCardListId: projectCardSettings.executiveDocCardListId,
                    executiveDocTypeListId: projectCardSettings.executiveDocTypeListId,
                  },
                }),
              }).$mount('#app');
              loadingDialog.close(SP.UI.DialogResult.OK);
            });
          // ========================
        }).catch((e) => {
          loadingDialog.close(SP.UI.DialogResult.cancel);
        });
  });
}

export function InitializeProjectSearch(
  siteUrl: string,
  buildAddrListId: string,
  projectListId: string,
  contractorListId: string,
  contractSiteUrl: string,
  contractListId: string) {

  // Initialize State
  const v1 = new Vue({
    el: '#app',
    components: {
      ProjectSearch,
    },
    render: (h) => h(ProjectSearch, {
      props: {
        siteUrl,
        buildObjectList: buildAddrListId,
        projectList: projectListId,
        contractorList: contractorListId,
        contractListId,
        contractSiteUrl,
      },
    }),
  }).$mount('#app');
  // ========================
}

(function () {
  RegisterModuleInit('app.js', () => {
    // Initialize properties here
  });
  NotifyScriptLoadedAndExecuteWaitingJobs('app.js');
});


// <script type='text/javascript' >
//   document.write('<div id="app"></div>');

// if (SP && SP.SOD) {
//   SP.SOD.executeFunc('app.js', null, function () {
//     try {
//       var projectId = Number(GetUrlKeyValue('pid'));
//       var mode = 0;
//       if (projectId && !isNaN(projectId)) {
//         mode = 1;
//       }

//     var storageSettings = {
//       url: 'http://5.200.53.136/classes/workBase.php',
//       userId: '4C54FB6E-7D7B-49B1-9E8C-7D560BB630AE',
//     };

//   // Archive site
//     var archSiteSettings = {
//       siteUrl: 'http://fkrea/',
//       docListId: '{4D45929A-E485-44E7-9D45-69A3F7FE711C}',
//       scanDocLibListId: '{4A6DDA07-53D0-4036-A293-9B996781D23B}',
//     };

//     // Project Site
//     var projSiteSettings = {
//       serverUrl: 'http://fkrea',
//       serverRelativeUrl: '/sites/documentation',
//       siteUrl: 'http://fkrea/sites/documentation',
//       buildingsListId: '{B983B184-45C8-45E3-AEA3-C0EDB0414A4D}',
//       contractorsListId: '{ca0d80d4-08af-41c6-a572-31e7105d1d2f}',
//       executiveDocLibListId: '{47367CDD-BF16-4604-91B5-85A5446D39B4}',
//       executiveDocCardsListId: '{5CC786DD-A5C0-45A2-BE19-517FC78EA19A}',
//       projectListId: '{C3C9E598-C6F1-49EF-881B-DFA95013DF73}',
//       typesOfJobsListId: '{391CAA60-5ED9-461F-8815-17616F835605}',
//       executiveDocTypesListId: '{A026DEB5-42CF-429A-9211-441635890BC7}',
//       projectDocsDocPartNameListId: '{74b4a326-8880-4d15-8907-a1904eee13fd}',
//       projectDocLibListId: '{f966ae2c-75f9-4e64-b37a-c5c2b9e408c8}',
//       projectDocsfolderUrl: '/ProjectScan',
//       projectExpertCardsListId: '{226a2a6e-8409-41ce-b086-d2037c0a4569}',
//     };

//       fkrea.InitializeProjectExecutiveDocs(projSiteSettings, archSiteSettings, storageSettings);
//     } catch (e) {
//       console.error(e);
//     }
//   });
// }
// </script>

