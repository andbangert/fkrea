<template>
  <tr>
    <td>
      <span class="frk-file-icon">
        <img :src="file.iconUrl" alt />
      </span>
    </td>
    <td>
      <a :href="file.serverRelativeUrl" target="self">{{file.fileName}}</a>
      </td>
    <td v-if="!file.saved && mode === 2" class="fkr-input-cell">
      <div>
        <select
          name="docType"
          @change="onchange($event)"
          :disabled="file.saved"
          v-model="docType"
          class="fkr-select"
        >
          <option
            v-for="item in docTypes"
            :key="item.id"
            :value="item"
            :selected="item.id === file.docType.id"
          >{{item.partNum}}&nbsp;-&nbsp;{{item.title}}</option>
        </select>
      </div>
    </td>
    <td v-else>
      <div>{{file.docType.title}}</div>
    </td>
    <td v-if="!file.saved && mode === 2" class="fkr-input-cell">
      <textarea class="fkr-input" v-model.lazy="addInfo" @change="onchange"></textarea>
    </td>
    <td v-else>{{file.info}}</td>
    <td>{{file.majorVersion}}.{{file.minorVersion}}</td>
    <td>{{scanDate}}</td>
    <td>{{fileSize}}</td>
    <td>
      <span v-if="mode === 2">
        <SaveEditButton @active-changed="onEditChanged" :active="!file.saved"></SaveEditButton>
      </span>
      <span v-else></span>
    </td>
  </tr>
</template>
<script lang="ts">
import utils, { SPDataService } from "@/utils";
import store from "@/store/modules/projectDocs/store";
import actions from "@/store/action-types";
import SaveEditButton from "./SaveEditButton.vue";
import { SPScripts } from "@/utils/constants";
import { formatDate } from "@/utilities";
import { Component, Prop, Vue, Watch, Model } from "vue-property-decorator";
import { createNamespacedHelpers, ActionMethod } from "vuex";
import { createOnSaveDialogElement } from "./inline";
import {
  AppOptions,
  StateFile,
  DocType,
  UploadMode,
  SaveEditButtonKey,
  StateFileType,
  ProjectDocsState
} from "@/types";

const { mapActions, mapState, mapGetters } = createNamespacedHelpers(
  "projectDocs"
);

const state = store.state as ProjectDocsState;

@Component({
  // props: ['file'],
  computed: {
    ...mapState({
      docTypes: docTypes => state.docTypes,
      mode: mode => state.mode
    })
  },
  methods: {
    ...mapActions({
      changeFile: actions.CHANGE_FILE_ACTION,
      saveFile: actions.SAVE_FILE,
      deleteFile: actions.DELETE_FILE,
      cancelFileChange: actions.CANCEL_FILE_CHANGE,
      setFileUnsaved: actions.SET_FILE_UNSAVED
    })
  },
  components: {
    SaveEditButton
  }
})
export default class File extends Vue {
  @Prop()
  public file!: StateFile;
  public mode!: UploadMode;
  public docTypes!: DocType[];
  public addInfo?: string = this.file.info;
  public docType: DocType = this.file.docType;

  public changeFile!: ActionMethod;
  public saveFile!: ActionMethod;
  public deleteFile!: ActionMethod;
  public cancelFileChange!: ActionMethod;
  public setFileUnsaved!: ActionMethod;
  public notify!: string;

