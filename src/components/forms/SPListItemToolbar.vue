<template>
  <table cellpadding="0" cellspacing="0" width="100%" style="padding-top: 7px">
    <tbody>
      <tr>
        <td width="100%">
          <table class="ms-formtoolbar" cellpadding="2" cellspacing="0" border="0" width="100%">
            <tbody>
              <tr>
                <td width="99%" class="ms-toolbar" nowrap="nowrap">
                  <img src="/_layouts/15/images/blank.gif?rev=23" width="1" height="18" alt>
                </td>

                <td class="ms-toolbar" nowrap="nowrap">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tbody>
                      <tr>
                        <td align="right" width="100%" nowrap="nowrap">
                          <input
                            id="btnSave"
                            type="button"
                            value="Сохранить и выйти"
                            accesskey="O"
                            class="ms-ButtonHeightWidth"
                            target="_self"
                            @click='onSaveClick'
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td class="ms-separator">&nbsp;</td>
                <td class="ms-toolbar" nowrap="nowrap">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tbody>
                      <tr>
                        <td align="right" width="100%" nowrap="nowrap">
                          <input
                            id="btnCancel"
                            type="button"
                            value="Закрыть"
                            @click="onCancelClick"
                            accesskey="C"
                            class="ms-ButtonHeightWidth"
                            target="_self"
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script lang="ts">

import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component
export default class SPListItemToolbar extends Vue {
  @Prop() onSave!: () => void;
  @Prop() onCancel!: () => void;
  mounted() {
    const btn = this.$refs["btnSave"] as HTMLButtonElement; // .focus();
    if (btn) {
      btn.focus();
    }
  }
  onSaveClick() {
    if(this.onSave) {
      this.onSave();
    }
  }
  onCancelClick() {
    if(this.onCancel) {
      this.onCancel();
    }
  }
}
</script>
