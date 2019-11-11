<template>
  <div style="width: 210mm padding:1em;1em;">
    <h2 style="text-align: right; margin-left: 100px;">
      <span
        style="font-size: 14px;"
      >&quot;Утверждаю&quot; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>
    </h2>
    <h2 style="text-align: right; margin-left: 100px;">
      <span style="font-size: 18px;">Начальник _____________________</span>
    </h2>
    <p style="text-align: right; font-size: 14px;">
      <span style="font-size: 14px;">_______________________________</span>
    </p>
    <p style="text-align: right;">
      <span style="font-size: 14px;">_______________________________</span>
    </p>
    <p style="text-align: right;">
      <span
        style="font-size: 14px;"
      >&quot; &nbsp; &nbsp; &quot; _____________ 20 &nbsp; г. &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>
    </p>
    <p style="text-align: right;">
      <br />
    </p>
    <p style="text-align: center;">
      <strong>РЕЕСТР № ____</strong>
    </p>
    <p style="text-align: center;">
      <strong>по завершенному объекту МКД, расположенного по адресу:</strong>
    </p>
    <p style="text-align: center;">
      <strong>{{buildingAddress}}</strong>
    </p>
    <p style="text-align: center;">
      <strong>по договору</strong>
    </p>
    <p style="text-align: center;">
      <strong>{{contract}}</strong>
    </p>
    <table
      class="table-report"
      style="width: 100%; border-collapse: collapse;"
      cellspacing="0"
      cellpadding="0"
    >
      <thead>
        <tr>
          <th style="border: 1px solid #333333; padding: 10px 10px; min-width:10mm">
            <span style="font-size: 12px;">№ п/п</span>
          </th>
          <th style="border: 1px solid #333333; padding: 10px 10px;">
            <span style="font-size: 12px;">Наименование документа</span>
          </th>
          <th style="border: 1px solid #333333; padding: 10px 10px;">
            <span style="font-size: 12px;">Инж. Система/общий</span>
          </th>
          <th style="border: 1px solid #333333; padding: 10px 10px;">
            <span style="font-size: 12px;">Подрядная организация</span>
          </th>
          <th style="border: 1px solid #333333; padding: 10px 10px;">
            <span style="font-size: 12px;">Дата и номер документа (при наличии)</span>
          </th>
          <th style="border: 1px solid #333333; padding: 10px 10px;">
            <span style="font-size: 12px;">Тип экземпляра (оригинал или копия)</span>
          </th>
          <th style="border: 1px solid #333333; padding: 10px 10px;">
            <span style="font-size: 12px;">Отметка о наличии документа</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in docs" :key="doc.id">
          <td style="border: 1px solid #333333; padding: 10px 10px;">{{doc.num}}</td>
          <td style="border: 1px solid #333333; padding: 10px 10px;">{{doc.title}}</td>
          <td
            v-if="doc.header"
            style="border: 1px solid #333333; padding: 10px 10px; background: #aaaaaa; font-weight: bold;"
          >{{doc.system}}</td>
          <td style="border: 1px solid #333333; padding: 10px 10px;" v-else>{{doc.system}}</td>
          <td style="border: 1px solid #333333; padding: 10px 10px;">{{doc.builder}}</td>
          <td style="border: 1px solid #333333; padding: 10px 10px;"></td>
          <td style="border: 1px solid #333333; padding: 10px 10px;">{{doc.form}}</td>
          <td style="border: 1px solid #333333; padding: 10px 10px;">{{doc.comment}}</td>
        </tr>
      </tbody>
    </table>
    <p>
      <br />
    </p>
    <p style="text-align: justify;">
      <span style="font-size: 12px;">&nbsp; &nbsp; &nbsp;Составил:</span>
    </p>
    <p style="text-align: justify;">
      <strong>
        <span
          style="font-size: 14px;"
        >&nbsp; &nbsp; &nbsp;Инженер технадзора ТУ (_________) &nbsp; ______________________________ / &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;/</span>
      </strong>
    </p>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import {
  Project,
  ExecutiveDocument,
  ExecutiveDocsState,
  ProjectSiteSettings,
  SelectLookupValue,
  IndexedExecDocs,
  DocReport
} from "@/types";
import rootStore from "@/store/store";
import storeExec from "@/store/modules/executiveDocs/store";
import actions from "@/store/action-types";
import { showEditExecDocDialog } from "@/components/project/inline";
import { ActionMethod, Computed, mapState, mapActions, mapGetters } from "vuex";
import { formatDate } from "@/utilities";
const nsedocs = "executiveDocs";
const state = storeExec.state as ExecutiveDocsState;

@Component({
  computed: {
    ...mapState({
      project: project => rootStore.state.project,
      settings: settings => rootStore.state.projectSiteSettings
    }),
    ...mapGetters(nsedocs, ["groupedDocs"])
  }
})
export default class PrintExecDocsDialog extends Vue {
  @Prop()
  private projectId!: number;
  private project!: Project;
  private groupedDocs!: IndexedExecDocs;

  get buildingAddress() {
    if (this.project.buildObject && this.project.buildObject.length > 0) {
      return this.project.buildObject[0].LookupValue;
    }
    return "";
  }
  get builder() {
    if (this.project.builder && this.project.builder.length > 0) {
      return this.project.builder[0].LookupValue;
    }
    return "";
  }
  get contract() {
    if (this.project.contracts && this.project.contracts.length > 0) {
      return this.project.contracts[0].LookupValue;
    }
    return "";
  }
  get docs() {
    if (this.project.jobTypes && this.project.jobTypes.length > 0) {
      console.log(this.project.jobTypes);
      const docs = new Array<DocReport>();
      let count = 0;
      this.project.jobTypes.forEach(jt => {
        console.log(jt);
        console.log(this.groupedDocs);
        const gdocs = this.groupedDocs[jt.LookupId];
        let id = 0;
        if (jt.LookupId > 0) {
          docs.push({
            id: id,
            num: "",
            title: "",
            system: jt.LookupValue,
            builder: "",
            date: "",
            form: "",
            comment: "",
            header: true
          });
          id++;
        }
        gdocs.forEach(d => {
          count++;
          const docDate = d.scanDate ? formatDate(d.scanDate, "D.M.YYYY") : "";
          docs.push({
            id: id,
            num: count,
            title: d.title,
            system: jt.LookupValue,
            builder: this.builder,
            date: docDate,
            form: d.formType,
            comment: d.comment,
            header: false
          });
          id++;
        });
      });
      console.log(docs);
      return docs;
    }
    return [];
  }
  created() {
    console.log(this.projectId);
  }
  beforeCreate() {
    const pidStr = GetUrlKeyValue("pid");
    if (!pidStr && pidStr === "") {
      throw Error("Project id must be set as get parameter.");
    }
    const projectId = Number(pidStr);
    this.$store.commit("initializeStore", projectId);
  }
}
</script>
<style scoped>
.header {
  background: #aaaaaa;
  font-weight: bold;
}
.table-report {
  width: 100%;
}
.table-report tbody tr td,
.table-report thead tr th {
  border: 1px solid #333333;
}
.table-report tbody tr td,
.table-report thead tr th {
  padding: 10px 10px;
}
@media print {
  title {
    display: none !important;
  }
}
@media print {
  head > title {
    display: none !important;
  }
}
</style>
