<template>
  <span>
    <template v-if="isArray">
      <span v-for="val in arrayValues" :key="val.LookupId">
        <a :href="url(val)">{{val.LookupValue}}</a>&nbsp;
      </span>
    </template>
    <template v-else>
      <span>
        <a :href="url(singleValue)" target="_blank">{{singleValue.LookupValue}}</a>&nbsp;
      </span>
    </template>
  </span>
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
  FormMode
} from "../../types";

import FormTemplate from "./FormTemplate.vue";
import FieldTemplate from "./FieldTemplate.vue";
import SPListItemToolbar from "../forms/SPListItemToolbar.vue";
import OnSaveDialogForm from "@/components/OnSaveDialogForm.vue";
import vSelect from "vue-select";
import * as constants from "../../constants";
import { ProjectFormHelper, ProjectResult } from "../../projectFormHelper";
import proj = constants.Fkrea.Fields;

@Component
export default class FieldLookupDisplay extends Vue {
  @Prop() siteUrl!:string;
  @Prop() listId!: string;
  @Prop() displayText!: string;
  @Prop() value!: SelectLookupValue[] | SelectLookupValue;

  get isArray() {
    return Array.isArray(this.value);
  }
  get singleValue(): SelectLookupValue {
    return this.value as SelectLookupValue;
  }
  get arrayValues(): SelectLookupValue[] {
    return this.value as SelectLookupValue[];
  }
  url(value: SelectLookupValue) {
    return `${this.siteUrl}/_layouts/15/listform.aspx?PageType=4&ListId=${this.listId}&ID=${
      value.LookupId
    }&RootFolder=*`;
  }
}
</script>
