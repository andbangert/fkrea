<template>
  <div class="item">
    <div class="grid">
      <h2>{{document.docTypeName}}</h2>
    </div>
    <div class="grid">
      <input type="text" v-model="document.barCode" />
      <a v-if="hasScan" href="#" class="none">Скан</a>
      <span v-if="document.hasRemarks" class="red">Замечания</span>
      <span v-else>Принят</span>
      <div class="clearfix"></div>
      <div v-if="document.hasRemarks" class="text">{{document.remarks}}</div>
    </div>
    <div class="grid">
      <h3>
        <span v-if="document.required">Обязательный</span>
      </h3>
      <h4>
        2 345
        <br />Кб
      </h4>
      <div class="clearfix"></div>
    </div>
    <div class="grid">
      <h5>20.04.2019</h5>
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
import { showEditExecDocDialog } from "@/components/project/inline";
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
  private onEditClick() {
    showEditExecDocDialog(
      (result: ExecutiveDocument) => {
        this.editExecDoc(result);
      },
      this.settings,
      this.project.id,
      this.document
    );
  }

  private onRemoveClick() {
    this.removeExecDoc(this.document);
  }
}
</script>
