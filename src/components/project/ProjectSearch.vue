<template>
  <div>
    <v-select ref="select" label="LookupValue" placeholder="Выберите значение">
      <template v-slot:no-options>Нет значений для выбора</template>
    </v-select>
    <br />
    <div>
      <ProjectList
        :siteUrl="siteUrl"
        :listId="projectList"
        :buildObjectListId="buildObjectList"
        :contractorListId="projectList"
        :items="projects"
      ></ProjectList>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Fkrea } from "@/constants";
import scr = Fkrea.SPScripts;
import {
  FormField,
  FormFieldLookup,
  SelectLookupValue,
  ProjectCardSettings,
  FormFieldText,
  FormMode,
  ProjectItem
} from "../../types";

import vSelect from "vue-select";
import ProjectList from "./ProjectList.vue";
import * as constants from "../../constants";
import proj = constants.Fkrea.Fields;
import { ProjectFormHelper, ProjectResult } from "../../projectFormHelper";
import * as utils from "@/utilities";
import fkr = utils.Fkrea;

Vue.component("v-select", vSelect);
@Component({
  components: { ProjectList }
})
export default class ProjectSearch extends Vue {
  @Prop() siteUrl!: string;
  @Prop() buildObjectList!: string;
  @Prop() contractorList!: string;
  @Prop() projectList!: string;

  private projectsData: ProjectItem[] = new Array<ProjectItem>();
  get projects() {
      console.log('on render');
    return this.projectsData;
  }

  mounted() {
    const optSettings = this.$refs.select as VueSelectOptions;
    this.initializeBuilObject(optSettings);
  }

  initializeBuilObject(select: VueSelectOptions) {
    const that = this;
    select.filterable = false;
    select.placeholder = "Введите адрес объекта для поиска комплектов. Минимум 3 символа";
    select.onSearch = async function(
      queryText: string,
      loading: (val: boolean) => void
    ) {
      if (!queryText || queryText.length < 3) {
        this.options = [];
        return;
      }
      try {
        loading(true);
        this.options = await that.SearchBuildObject(
          queryText,
          that.buildObjectList,
          loading
        );
      } finally {
        loading(false);
      }
    };

    select.onChange = async (value: string | Object) => {
      if (!value) {
        that.projectsData = new Array<ProjectItem>();
      }
      const bosr = value as SelectLookupValue;
      if (bosr) {
        try {
          const result = await ProjectFormHelper.getProjectsByBuildObject(
            this.siteUrl,
            this.projectList,
            bosr.LookupId
          );
          that.projectsData = result;
        } catch (e) {
          console.error(e);
        }
      }
    };
  }

  async SearchBuildObject(
    queryText: string,
    listId: string,
    loading: (val: boolean) => void
  ) {
    let values: SelectLookupValue[] = new Array<SelectLookupValue>();
    try {
      const objr = await utils.Fkrea.SearchListObject(queryText, listId, 100, [
        "ListItemID",
        "Title"
      ]);
      const results = objr as SP.JsonObjectResult;
      if (results) {
        const result = results.get_value() as ResultTableCollection;
        if (
          !result ||
          !result.ResultTables ||
          result.ResultTables.length === 0
        ) {
          loading(false);
          return values;
        }
        values = result.ResultTables[0].ResultRows.map(r => {
          return {
            LookupId: r.ListItemID,
            LookupValue: r.Title
          };
        });
      }
    } catch (e) {
      loading(false);
    }
    return values;
  }
}
</script>
