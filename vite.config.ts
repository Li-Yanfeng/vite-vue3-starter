import { resolve } from 'path'
import { defineConfig } from 'vite'
import plugins from './presets/plugin.config'

export default defineConfig({
    resolve: {
        alias: {
            // 配置别名
            '~': `${resolve(__dirname, 'src')}`
        }
    },
    plugins: plugins()
})
