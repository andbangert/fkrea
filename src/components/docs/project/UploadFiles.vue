<template>
  <div style="width:1150px">
    <div class="fkr-inline-pane">
      <div class="fkr-expert-pane">
        <h2 class="fkr-label">Заключение экспертизы</h2>
        <input
          type="text"
          class="fkr-input expert-num"
          v-model="exnumber"
          :disabled="expertInProgress"
        />
        <button
          type="button"
          class="fkr-button"
          :class="{disabled : expertInProgress}"
          :disabled="expertInProgress"
          @click="queueProject()"
        >Загрузить ПСД</button>
      </div>
      <div class="fkr-status-pane">
        <span class="fkr-status-box failed" v-show="expertHasError">Загрузка неудачна....</span>
        <span class="fkr-status-box success" v-show="expertSuccess">Загрузка прошла успешно....</span>
        <span
          class="fkr-status-box inprogress"
          v-show="expertInProgress"
        >Идет загрузка проектной документации....</span>
      </div>
    </div>
    <br />
    <br />
    <div class="ms-toolbar" v-if="addMode" id="fkrProjAddFilesArea">
      <div class="ms-list-addnew fkr-add-files">
        <span>Для загрузки документов перетащите файлы в эту область экрана</span>
      </div>
    </div>
    <div v-else>
      <div class="ms-toolbar" v-if="filesCount === 0">
        <div class="fkr-add-files">
          <span>Проектная документация не загружена</span>
        </div>
      </div>
      <div v-else>
        <FileList :siteUrl="config.siteUrl" :listId="config.projectDocLibListId"></FileList>
      </div>
    </div>
    <div class="button-section" v-if="addMode || mode === 2">
      <button type="button" class="fkr-button" @click="onclose()">Отмена</button>
      &nbsp;&nbsp;
      <button
        type="button"
        class="fkr-button-blue"
        @click="onsave"
        v-show="!addMode"
      >Сохранить</button>
    </div>
    <div class="button-section" v-else>
      <button
        type="button"
        class="fkr-button"
        @click="addMode = !addMode"
        :disabled="expertInProgress"
        :class="{disabled : expertInProgress}"
      >Добавить файлы</button>
      &nbsp;&nbsp;
      <button
        type="button"
        class="fkr-button"
        v-show="showEdit"
        @click="onedit"
      >Редактировать</button>
    </div>
  </div>
</template>
<script lang="ts">
import utils from "@/utils";
import actions from "@/store/action-types";
import store from "@/store/modules/projectDocs/store";
import FileList from "./FileList.vue";
import OnSaveDialog from "./OnSaveDialog.vue";
import { SPScripts } from "@/utils/constants";
import { ProjectSiteSettings, ExpertDocsQueue } from "@/types";
import { createOnSaveDialogElement } from "./inline";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { createNamespacedHelpers, ActionMethod, Action } from "vuex";
import {
  AppOptions,
  StateFile,
  UploadMode,
  ProjectDocsState,
  Project
} from "@/types";

const { mapActions, mapState, mapGetters } = createNamespacedHelpers(
  "projectDocs"
);

const state = store.state as ProjectDocsState;

@Component({
  computed: {
    ...mapState({
      counter: number => state.counter,
      mode: mode => state.mode,
      files: files => state.files,
      expert: expert => state.expertDocsQueue
    }),
    ...mapGetters(["getUnsavedFiles", "filesCount", "unsavedFilesCount"])
  },
  methods: {
    ...mapActions({
      uploadFiles: actions.UPLOAD_FILES,
      saveFiles: actions.SAVE_FILES,
      setUploadMode: actions.SET_UPLOAD_MODE,
      cancelAllChanges: actions.CANCEL_ALL_FILES_CHANGE,
      setExpertQueue: actions.SET_DOWNLOAD_QUEUE
    })
  },
  components: {
    FileList
  }
})
export default class UploadFiles extends Vue {
  @Prop()
  public config!: ProjectSiteSettings;
  @Prop()
  public project!: Project;

  // State computed
  public filesCount!: number;
  public unsavedFilesCount!: number;
  // State Actions
  public setCounter!: ActionMethod;
  public uploadFiles!: ActionMethod;
  public saveFiles!: ActionMethod;
  public setUploadMode!: ActionMethod;
  public cancelAllChanges!: ActionMethod;
  private setExpertQueue!: ActionMethod;

