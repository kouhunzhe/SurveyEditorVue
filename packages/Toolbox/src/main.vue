<template>
 <div>
   {{test}}
 </div>
</template>
<script>
export default {
  name:"Toolbox",
  componentName: 'Toolbox',
  data: () => ({
    test:"Toolbox"
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