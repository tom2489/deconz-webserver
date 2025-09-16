import { mount } from 'cypress/vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';

Cypress.Commands.add('mountWithVuetify', (component, options = {}) => {
  const vuetify = createVuetify({ components, directives });
  return mount(component, {
    global: {
      plugins: [vuetify],
    },
    ...options,
  });
});
