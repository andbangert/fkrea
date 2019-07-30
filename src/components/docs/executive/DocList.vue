<template>
  <div class="content">
    <!-- DOC ITEM -->
    <div v-for="item in docs" :key="item.id">
      <doc-item v-bind:document="item"></doc-item>
    </div>
    <div class="add_new_doc" @click="addFile()">Добавить документ</div>
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
  SelectLookupValue
} from "@/types";
import rootStore from "@/store/store";
import storeExec from "@/store/modules/executiveDocs/store";
import DocItem from "./DocItem.vue";
import { addFileDialog } from "@/components/project/inline";
import actions from "@/store/action-types";
import { showEditExecDocDialog } from "@/components/project/inline";
import {
  createNamespacedHelpers,
  ActionMethod,
  Computed,
  mapState,
  mapActions
} from "vuex";
import { settings } from "cluster";

//const { mapState, mapActions } = createNamespacedHelpers("executiveDocs");
const nsedocs = "executiveDocs";
const state = storeExec.state as ExecutiveDocsState;

@Component({
  components: { DocItem },
  computed: {
    ...mapState({
      project: project => rootStore.state.project,
      settings: settings => rootStore.state.projectSiteSettings
    }),
  },
  methods: {
    ...mapActions(nsedocs, {
      addDoc: actions.ADD_EXEC_DOC
    })
  }
})
export default class DocList extends Vue {
  @Prop()
  private docs!: ExecutiveDocument[];
  @Prop()
  private jobTypeId!: number;

  // State Computed
  private project!: Project;
  private settings!: ProjectSiteSettings;

  // State Actions
  private addDoc!: ActionMethod;

  private addFile() {
    // const self = this;
    showEditExecDocDialog(
      (doc) => {
        // console.log(doc);
        // self.addDoc(doc);
      },
      undefined,
      this.jobTypeId
    );
  }
}
</script>
