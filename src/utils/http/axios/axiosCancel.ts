import type { AxiosRequestConfig, Canceler } from 'axios'
import axios from 'axios'
import { isFunction } from '~/utils/is'
import qs from 'qs'

// 声明一个 Map 用于存储每个请求的标识 和 取消函数
let pendingMap = new Map<string, Canceler>()

/**
 * 生成每个请求的唯一key
 */
export const getPendingUrl = (config: AxiosRequestConfig) => {
    let { url, method, params, data } = config
    return [url, method, qs.stringify(params), qs.stringify(data)].join('&')
}

export class AxiosCanceler {
    /**
     * 添加请求
     * @param {Object} config
     */
    addPending(config: AxiosRequestConfig): void {
        this.removePending(config)
        const url = getPendingUrl(config)
        config.cancelToken =
            config.cancelToken ||
            new axios.CancelToken(cancel => {
                // 如果 pending 中不存在当前请求，则添加进去
                if (!pendingMap.has(url)) {
                    pendingMap.set(url, cancel)
                }
            })
    }

    /**
     * 清空所有pending
     */
    removeAllPending(): void {
        pendingMap.forEach(cancel => {
            cancel && isFunction(cancel) && cancel()
        })
        pendingMap.clear()
    }

    /**
     * 移除请求
     * @param {Object} config
     */
    removePending(config: AxiosRequestConfig): void {
        const url = getPendingUrl(config)

        // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
        if (pendingMap.has(url)) {
            const cancel = pendingMap.get(url)
            cancel && cancel(url)
            pendingMap.delete(url)
        }
    }

    /**
     * 重置
     */
    reset(): void {
        pendingMap = new Map<string, Canceler>()
    }
}