  get scanDate() {
    if (this.file && this.file.lastModified) {
      try {
        const date = new Date(this.file.lastModified);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${day < 10 ? "0" + day : day}.${
          month < 10 ? "0" + month : month
        }.${date.getFullYear()}`;
      } catch (e) {
        console.error(e);
      }
    }
  }
  get fileSize() {
    if (this.file.fileSize && this.file.fileSize > 0) {
      const size = this.file.fileSize / 1000;
      return Math.floor(size);
    }
    return 0;
  }
  public onEditChanged(arg: SaveEditButtonKey) {
    const self = this;
    if (arg === SaveEditButtonKey.Edit) {
      // this.saved = false;
      self.setFileUnsaved(self.file.fileName);
    } else if (arg === SaveEditButtonKey.Cancel) {
      this.addInfo = self.file.info;
      this.docType = self.file.docType;
      // this.saved = true;
      // self.setFileUnsaved(self.file.fileName);
      self.cancelFileChange(self.file.fileName);
    } else if (arg === SaveEditButtonKey.Remove) {
      SP.UI.ModalDialog.showModalDialog({
        autoSize: true,
        title: "Удаление файла",
        html: createOnSaveDialogElement(
          "_onSaveDialog",
          {
            instructions:
              "Нажмите кнопку 'Удалить', чтобы удалить файл или нажмите 'Отмена'.",
            buttonOk: "Удалить",
            subject: "Вы действительно хотите удалить файл:"
          },
          [self.file.fileName]
        ),
        // Callback dialog return
        dialogReturnValueCallback: (
          dialogResult: SP.UI.DialogResult,
          returnValue: any
        ) => {
          if (dialogResult === SP.UI.DialogResult.OK) {
            // Set status
            SP.SOD.executeFunc(
              SPScripts.SP.Script,
              SPScripts.SP.UI.Notify,
              () => {
                self.notify = SP.UI.Notify.addNotification(
                  "Выполняем удаление файла",
                  true
                );
              }
            );
            // Delete File
            const fileName = self.file.fileName;
            self
              .deleteFile(self.file)
              .then(a => {
                // Set Status
                SP.SOD.executeFunc(
                  SPScripts.SP.Script,
                  SPScripts.SP.UI.Status,
                  () => {
                    SP.UI.Notify.removeNotification(self.notify);
                    SP.UI.Status.removeAllStatus(false);
                    const status = SP.UI.Status.addStatus(
                      "Файл " + fileName + " успешно удален.",
                      ""
                    );
                    SP.UI.Status.setStatusPriColor(status, "green");
                  }
                );
              })
              .catch((e: SP.ClientRequestFailedEventArgs) => {
                // Set Status
                SP.SOD.executeFunc(
                  SPScripts.SP.Script,
                  SPScripts.SP.UI.Status,
                  () => {
                    SP.UI.Notify.removeNotification(self.notify);
                    SP.UI.Status.removeAllStatus(false);
                    const status = SP.UI.Status.addStatus(
                      "Ошибка при удалении файла " + fileName + ".",
                      e.get_errorDetails() + ""
                    );
                    SP.UI.Status.setStatusPriColor(status, "red");
                  }
                );
              });
          }
        }
      });
    } else if (arg === SaveEditButtonKey.Save) {
      // Notify
      SP.SOD.executeFunc(SPScripts.SP.Script, SPScripts.SP.UI.Notify, () => {
        self.notify = SP.UI.Notify.addNotification(
          "Выполняем сохранение файла",
          true
        );
      });
      // Change File Action
      this.changeFile({
        fileName: self.file.fileName,
        docType: self.docType,
        info: self.addInfo
      })
        .then(changeArgs => {
          // Save File Action
          self
            .saveFile({
              checkinType: SP.CheckinType.majorCheckIn,
              file: self.file
            })
            .then(args => {
              // self.saved = true;
              // Set Status
              SP.SOD.executeFunc(
                SPScripts.SP.Script,
                SPScripts.SP.UI.Status,
                () => {
                  SP.UI.Notify.removeNotification(self.notify);
                  SP.UI.Status.removeAllStatus(false);
                  const status = SP.UI.Status.addStatus(
                    "Файл " +
                      self.file.fileName +
                      " успешно сохранен в системе",
                    ""
                  );
                  SP.UI.Status.setStatusPriColor(status, "green");
                }
              );
            })
            .catch(e => {
              SP.SOD.executeFunc(
                SPScripts.SP.Script,
                SPScripts.SP.UI.Status,
                () => {
                  SP.UI.Notify.removeNotification(self.notify);
                  SP.UI.Status.removeAllStatus(false);
                  const status = SP.UI.Status.addStatus(
                    "Ошибка при сохранении файла " + self.file.fileName + ".",
                    e + ""
                  );
                  SP.UI.Status.setStatusPriColor(status, "red");
                }
              );
            });
        })
        .catch(e => {
          SP.SOD.executeFunc(
            SPScripts.SP.Script,
            SPScripts.SP.UI.Status,
            () => {
              SP.UI.Notify.removeNotification(self.notify);
              SP.UI.Status.removeAllStatus(false);
              const status = SP.UI.Status.addStatus(
                "Ошибка при сохранении файла " + self.file.fileName + ".",
                e + ""
              );
              SP.UI.Status.setStatusPriColor(status, "red");
            }
          );
        });
    }
  }

  public onchange(event: any) {
    // or use $store.dispatch(methodName, payload);
    //if (this.$store.state.mode === UploadMode.New) {
    this.changeFile({
      fileName: this.file.fileName,
      docType: this.docType,
      info: this.addInfo
    });
    //}
  }
}
</script>
<style scoped>
.fkr-select {
  border: none;
  height: 64px;
  width: 228px;
  background: #f3f3f3;
  border-bottom: 1px solid #5a6872;
}
.fkr-input {
  height: 47px;
  border: none;
  border-bottom: 1px solid #5a6872;
  background: #f3f3f3;
  width: 200px;
  resize: none;
  padding: 8px;
}
.fkr-input-cell {
  padding: 0px !important;
  margin: 0px !important;
}
.ms-formbody {
  padding-left: 6px;
}
.db-iconCell {
  width: 24px;
}
/* table.fkr-table > thead > tr > th:nth-child(3) > div,
table.fkr-table > thead > tr > th:nth-child(4) > div {
  padding-right: 8px;
} */
</style>
