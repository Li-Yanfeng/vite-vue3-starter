import { resolve } from 'path'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import Inspect from 'vite-plugin-inspect'
import Windicss from 'vite-plugin-windicss'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Rmovelog from 'vite-plugin-removelog'
import ViteRestart from 'vite-plugin-restart'
import I18n from '@intlify/vite-plugin-vue-i18n'
import { viteMockServe } from 'vite-plugin-mock'
import Layouts from 'vite-plugin-vue-meta-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import viteCompression from 'vite-plugin-compression'
import { NaiveUiResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers'
import Modules from 'vite-plugin-use-modules'
import { GenerateTitle } from './plugins/html'
import { AutoImportResolvers, normalizeResolvers } from './shared/resolvers'
import Markdown, { markdownWrapperClasses } from './plugins/markdown'

/**
 * create plugin
 *
 * @param viteEnv /
 */
export function createPlugins(viteEnv: any) {
    const { VITE_USE_MOCK, VITE_APP_INSPECT, VITE_BUILD_COMPRESS } = viteEnv

    return [
        // 模块自动加载
        Modules({
            auto: true
        }),
        // 生成 title
        GenerateTitle(),
        // vue 官方插件，用来解析 sfc
        Vue({
            include: [/\.vue$/, /\.md$/]
        }),
        // markdown 编译插件
        Markdown(),
        // 文件路由
        Pages({
            extensions: ['vue', 'md', 'tsx']
        }),
        // 布局系统
        Layouts(),
        // 调试工具
        Inspect({
            enabled: VITE_APP_INSPECT
        }),
        // windicss 插件
        Windicss({
            safelist: markdownWrapperClasses
        }),
        // mock 服务
        viteMockServe({
            prodEnabled: VITE_USE_MOCK
        }),
        // https://icones.netlify.app/
        Icons({
            autoInstall: true
        }),
        // 组件自动按需引入
        Components({
            extensions: ['vue', 'md', 'tsx'],
            include: [/\.md$/, /\.vue$/, /\.tsx$/],
            dts: resolve(__dirname, './types/components.d.ts'),
            resolvers: normalizeResolvers({
                onlyExist: [
                    [NaiveUiResolver(), 'naive-ui'],
                    [VueUseComponentsResolver(), '@vueuse/components']
                ],
                include: [IconsResolver()]
            })
        }),
        // api 自动按需引入
        AutoImport({
            dirs: [
                'src/stores',
                'src/composables'
            ],
            dts: './presets/types/auto-imports.d.ts',
            imports: ['vue', 'pinia', 'vue-i18n', 'vue-router', '@vueuse/core'],
            resolvers: AutoImportResolvers,
            eslintrc: {
                enabled: true,
                globalsPropValue: true,
                filepath: 'presets/eslint/.eslintrc-auto-import.json'
            }
        }),
        // i18n 国际化支持
        I18n({
            runtimeOnly: true,
            compositionOnly: true,
            include: [resolve(__dirname, '../locales/**')]
        }),
        // 预设热重启服务
        ViteRestart({
            restart: ['.env*', 'presets/plugin.[jt]s', 'presets/shared/**/*']
        }),
        // tsx 支持
        vueJsx(),
        // 生产环境资源压缩
        viteCompression({
            // @ts-ignore
            algorithm: VITE_BUILD_COMPRESS
        }),
        // 生产环境下移除 console.log, console.warn, console.error
        Rmovelog()
    ]
}
