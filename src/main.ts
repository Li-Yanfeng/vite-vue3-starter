import 'virtual:windi-base.css'
import 'virtual:windi-components.css'

// ant-design-vue
import 'ant-design-vue/dist/antd.css'
// 自定义 css
import './styles/main.css'

import 'virtual:windi-utilities.css'
import 'virtual:windi-devtools'

import App from './App.vue'

const app = createApp(App)

app.mount('#app')
