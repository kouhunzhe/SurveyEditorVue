<template>
 <div>
   {{test}}
 </div>
</template>
<script>
export default {
  name:"TabDesigner",
  componentName: 'TabDesigner',
  data: () => ({
    test:"TabDesigner"
  }),
  computed: {
    computedTest () {
    }
  },
  methods: {
    methodsTest (params) {
    }
  },
  watch: {
    watchTest (val) {
    }
  }
}
</script>

<style scoped>
  .style-test{
    font-size: 16px;
  }
  </style>