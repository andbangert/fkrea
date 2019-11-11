<template>
  <div class="popup">
    <h2>Документ</h2>
    <form action>
      <div class="title">
        <h2>Штрихкод</h2>
        <h2>Система</h2>
        <h2></h2>
      </div>
      <div class="fields">
        <input type="text" v-model="fileData.barCode" @keypress.13.prevent />
        <select name="system" id="system" v-model="fileData.jobTypeId" @change="onSystemChanged()">
          <option
            v-for="jobType in typesOfJobs"
            :value="jobType.LookupId"
            :key="jobType.LookupId"
          >{{ jobType.LookupValue }}</option>
        </select>
        <a v-if="hasScan && scanLoading === false" :href="fileData.scanLink" target="_blank">Скан загружен</a>
        <span v-if="scanLoading === false && hasScan === false">Скан отсутствует</span>
        <span v-if="scanLoading">
          <img src="/_layouts/15/images/loading.gif" />&nbsp;Загружаем скан...
        </span>
      </div>
      <div class="title">
        <h2>Название документа</h2>
        <h2 v-if="fileData.required">Обязательный</h2>
        <h2 v-else>&nbsp;</h2>
        <h2>Форма</h2>
      </div>
      <div class="fields">
        <select name="docTitle" id="docTitle" v-model="fileData.docTypeId" @change="docTypeChanged">
          <option
            v-for="docType in execDocTypes"
            :value="docType.LookupId"
            :key="docType.LookupId"
          >{{ docType.LookupValue }}</option>
        </select>
        <select id="docForm" v-model="fileData.formType">
          <option>Не требуется</option>
          <option>Загружено в систему РСКР</option>
          <option>Подлинник</option>
          <option>Копия</option>
          <option>На диске</option>
        </select>
      </div>
      <div class="title">
        <div
          class="check"
          :class="{ active: fileData.hasRemarks }"
          @click="hasRemarksChecked"
        >Замечания</div>
        <input type="checkbox" v-model="fileData.hasRemarks" />
      </div>
      <div class="fields">
        <textarea v-model="fileData.remarks" :disabled="!fileData.hasRemarks"></textarea>
      </div>
      <div class="title">
        <h2>Комментарий</h2>
      </div>
      <div class="fields">
        <input type="text" v-model="fileData.comment" @keypress.13.prevent />
      </div>
      <div class="title">
        <h2>Место хранения</h2>
      </div>
      <div class="fields">
        <span>{{storageAddress}}</span>
      </div>

      <div class="clearfix"></div>
      <input type="submit" />
      <div class="run" @click="save()">Сохранить и выйти</div>
      <div class="out" @click="cancel()">Отмена</div>
      <div class="clearfix"></div>
    </form>
    <div class="clearfix"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";

import {
  createNamespacedHelpers,
  ActionMethod,
  mapState,
  mapActions
} from "vuex";
import store from "@/store/modules/executiveDocs/store";
import rootStore from "@/store/store";
import actions from "@/store/action-types";

import {
  ProjectSiteSettings,
  ExecutiveDocument,
  SelectLookupValue,
  Project,
  StorageAddressSettings,
  FileData
} from "@/types";
import {
  getAllListItemsAsSelectLookupValues,
  addExecutiveDoc,
  getExecutiveDocTypes,
  getStorageAddress,
  getEmptyExecutiveDoc
} from "@/docHelper";
import actionTypes from "@/store/action-types";
import { truncate } from "fs";

@Component({
  computed: {
    ...mapState({
      project: project => rootStore.state.project,
      siteSettings: siteSettings => rootStore.state.projectSiteSettings,
      storageSettings: storageSettings => rootStore.state.storageSvcSettings
    })
  },
  methods: {
    ...mapActions("executiveDocs", {
      getScanFile: actions.SCAN_EXEC_DOC,
      editExecDoc: actions.EDIT_EXEC_DOC,
      addExecDoc: actions.ADD_EXEC_DOC
    })
  }
})
export default class AddFile extends Vue {
  // Props
  @Prop()
  public doc!: ExecutiveDocument;
  @Prop()
  public jobTypeId!: number;

  // Store mappings
  private storageSettings!: StorageAddressSettings;
  private siteSettings!: ProjectSiteSettings;
  private getScanFile!: ActionMethod;
  private editExecDoc!: ActionMethod;
  private project!: Project;
  private addExecDoc!: ActionMethod;

  // Data
  private typesOfJobs: SelectLookupValue[] = new Array<SelectLookupValue>();
  private execDocTypes: SelectLookupValue[] = new Array<SelectLookupValue>();
  private fileData: ExecutiveDocument = this.doc
    ? this.doc
    : getEmptyExecutiveDoc(this.project, this.jobTypeId);

  private address: string = "";
  private scanLoading: boolean = false;

  // Computed
  get scanUrl() {
    return this.fileData.scanLink;
  }

  get hasScan() {
    if (this.scanUrl && this.scanUrl !== "") {
      return true;
    }
    return false;
  }

  get barCode() {
    return this.fileData.barCode;
  }

