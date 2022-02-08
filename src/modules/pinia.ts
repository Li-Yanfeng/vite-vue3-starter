/**
 * 状态管理库
 */
import { App } from 'vue'

export default (app: App) => app.use(createPinia())