  private notify!: string;
  private mode!: UploadMode;
  private uploadInit!: boolean;
  private addMode: boolean = false;
  private uploaderInitialised: boolean = false;
  private exnumber!: string;
  private expert!: ExpertDocsQueue;
  private getUnsavedFiles!: Array<StateFile>;

  get expertQueued() {
    if (this.expert) {
      return this.expert.queued;
    }
    return false;
  }
  get expertHasError() {
    
    if (this.expert) {
      return this.expert.hasError;
    }
    return false;
  }
  get expertNumber() {
    if (this.expert) {
      return this.expert.number;
    }
    return "";
  }
  get expertDownloaded() {
    if (this.expert) {
      return this.expert.downloaded;
    }
    return false;
  }
  get expertSuccess() {
    this.setExpertNumber();
    return this.expertDownloaded && !this.expertHasError && this.expertQueued;
  }
  get expertInProgress() {
    this.setExpertNumber();
    return !this.expertDownloaded && !this.expertHasError && this.expertQueued;
  }
  mounted() {}
  get showEdit() {
    return !this.addMode && this.filesCount > 0;
  }
  private setExpertNumber() {
    if (this.expert && this.expert.number) {
      this.exnumber = this.expert.number;
    }
  }
  private async onModeChanged(mode: number) {
    await this.setUploadMode(mode);
    // Initialise uploader
    if (this.mode === UploadMode.Edit) {
      this.initUploader();
    }
  }
  private preUpload(files: FileElement[]) {}
  private postUpload(files: FileElement[]) {
    const self = this;
    const serverUrl = self.config.serverUrl ? self.config.serverUrl : "/";
    const listId = self.config.projectDocLibListId;
    const siteUrl = self.config.serverRelativeUrl
      ? self.config.serverRelativeUrl
      : "/";
    this.uploadFiles({
      siteUrl: siteUrl,
      listId,
      files
    })
      .then(value => {
        SP.SOD.executeFunc(SPScripts.SP.Script, SPScripts.SP.UI.Status, () => {
          const status = SP.UI.Status.removeAllStatus(true);
        });
        self.addMode = !self.addMode;
        self.setUploadMode(UploadMode.Edit);
      })
      .catch((e: any) => {
        console.error(e);
      });
  }
  private checkPermissions() {
    return true;
  }
  // #region Event listeners
  private oncancel() {
    this.addMode = false;
    // TODO: check for unsaved files.
    this.setUploadMode(UploadMode.New);
  }
  private onsave() {
    const self = this;
    const serverUrl = self.config.serverUrl ? self.config.serverUrl : "/";
    const siteUrl = self.config.siteUrl ? self.config.siteUrl : "/";
    const listId = self.config.projectDocLibListId;
    const folderUrl = self.config.projectDocsfolderUrl
      ? self.config.projectDocsfolderUrl
      : "";

    SP.SOD.executeFunc(SPScripts.SP.Script, SPScripts.SP.UI.Notify, () => {
      self.notify = SP.UI.Notify.addNotification(
        "Выполняем загрузку файлов",
        true
      );
    });

    this.saveFiles({
      siteUrl,
      listId: listId,
      checkinType: SP.CheckinType.majorCheckIn
    })
      .then(a => {
        SP.SOD.executeFunc(SPScripts.SP.Script, SPScripts.SP.UI.Status, () => {
          SP.UI.Notify.removeNotification(self.notify);
          const status = SP.UI.Status.addStatus(
            "Файлы успешно сохранены в системе",
            ""
          );
          SP.UI.Status.setStatusPriColor(status, "green");
        });
      })
      .catch(e => {
        SP.SOD.executeFunc(SPScripts.SP.Script, SPScripts.SP.UI.Status, () => {
          SP.UI.Notify.removeNotification(self.notify);
          const status = SP.UI.Status.addStatus(
            "При сохранении файлов возникли неожиданные ошибки",
            e
          );
          SP.UI.Status.setStatusPriColor(status, "red");
        });
      });
  }
  private onclose() {
    const self = this;
    const files = this.getUnsavedFiles;
    if (this.unsavedFilesCount > 0) {
      SP.SOD.executeFunc(
        SPScripts.SP.UI.Dialog.Script,
        SPScripts.SP.UI.Dialog.ShowModalDialog,
        // Callback start
        () => {
          // Open Save Dialog
          SP.UI.ModalDialog.showModalDialog({
            autoSize: true,
            title: "Сохранить файлы",
            html: createOnSaveDialogElement(
              "_onSaveDialog",
              {
                instructions:
                  "Нажмите кнопку 'сохранить', чтобы сохранить изменения или отмена, чтобы выйти без сохранения.",
                buttonOk: "Сохранить",
                subject: "Следующие файлы были изменены:"
              },
              files.map(file => {
                return file.fileName;
              })
            ),
            // Callback dialog return
            dialogReturnValueCallback: (
              dialogResult: SP.UI.DialogResult,
              returnValue: any
            ) => {
              if (dialogResult === SP.UI.DialogResult.OK) {
                // Save Files
                self
                  .saveFiles({
                    siteUrl: self.config.siteUrl,
                    listId: self.config.projectDocLibListId,
                    checkinType: SP.CheckinType.majorCheckIn
                  })
                  .then(a => {
                    self.addMode = false;
                    self.setUploadMode(UploadMode.New);
                  })
                  .catch(e => {
                    SP.SOD.executeFunc(
                      SPScripts.SP.Script,
                      SPScripts.SP.UI.Status,
                      () => {
                        SP.UI.Notify.removeNotification(self.notify);
                        const status = SP.UI.Status.addStatus(
                          "При сохранении файлов возникли неожиданные ошибки",
                          e
                        );
                        // Set Error status
                        SP.UI.Status.setStatusPriColor(status, "red");
                      }
                    );
                  });
              } else {
                self.addMode = false;
                self.cancelAllChanges(self.getUnsavedFiles);
                self.setUploadMode(UploadMode.New);
              }
            } // End callback dialog return
          });
        } // Callback ends
      );
    } else {
      self.addMode = false;
      self.setUploadMode(UploadMode.New);
    }
  }
  private onedit() {
    if (this.mode === UploadMode.Edit) {
      this.setUploadMode(UploadMode.New);
    } else {
      this.setUploadMode(UploadMode.Edit);
    }
  }
  private queueProject() {
    console.log(this.exnumber);
    if (this.exnumber && this.exnumber !== "") {
      this.setExpertQueue(this.exnumber)
        .then(result => {})
        .catch(e => {});
    } else {
      // showError()
    }
  }
  @Watch("addMode")
  private initUploader() {
    const self = this;
    this.$nextTick(() => {
      if (self.uploaderInitialised) {
        return;
      }
      const ele = document.getElementById("fkrProjAddFilesArea") as Element;
      const serverUrl = self.config.serverUrl ? self.config.serverUrl : "/";
      const siteUrl = self.config.serverRelativeUrl
        ? self.config.serverRelativeUrl
        : "/";
      const docLibId = self.config.projectDocLibListId;
      const folderUrl = self.project.projectPathFolder
        ? self.project.projectPathFolder
        : "/";
      SP.SOD.executeFunc(
        utils.SPScripts.DragDrop.Script,
        "registerDragUpload",
        () => {
          registerDragUpload(
            ele,
            serverUrl,
            siteUrl,
            docLibId,
            folderUrl,
            false,
            false,
            () => {},
            self.preUpload,
            self.postUpload,
            self.checkPermissions
          );
        }
      );
      this.uploaderInitialised = true;
    });
  }
}
</script>

<style scoped>
.button-section {
  float: right;
  margin-top: 16px;
}
.fkr-label {
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
}
.db-margin-bottom-15 {
  margin-bottom: 15px;
}
.db-margin-top-15 {
  margin-top: 15px;
}
.fkr-add-files {
  width: 1150px;
  height: 268px;
  background: #ffffff;
  border: 1px solid #a3a3a3;
  box-sizing: border-box;
  text-align: center;
  vertical-align: middle;
  display: flex !important;
}
.fkr-add-files span {
  font-style: normal;
  font-weight: 300;
  font-size: 18px;
  line-height: 21px;
  margin: auto;
  height: 21px;
  display: block;
}
#fkrProjAddFilesArea_progInfo {
  width: auto !important;
}
</style>