  get storageAddress() {
    return this.address;
  }
  // Watchers
  @Watch("barCode")
  private async barCodeChanged(newVal: string, oldVal: string) {
    this.scanLoading = true;
    try {
      if (newVal.length === 13) {
        const fileData = (await this.getScanFile(newVal)) as FileData[];
        if (fileData.length > 0) {
          const file = fileData[0];
          this.fileData.scanLink = file.url;
          this.fileData.scanSize = file.size;
          Vue.set(this.fileData, "scanDate", file.modified);
        } else {
          this.fileData.scanLink = null;
          //this.fileData.scanDate = null;
          Vue.set(this.fileData, "scanDate", null);
          this.fileData.scanSize = 0;
        }
        // Update storage address
        await this.getFileAddress(newVal);
      } else {
        this.fileData.scanLink = null;
        // this.fileData.scanDate = null;
        Vue.set(this.fileData, "scanDate", null);
        this.fileData.scanSize = 0;
        this.address = "";
      }
    } catch (e) {
      console.error(e);
    }
    this.scanLoading = false;
  }

  // Hooks
  private beforeCreate() {
    // this.$store.commit("initializeStore");
  }

  private created() {
    // Get All types of jobs
    if (this.project && this.project.jobTypes) {
      this.typesOfJobs.push(...this.project.jobTypes);
      // When add new file this property should be reactive.
      // Props initialized before state.
      Vue.set(this.fileData, "projectId", this.project.id);
    }
    if (this.fileData) {
      // Edit botton on item
      this.initDocTypes(this.fileData.jobTypeId)
        .then(() => {})
        .catch(e => {});
    } else if (this.jobTypeId) {
      // Add botton on group
      this.initDocTypes(this.jobTypeId)
        .then(() => {})
        .catch(e => {});
    }
  }

  private mounted() {
    if (this.fileData && this.fileData.barCode) {
      const self = this;
      this.getFileAddress(this.fileData.barCode);
    }
  }

  // Methods
  private docTypeChanged() {
    const docTypeId = this.fileData.docTypeId;
    if (this.execDocTypes) {
      const val = this.execDocTypes.find(edt => edt.LookupId === docTypeId);
      if (val && val.required) {
        this.fileData.required = val.required;
      } else {
        this.fileData.required = false;
      }
    }
  }
  private async getFileAddress(barCode: string) {
    if (
      this.storageSettings &&
      this.storageSettings.url &&
      this.storageSettings.userId
    ) {
      this.address = await getStorageAddress(
        this.storageSettings.url,
        this.storageSettings.userId,
        barCode
      );
    }
  }

  private async onSystemChanged() {
    if (this.fileData && this.fileData.jobTypeId) {
      this.getJobTypeNameById(this.fileData.jobTypeId);
      await this.initDocTypes(this.fileData.jobTypeId);
    }
  }

  private getJobTypeNameById(id: number) {
    if (this.project.jobTypes) {
      const jt = this.project.jobTypes.find(j => j.LookupId === id);
      if (jt) {
        return jt.LookupValue;
      }
    }
    return "";
  }

  private setDocTypeName() {
    if (this.execDocTypes) {
      const jt = this.execDocTypes.find(
        j => j.LookupId === this.fileData.docTypeId
      );
      if (jt) {
        this.fileData.title = jt.LookupValue;
      }
    }
  }

  private hasRemarksChecked(event: Event) {
    if (event.srcElement) {
      const rootEle = event.srcElement as HTMLElement;
      const ele = rootEle.nextSibling as HTMLElement;
      if (ele) {
        ele.click();
      }
    }
  }

  private async save(result: SP.UI.DialogResult) {
    this.setDocTypeName(); // should be a watch.
    if (this.fileData.id > 0) {
      await this.editExecDoc(this.fileData);
    } else {
      await this.addExecDoc(this.fileData);
    }
    const self = this;
    SP.SOD.executeFunc(
      "sp.ui.dialog.js",
      "SP.UI.ModalDialog.showModalDialog",
      () => {
        SP.UI.ModalDialog.commonModalDialogClose(1, self.fileData);
      }
    );
  }

  private cancel(result: SP.UI.DialogResult) {
    SP.SOD.executeFunc(
      "sp.ui.dialog.js",
      "SP.UI.ModalDialog.showModalDialog",
      () => {
        SP.UI.ModalDialog.commonModalDialogClose(result, null);
      }
    );
  }

  // Helpers
  private async initDocTypes(jobTypeId: number) {
    if (this.siteSettings.executiveDocTypesListId) {
      const docTypes = await getExecutiveDocTypes(
        this.siteSettings.siteUrl,
        this.siteSettings.executiveDocTypesListId,
        [jobTypeId]
      );
      this.execDocTypes = docTypes;//.push(...docTypes);
      // Set default for new doc.
      if (this.fileData.id === 0 && this.execDocTypes.length > 0) {
        const edt = this.execDocTypes[0];
        this.fileData.title = edt.LookupValue;
        this.fileData.docTypeId = edt.LookupId;
        if (edt.required) {
          this.fileData.required = edt.required;
        } else {
          this.fileData.required = false;
        }
      }
    }
  }
}
</script>
