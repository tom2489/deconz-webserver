import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import App from '@/App.vue';
import router from '@/router';
import { i18n } from '@/i18n';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import { scheduleAutoLogout } from '@/utils/auth';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

scheduleAutoLogout(router);

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
});

app.use(i18n);
app.use(vuetify);

app.mount('#app');
