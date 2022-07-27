/**
 * vite config
 *
 * @see https://vitejs.dev/config/
 */
import type { UserConfig } from 'vite'
import { resolve } from 'path'
import { viteEnv } from './presets/shared/env'
import { createPlugins } from './presets/plugin'

export default (): UserConfig => {
    // 读取所有环境变量配置文件到process.env
    const { VITE_PORT, VITE_PUBLIC_PATH } = viteEnv

    return {
        base: VITE_PUBLIC_PATH,
        // 插件
        plugins: createPlugins(viteEnv),
        // 解析
        resolve: {
            // 配置别名
            alias: {
                '~/': `${resolve(__dirname, 'src')}/`
            }
        },
        // 运行配置
        server: {
            host: '127.0.0.1',
            port: VITE_PORT,
            open: true
        }
    }
}
