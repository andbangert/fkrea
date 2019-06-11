<template>
  <div>
    <div class="ms-toolbar ms-alignLeft">
      <div class="ms-list-addnew ms-list-addnew-aligntop ms-textXLarge">
        <!-- <slot name="opName">
          Следующие файлы были изменены:
        </slot>-->
        <slot v-bind:subject="subject">{{ subject }}</slot>
      </div>
      <div class="ms-list-addnew ms-list-addnew-aligntop ms-textXLarge ms-alignLeft">
        <slot v-bind:body="body">{{body}}</slot>
      </div>
      <div class="ms-list-addnew ms-list-addnew-aligntop ms-textXLarge">
        <!-- <slot name="instruction">
        Нажмите кнопку "сохранить", чтобы сохранить изменения или отмена, чтобы выйти без сохранения.
        </slot>-->
        <slot v-bind:instructions="instructions">{{ instructions }}</slot>
      </div>
    </div>
    <div class="ms-toolbar ms-alignLeft">
      <button type="button" @click="onclick(1)" id="btnSave" ref="btnSave">
        <slot v-bind:buttonOk="buttonOk">{{ buttonOk }}</slot>
      </button>&nbsp;
      <button type="button" @click="onclick(0)" id="btnCancel">Отмена</button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { Fkrea } from "../constants";

import scr = Fkrea.SPScripts;

@Component
export default class OnSaveDialogForm extends Vue {
  @Prop() subject!: string;
  @Prop() instructions!: string;
  @Prop() body!: string;
  @Prop() buttonOk!: string;

  mounted() {
    const btn = this.$refs["btnSave"] as HTMLButtonElement; // .focus();
    if (btn) {
      btn.focus();
    }
  }
  onclick(result: SP.UI.DialogResult) {
    SP.SOD.executeFunc(
      scr.SP.UI.Dialog.Script,
      scr.SP.UI.Dialog.ShowModalDialog,
      () => {
        SP.UI.ModalDialog.commonModalDialogClose(result, "");
      }
    );
  }
}
</script>
