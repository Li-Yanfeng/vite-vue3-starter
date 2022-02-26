/**
 * 进度条插件
 */
import { App } from 'vue'
import NProgress from 'nprogress'
import { router } from './router'

export default (app: App) => {
    router.beforeEach(() => {
        NProgress.start()
    })

    router.afterEach(() => {
        NProgress.done()
    })
}
