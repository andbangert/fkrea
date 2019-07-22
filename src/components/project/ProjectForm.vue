<template>
  <div id="app">
    <form-template>
      <template v-slot:fields>
        <table width="100%" class="ms-formtable" border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <field-template v-for="field in renderFields" :key="field.name">
              <template v-slot:label>
                <span
                  :class="{'add-field-label':(field.name === 'DesignerContracts' || field.name === 'Contracts')}"
                >{{field.displayName}}</span>
              </template>
              <template v-slot:control>
                <template v-if="checkLookupType(field)">
                  <span dir="none">
                    <template v-if="renderModeLookup(field)">
                      <v-select
                        :ref="field.name"
                        v-model="field.value"
                        label="LookupValue"
                        :options="getOptions(field.name)"
                        :multiple="enableMulti(field)"
                        placeholder="Выберите значение"
                      >
                        <template v-slot:no-options>Нет значений для выбора</template>
                      </v-select>
                    </template>
                    <template v-else>
                      <FieldLookupDisplay
                        :listId="field.lookupListId"
                        :itemid="field.LookupId"
                        :value="field.value"
                        :siteUrl="siteUrl"
                      ></FieldLookupDisplay>
                    </template>
                  </span>
                </template>
                <template v-else>
                  <span dir="none">
                    <input
                      type="text"
                      :ref="field.name"
                      :value="field.value"
                      v-model="field.value"
                      class="ms-long"
                    />
                  </span>
                </template>
              </template>
            </field-template>
          </tbody>
        </table>
      </template>
      <template v-slot:toolbar>
        <SPListItemToolbar :onSave="Save" :onCancel="_Cancel"></SPListItemToolbar>
      </template>
    </form-template>
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
import FieldLookupDisplay from "../forms/FieldLookupDisplay.vue";
import { listItemToProject } from "@/Project/helper";
import { initializeExecutiveDocs } from "@/docHelper";

Vue.component("save-dialog", OnSaveDialogForm);
Vue.component("v-select", vSelect);

interface SelectOptions {
  fieldName: string;
  options: SelectLookupValue[];
}

@Component({
  components: {
    FormTemplate,
    FieldTemplate,
    SPListItemToolbar,
    FieldLookupDisplay
  }
})
export default class ProjectForm extends Vue {
  @Prop()
  public fields!: FormField[];
  @Prop()
  public settings!: ProjectCardSettings;
  @Prop()
  public options!: SelectOptions[];
  @Prop() siteUrl!: string;
  @Prop() listId!: string;
  @Prop() itemId!: number;
  @Prop() mode!: FormMode;
  @Prop() scanLibId!: string;
  @Prop() executiveDocCardListId!: string;
  @Prop() executiveDocTypeListId!: string;

  helper!: ProjectFormHelper;
  // Strings
  _phBO = "Введите текст для поиска. Минимум 3 символа";
  _phSelect = "Значение не выбрано";
  _instructions: string =
    'Нажмите кнопку "Продолжить",' + " чтобы перейти к добавлению файлов.";
  _buttonOk: string = "Продолжить";
  notifId: string = "";

  // Data
  dataFields: FormField[] = this.fields;
  dataOptions: SelectOptions[] = this.options;

  // Computed
  get buildObjectField(): FormFieldLookup {
    const fld = <FormFieldLookup>(
      this.dataFields.find(f => f.name === proj.FieldBuildObj)
    );
    return fld;
  }

  get titleField(): FormFieldText {
    const fld = <FormFieldText>(
      this.dataFields.find(f => f.name === proj.FieldTitle)
    );
    return fld;
  }

  get titleFieldValue() {
    return this.titleField.value;
  }

  get pathField(): FormFieldText {
    const fld = <FormFieldText>(
      this.dataFields.find(f => f.name === proj.FieldPath)
    );
    return fld;
  }

  get renderFields() {
    return this.dataFields.filter(field => field.name !== proj.FieldPath);
  }

  get saveFields(): FormField[] {
    if (this.mode !== FormMode.New) {
      return this.dataFields.filter(
        f => f.name !== proj.FieldBuildObj || f.name !== proj.FieldPath
      );
    }
    return this.dataFields;
  }

