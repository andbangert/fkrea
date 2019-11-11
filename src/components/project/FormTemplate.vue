<template>
  <div class="proj-card-container">
    <span id="part1">
      <!-- <table width="100%" class="ms-formtitle" border="0" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td>
              <span class="form-title">Карточка проекта</span>
            </td>
          </tr>
        </tbody>
      </table> -->
      <slot name="fields"></slot>
      <slot name="toolbar"></slot>
    </span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class FormTemplate extends Vue {}
</script>
<style>
.proj-card-container {
  width: 756px;
}
</style>
