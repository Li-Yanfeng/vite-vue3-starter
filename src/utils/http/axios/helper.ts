import { DATE_TIME_FORMAT } from '~/utils/dateUtils'
import { isObject, isString } from '~/utils/is'

export function joinTimestamp<T extends boolean>(join: boolean, restful: T): T extends true ? string : object

export function joinTimestamp(join: boolean, restful = false): string | object {
    if (!join) {
        return restful ? '' : {}
    }
    const now = new Date().getTime()
    if (restful) {
        return `?_t=${now}`
    }
    return { _t: now }
}

/**
 * 格式化请求数据
 */
export function formatRequestData(params: any) {
    if (Object.prototype.toString.call(params) !== '[object Object]') {
        return
    }

    for (const key in params) {
        if (params[key] && params[key]._isAMomentObject) {
            params[key] = params[key].format(DATE_TIME_FORMAT)
        }
        if (isString(key)) {
            const value = params[key]
            if (value) {
                try {
                    params[key] = isString(value) ? value.trim() : value
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        }
        if (isObject(params[key])) {
            formatRequestData(params[key])
        }
    }
}