  renderModeLookup(field: FormField) {
    if (field.name === proj.FieldBuildObj && this.mode !== FormMode.New) {
      return false;
    }
    return true;
  }

  @Watch("titleFieldValue")
  onChildChanged(val: string, oldVal: string) {
    if (this.mode === FormMode.New) {
      this.pathField.value = val;
    }
  }

  getClass(name: string) {
    const isAddClass = name === "DesignerContracts" || name === "Contracts";
    return {
      "add-field-label": isAddClass
    };
  }

  checkLookupType(field: FormField): boolean {
    return (
      field.type === "Lookup" ||
      field.type === "LookupMulti" ||
      field.name === "DesignerContracts" ||
      field.name === "Contracts"
    );
  }

  enableMulti(field: FormField): boolean {
    return (
      field.name === proj.FieldContractor ||
      field.name === proj.FieldDesignerContracts ||
      field.name === proj.FieldContracts ||
      field.name === proj.FieldTypeOfJobs ||
      field.name === proj.FieldDesigner
    );
  }

  getOptions(fieldName: string) {
    const opt = this.dataOptions.find(f => f.fieldName === fieldName);
    return (<SelectOptions>opt).options;
  }

  getOptionObject(fieldName: string) {
    const opt = this.dataOptions.find(f => f.fieldName === fieldName);
    return <SelectOptions>opt;
  }

  setOptions(fieldName: string, options: SelectLookupValue[]) {
    const opt = this.getOptionObject(fieldName);
    if (opt) {
      opt.options = options;
    }
  }

  clearOptions() {
    this.setOptions(proj.FieldContracts, []);
    this.setOptions(proj.FieldDesignerContracts, []);
    this.setOptions(proj.FieldDesigner, []);
    this.setOptions(proj.FieldContractor, []);
  }

  clearValues() {
    this.dataFields.forEach(f => {
      if (f.name === proj.FieldBuildObj) {
        return;
      }
      if (f.type === "Lookup" || f.type === "LookupMulti") {
        const fl = <FormFieldLookup>f;
        if (fl) {
          fl.value = fl.allowMulti ? [] : undefined;
        }
      } else {
        (<FormFieldText>f).value = "";
      }
    });
  }

  getFieldByName(fieldName: string) {
    const field = this.dataFields.find(f => f.name === fieldName);
    if (field) {
      return field;
    }
    return null;
  }

  // Hooks
  created() {
    this.helper = new ProjectFormHelper(this.saveFields, this.settings);
  }

  mounted() {
    if (this.mode === FormMode.New) {
      const boField = this.buildObjectField;
      const arrSelect = this.$refs[proj.FieldBuildObj] as VueSelectOptions[];
      this.initializeBuilObject(arrSelect[0]);
    }
  }

  setProjectResult(result: ProjectResult) {
    this.dataFields.forEach(f => {});
  }

  setTitleField(value: string) {
    this.titleField.value = value;
    this.pathField.value = value;
  }

  onTitleChanged(value: string) {
    this.pathField.value = this.helper.getTrimmedText(value);
  }

