/**
 * vite config
 *
 * @see https://vitejs.dev/config/
 */
import type { UserConfig } from 'vite'
import { resolve } from 'path'
import { format } from 'date-fns'
import { viteEnv } from './build/env'
import { createPlugins } from './build/plugin'
import { createProxy } from './build/proxy'
import { createBuild } from './build/build'
import pkg from './package.json'

const { dependencies, devDependencies, name, version } = pkg

// 应用信息
const __APP_INFO__ = {
    pkg: { dependencies, devDependencies, name, version },
    lastBuildTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
}

function pathResolve(dir: string) {
    return resolve(process.cwd(), '.', dir)
}

export default (): UserConfig => {
    // 读取所有环境变量配置文件到process.env
    const { VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY } = viteEnv

    return {
        base: VITE_PUBLIC_PATH,
        // 定义全局常量替换方式
        define: {
            __APP_INFO__: JSON.stringify(__APP_INFO__)
        },
        // 插件
        plugins: createPlugins(viteEnv),
        // 解析
        resolve: {
            // 配置别名
            alias: [
                {
                    find: '@',
                    replacement: `${pathResolve('src')}/`
                }
            ],
            dedupe: ['vue']
        },
        // 样式
        css: {
            // 预处理器的选项
            preprocessorOptions: {
                scss: {
                    // 避免出现: build时的 @charset 必须在第一行的警告
                    charset: false,
                    additionalData: `@import "src/styles/basic.scss";`
                }
            }
        },
        // 运行配置
        server: {
            host: true,
            port: VITE_PORT,
            open: true,
            proxy: createProxy(VITE_PROXY)
        },
        // 构建方式
        build: createBuild()
    }
}
