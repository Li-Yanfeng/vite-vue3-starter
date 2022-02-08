import { resolve } from 'path'
import plugins from './presets/plugin.config'
import { defineConfig } from 'vite'

export default defineConfig({
    resolve: {
        alias: {
            // 配置别名
            '~': `${resolve(__dirname, 'src')}`
        }
    },
    plugins: plugins()
})
