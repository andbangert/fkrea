<template>
  <div class="popup" style="display: block;">
    <h2>Документ</h2>
    <form action>
      <div class="title">
        <h2>Штрихкод</h2>
        <h2>Система</h2>
        <h2></h2>
      </div>
      <div class="fields">
        <input type="text" v-model="fileData.barCode" />
        <select name="system" id="system" v-model="fileData.jobTypeId" @change="onSystemChanged()">
          <option
            v-for="jobType in typesOfJobs"
            :value="jobType.LookupId"
            :key="jobType.LookupId"
          >{{ jobType.LookupValue }}</option>
        </select>
        <a href="#">Скан загружен</a>
      </div>
      <div class="title">
        <h2>Название документа</h2>
        <h2>Обязательный</h2>
        <h2>Форма</h2>
      </div>
      <div class="fields">
        <select name="docTitle" id="docTitle" v-model="fileData.docTypeId">
          <option
            v-for="docType in execDocTypes"
            :value="docType.LookupId"
            :key="docType.LookupId"
          >{{ docType.LookupValue }}</option>
        </select>
        <select id="docForm" v-model="fileData.formType">
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
        <textarea v-model="fileData.remarks"></textarea>
      </div>
      <div class="title">
        <h2>Комментарий</h2>
      </div>
      <div class="fields">
        <input type="text" v-model="fileData.comment" />
      </div>
      <div class="title">
        <h2>Место хранения</h2>
      </div>
      <div class="fields">
        <span>Проспект Мира 9 /комн 113/Стеллаж А1/Ячейка А1-1/ Папка ЮВАО -196</span>
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
import { Prop } from "vue-property-decorator";
import {
  ProjectSiteSettings,
  ExecutiveDocument,
  SelectLookupValue,
  Project
} from "@/types";
import {
  getAllListItemsAsSelectLookupValues,
  addExecutiveDoc,
  getExecutiveDocTypes
} from "@/docHelper";

@Component
export default class AddFile extends Vue {
  @Prop()
  public siteSettings!: ProjectSiteSettings;
  @Prop()
  public doc!: ExecutiveDocument;
  @Prop()
  public projectId!: number;

  // Data
  private typesOfJobs: SelectLookupValue[] = new Array<SelectLookupValue>();
  private execDocTypes: SelectLookupValue[] = new Array<SelectLookupValue>();
  private fileData: ExecutiveDocument = this.doc
    ? this.doc
    : {
        id: 0,
        hasRemarks: false,
        required: false,
        projectId: this.projectId ? this.projectId : -1
      };

  // Hooks
  private async created() {
    // Get All types of jobs
    if (this.siteSettings.typesOfJobsListId) {
      const typesOfJobs = await getAllListItemsAsSelectLookupValues(
        this.siteSettings.siteUrl,
        this.siteSettings.typesOfJobsListId
      );
      this.typesOfJobs.push(...typesOfJobs);
      // Initializ doc types
      if (this.fileData && this.fileData.jobTypeId) {
        await this.initDocTypes(this.fileData.jobTypeId);
      }
    }
  }

  private async onSystemChanged() {
    if (this.fileData && this.fileData.jobTypeId) {
      await this.initDocTypes(this.fileData.jobTypeId);
    }
  }

  private hasRemarksChecked(event: Event) {
    if (event.srcElement) {
      const ele = event.srcElement.nextSibling as HTMLElement;
      if (ele) {
        ele.click();
      }
    }
  }

  private async save(result: SP.UI.DialogResult) {
    if (this.siteSettings.executiveDocCardsListId) {
      const file = addExecutiveDoc(
        this.siteSettings.siteUrl,
        this.siteSettings.executiveDocCardsListId,
        this.fileData
      );
      SP.SOD.executeFunc(
        "sp.ui.dialog.js",
        "SP.UI.ModalDialog.showModalDialog",
        () => {
          SP.UI.ModalDialog.commonModalDialogClose(result, file);
        }
      );
    } else {
      // Error....
    }
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
    console.log("Init doc Types");
    if (
      this.siteSettings.executiveDocTypesListId &&
      this.fileData &&
      this.fileData.jobTypeId
    ) {
      const docTypes = await getExecutiveDocTypes(
        this.siteSettings.siteUrl,
        this.siteSettings.executiveDocTypesListId,
        [jobTypeId]
      );
      console.log(docTypes);
      this.execDocTypes = [];
      this.execDocTypes.push(...docTypes);
    }
  }
}
</script>
