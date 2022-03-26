/**
 * vite config
 *
 * @see https://vitejs.dev/config/
 */
import { resolve } from 'path'
import { defineConfig } from 'vite'
import plugins from './build/plugins'

export default defineConfig({
    resolve: {
        alias: {
            '~/': `${resolve(__dirname, 'src')}/`
        }
    },
    plugins: plugins()
})
