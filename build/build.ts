/**
 * create build
 */
export function createBuild() {
    return {
        // 最终构建的浏览器兼容目标
        target: 'esnext',
        // 指定输出路径
        // outDir: dist
        // 混淆器： terser 构建后文件体积更小; esbuild，构建速度更快，压缩率只差 1%-2%
        minify: 'terser',
        // 压缩配置
        terserOptions: {
            compress: {
                // 生产环境移除console
                drop_console: true,
                // 生产环境移除debugger
                drop_debugger: true
            }
        },
        // 启用/禁用 brotli 压缩大小报告
        brotliSize: false,
        // chunk 大小警告的限制（以 kbs 为单位）
        chunkSizeWarningLimit: 2000
    }
}
