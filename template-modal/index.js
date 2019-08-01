define([
  'vue',
  'text!./index.html',
], function (Vue, template) {
  return Vue.extend({
    name: 'TemplateModal',
    template: template,
    props: {
      modalId: {
        type: String,
        require: true
      },
      modalTitle: {
        type: String,
        default: 'title'
      },
      container: {
        type: String,
        default: 'body'
      }
    },
    methods: {
      showModal: function (container) {
        var self = this;
        if (container) {
          this.modal.modal('show').prependTo(container);
        } else {
          this.modal.modal('show').prependTo(self.modalContainer);
        }
      },
      closeModal: function () {
        this.modal.modal('hide');
      }
    },
    computed: {
      modal: function() {
        var self = this;
        return $(self.$refs[self.modalId]);
      },
      modalContainer: function () {
        return this.container;
      }
    }
  })
});