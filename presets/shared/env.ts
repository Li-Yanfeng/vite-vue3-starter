import { loadEnv } from 'vite'

const { NODE_ENV } = process.env

// 是否是开发环境
export const isDevelopment = NODE_ENV === 'development'

// 是否是生产环境
export const isProduction = NODE_ENV === 'production'

/**
 * wrapper env
 * Read all environment variable configuration files to process.env
 */
function wrapperEnv() {
    const env = isProduction ? loadEnv('production', '.') : loadEnv('development', '.')

    const ret: any = {}

    Object.keys(env).forEach(key => {
        // 获取所对应的值
        let val = env[key].replace(/\\n/g, '\n')

        if (['true', 'false'].includes(val)) {
            val = val === 'true'
        }
        if (['VITE_PORT'].includes(key)) {
            val = Number(val)
        }
        if (key === 'VITE_PROXY' && val) {
            try {
                val = JSON.parse(val)
            } catch (error) {

            }
        }

        // 重新设置值
        ret[key] = val
        process.env[key] = val
    })
    return ret
}

export const viteEnv = wrapperEnv()
