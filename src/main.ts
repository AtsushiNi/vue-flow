import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VTreeview } from 'vuetify/labs/VTreeview'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/lib/styles/main.sass'
import './style.css'
import App from './App.vue'

const vuetify = createVuetify({
  components: {
    ...components,
    VTreeview,
  },
  directives,
  icons: {
    defaultSet: 'mdi',
  }
})

createApp(App)
  .use(vuetify)
  .mount('#app')