  initializeBuilObject(select: VueSelectOptions) {
    const that = this;
    select.filterable = false;
    select.placeholder = "Введите текст для поиска. Минимум 3 символа";
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
        this.options = await that.helper.SearchBuildObject(
          queryText,
          that.buildObjectField.lookupListId,
          loading
        );
      } finally {
        loading(false);
      }
    };

    select.onChange = async (value: string | Object) => {
      let val = value;
      if (!value) {
        this.clearOptions();
        this.clearValues();
        this.setTitleField("");
        return;
      }
      if (Array.isArray(value)) {
        val = value[0];
      }
      // Get external ID if edit form loading...
      const slv = val as SelectLookupValue;
      if (!slv) {
        this.clearOptions();
        this.clearValues();
        this.setTitleField("");
        return;
      }
      const trimmedValueText = that.helper.getTrimmedText(slv.LookupValue);
      this.setTitleField(trimmedValueText);
      const result = await that.helper.changeBuildObject(slv);
      if (result) {
        this.setOptions(proj.FieldContracts, result.contracts);
        this.setOptions(proj.FieldDesignerContracts, result.contracts);
        this.setOptions(proj.FieldDesigner, result.builders);
        this.setOptions(proj.FieldContractor, result.builders);
      } else {
        this.clearOptions();
      }
    };
  }

  // Save Functions
  private Save(): boolean {
    // Validate
    if (this.mode === FormMode.New) {
      // Create folders
      const path = this.titleField.value;
      if (!path) {
        this.helper.notifyOnError(
          "Ошибка сохранения",
          'Поле "Название" не может быть пустым'
        );
        return false;
      }
      const that = this;
      this.helper.createFolder(
        this.siteUrl,
        this.scanLibId,
        path,
        (folder: SP.Folder | null, exists, msg) => {
          if (exists && folder !== null) {
            that.helper.notifyOnError(
              "Ошибка создания папки проекта",
              "Папка проекта с таким иемене уже существует." +
                'Задайте другое имя в поле "Название" и попробуйте еще раз сохранить карточку.' +
                " Папка: " +
                folder.get_name()
            );
          } else if (folder !== null) {
            this.onSave();
          } else {
            this.helper.notifyOnError(
              "Ошибка создания папки проекта",
              msg ? msg : ""
            );
          }
        }
      );
    } else {
      this.onSave();
    }
    return false;
  }

  async onSave() {
    console.log(this.mode);
    this.helper
      .customSave(this.siteUrl, this.listId, this.itemId, this.mode)
      .then(result => {
        const project = listItemToProject(result);
        initializeExecutiveDocs(
          this.siteUrl,
          this.executiveDocCardListId,
          this.executiveDocTypeListId,
          project
        ).then(execCreateResult => {
          SP.SOD.executeFunc(
            constants.Fkrea.SPScripts.SP_UI_Dialog.Script,
            constants.Fkrea.SPScripts.SP_UI_Dialog.ShowModalDialog,
            () => {
              this.showOnSaveDialog(result.get_id());
            }
          );
        });
      })
      .catch(e => {});
  }

  private _Cancel() {
    let retUrl = this.siteUrl;
    try {
      let retUrl = GetUrlKeyValue("source");
      console.log(retUrl);
      if (!retUrl || retUrl === "") {
        console.log(retUrl);
        retUrl = this.siteUrl;
      }
    } catch (e) {}
    // Go Add File Page Dialog
    STSNavigate(SP.Utilities.HttpUtility.urlPathEncode(retUrl));
  }

  showOnSaveDialog(projectId: number) {
    console.log(projectId);
    SP.UI.ModalDialog.showModalDialog({
      autoSize: true,
      title: "Сохранение проекта...",
      html: this.createOnSaveDialogElement(
        "_onSaveDialog",
        'Нажмите кнопку "Продолжить", чтобы перейти к добавлению файлов.',
        "Продолжить",
        ""
      ),
      // Callback dialog return
      dialogReturnValueCallback: (dialogResult: SP.UI.DialogResult) => {
        if (dialogResult === SP.UI.DialogResult.OK) {
          let rurl = GetUrlKeyValue("source");
          const webUrl = this.siteUrl;
          const page = "Lists/Projects/DispFormTabsV1.aspx";
          const url = `${webUrl}/${page}?ID=${projectId}&returnUrl=${rurl}`;
          STSNavigate(url);
        } else {
          this._Cancel();
        }
      }
    });
  }

  private createOnSaveDialogElement(
    elementId: string,
    instructions: string,
    buttonOk: string,
    subject: ""
  ): HTMLElement {
    let element = document.getElementById(elementId);
    if (!element) {
      element = document.createElement("div");
      element.id = elementId;
    }

    const DialogComponent = Vue.extend({
      components: {
        OnSaveDialogForm
      },
      render: (h, context) => {
        return h(OnSaveDialogForm, {
          props: {
            instructions,
            buttonOk,
            subject
          },
          scopedSlots: {
            ["instructions"]: props => props.instructions,
            ["buttonOk"]: props => props.buttonOk,
            ["subject"]: props => props.subject
          }
        });
      }
    });
    const component = new DialogComponent().$mount(element);
    element.appendChild(component.$el);
    return element;
  }
}
</script>
