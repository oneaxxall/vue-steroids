<script>
module.exports = {
  data: function() {
    return {
      value: '',
      label: 'Input Text',
      placeholder: 'Type something...'
    }
  },

  props: {
    labelValue : '' , 
    modelValue: {
      type: String,
      default: ''
    },
    inputLabel: {
      type: String,
      default: ''
    }
  },

  computed: {
    displayLabel: function() {
      return this.inputLabel || this.label
    },
    displayPlaceholder: function() {
      return this.modelValue || this.placeholder
    }
  },

  methods: {
    onInput: function(event) {
      this.value = event.target.value
      this.$emit('update:modelValue', this.value)
      this.$emit('input', this.value)
    }
  },

  mounted: function() {
    console.log('[input-text] Component mounted')
  }
}
</script>

<template>
  <div class="input-text-component">
    <label class="input-label">Input Text 2 {{labelValue}} : </label>
    <input 
      type="text" 
      :value="value"
      :placeholder="displayPlaceholder"
      @input="onInput"
      class="input-field"
    />
  </div>
</template>
