<template>
  <div class="item">
    <div class="grid">
      <h2>{{document.docTypeName}}</h2>
    </div>
    <div class="grid">
      <input type="text" :value="document.barCode" disabled />
      <!--  -->
      <a v-if="hasScan" :href="document.scanLink" target="_blank">Скан</a>
      <span v-else class="scan">&nbsp;</span>
      <!--  -->
      <span v-if="hasScan && !document.hasRemarks">Принят</span>
      <span v-else-if="document.hasRemarks" class="red">Замечания</span>
      <span v-else class="empty">Отсутствует</span>
      <!--  -->
      <div class="clearfix"></div>
      <div v-if="document.hasRemarks" class="text">{{document.remarks}}</div>
    </div>
    <div class="grid">
      <h3>
        <span v-if="document.required">Обязательный</span>
        <span v-else style="width: 97px; display: block;">&nbsp;</span>
      </h3>
      <h4>
        {{scanSize}}
        <br />Кб
      </h4>
      <div class="clearfix"></div>
    </div>
    <div class="grid">
      <h5>{{scanDate}}</h5>
    </div>
    <div class="grid">
      <span @click="onEditClick"></span>
    </div>
    <div class="grid">
      <span @click="onRemoveClick"></span>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { Project, ExecutiveDocument, ProjectSiteSettings } from "@/types";
import { createNamespacedHelpers, ActionMethod } from "vuex";
import {
  showEditExecDocDialog,
  showOnSaveDialog
} from "@/components/project/inline";
import store from "@/store/modules/executiveDocs/store";
import rootStore from "@/store/store";
import actions from "@/store/action-types";

const { mapActions, mapState, mapGetters } = createNamespacedHelpers(
  "executiveDocs"
);

@Component({
  methods: {
    ...mapActions([actions.EDIT_EXEC_DOC, actions.REMOVE_EXEC_DOC])
  },
  computed: {
    ...mapState({
      project: project => rootStore.state.project,
      settings: settings => rootStore.state.projectSiteSettings
    })
  }
})
export default class DocItem extends Vue {
  @Prop()
  private document!: ExecutiveDocument;
  private editExecDoc!: ActionMethod;
  private removeExecDoc!: ActionMethod;

  // State Computed
  private project!: Project;
  private settings!: ProjectSiteSettings;

  get hasScan() {
    return (
      this.document.scanLink !== undefined &&
      this.document.scanLink !== null &&
      this.document.scanLink !== ""
    );
  }
  get scanSize() {
    if (this.document && this.document.scanSize && this.document.scanSize > 0) {
      const size = Math.ceil(Math.round(this.document.scanSize / 1024));
      return size;
    }
    return 0;
  }

  get scanDate() {
    if (this.document && this.document.scanDate) {
      const date = this.document.scanDate;
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${day < 10 ? "0" + day : day}.${
        month < 10 ? "0" + month : month
      }.${date.getFullYear()}`;
    }
  }

  private onEditClick() {
    showEditExecDocDialog((result: ExecutiveDocument) => {}, this.document);
  }

  private onRemoveClick() {
    const self = this;
    showOnSaveDialog(
      "Удаление исполнительной документации",
      `Вы действительно хотите удалить документ ${this.document.title} ${this.document.barCode}?`,
      "Да",
      "",
      () => {
        self.removeExecDoc(self.document);
      },
      () => {}
    );
  }
}
</script>

<style>
.table .one .content .item .grid:nth-child(2) input[type="text"][disabled] {
  color: #313131;
}
</style>
