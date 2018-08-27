import Vue from 'vue';
import VueMcalender from "../dist/index.js";

new Vue({
  el: '#app',
  components: {
    VueMcalender
  },
  data() {
    return {
      visible:true,
      options: {
        showHeader: false,
        beginDate: "2017-07-30",
        endDate: "2018-12-12",
        currentDate: "2018-08-03"
      }
    }
  },
  methods: {
    chooseDayItemHandle: function (dayItem) {
      console.log(dayItem)
    },

    slideChangeHandle:function(item) {
      console.log(item);
    }
  }
});