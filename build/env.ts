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

    Object.keys(env).forEach(envName => {
        // 获取所对应的值
        let realValue = env[envName].replace(/\\n/g, '\n')
        realValue = realValue === 'true' ? true : realValue === 'false' ? false : realValue

        if (envName === 'VITE_PORT') {
            realValue = Number(realValue)
        } else if (envName === 'VITE_PROXY') {
            try {
                realValue = JSON.parse(realValue)
            } catch (error) {}
        }

        // 重新设置值
        ret[envName] = realValue
        process.env[envName] = realValue
    })
    return ret
}

export const viteEnv = wrapperEnv()
