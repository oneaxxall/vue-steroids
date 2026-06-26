<script>
module.exports = {

  layout : 'default' ,  // layout default

  data: function() {
    return {
      value: '',
      label: 'Input Text',
      placeholder: 'Type something...' , 
      length : 0
    }
  },

  props: {
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
      this.length = this.value.length;
    }
  },

  mounted: function() {
    console.log('[input-text] Component mounted')
  }
}
</script>

<template>
  <div class="input-text-component">
    <label class="input-label">{{ displayLabel }} {{length}}</label>
    <input 
      type="text" 
      :value="value"
      :placeholder="displayPlaceholder"
      @input="onInput"
      class="input-field"
    />
  </div>
</template>
