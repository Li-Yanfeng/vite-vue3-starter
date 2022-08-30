// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import type { RequestOptions, Result } from './types'
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform'
import { VAxios } from './Axios'
import { checkStatus } from './checkStatus'
import { ContentTypeEnum, RequestEnum, ResultEnum } from '~/enums/httpEnum'
import { isString } from '~/utils/is'
import { deepMerge } from '~/utils'
import { formatRequestData, joinTimestamp } from './helper'
import { Recordable } from 'vite-plugin-mock'
import { getToken } from '~/utils/auth'
import { NoticeApi } from '~/hooks/web/useNotification'

/**
 * 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
    /**
     * 处理请求数据。如果数据不是预期格式，可直接抛出错误
     */
    transformRequestHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
        const {
            isShowSuccessMessage,
            isShowErrorMessage,
            successMessageText,
            errorMessageText,
            isReturnNativeResponse,
            isTransformResponse
        } = options

        // 是否返回原生响应头 比如：需要获取响应头时使用该属性
        if (isReturnNativeResponse) {
            return res
        }

        // 是否转化响应 比如：用于页面代码可能需要直接获取code，data，message这些信息时开启
        if (!isTransformResponse) {
            return res.data
        }

        const { data } = res
        // 错误的时候返回
        if (!data) {
            throw new Error('请求出错，请稍候重试')
        }

        // 这里 code，message, result 为后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
        const { code, message } = data
        // 请求成功
        const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS
        // 显示提示信息
        if (hasSuccess && (successMessageText || isShowSuccessMessage)) {
            NoticeApi.success({ message: successMessageText || message || '操作成功！' })
        } else if (!hasSuccess && (errorMessageText || isShowErrorMessage)) {
            NoticeApi.error({ message: errorMessageText || message || '操作失败！' })
        }

        // 接口请求成功，直接返回结果
        if (hasSuccess) {
            return data
        }

        // 接口请求错误，统一提示错误信息 这里逻辑可以根据项目进行修改
        throw new Error(message)
    },

    /**
     * 请求之前处理config
     */
    beforeRequestHook: (config, options) => {
        const { apiUrl, urlPrefix, formatRequestParam, joinTime = true } = options

        if (urlPrefix && isString(urlPrefix)) {
            config.url = `${urlPrefix}${config.url}`
        }

        if (apiUrl && isString(apiUrl)) {
            config.url = `${apiUrl}${config.url}`
        }
        const params = config.params || {}
        const data = config.data || false

        // 格式化请求参数
        formatRequestParam && formatRequestData(data)

        if (config.method?.toUpperCase() === RequestEnum.GET) {
            if (!isString(params)) {
                // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
                config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
            } else {
                // 兼容restful风格
                config.url = config.url + params + `${joinTimestamp(joinTime, true)}`
                config.params = undefined
            }
        } else {
            if (!isString(params)) {
                if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
                    config.data = data
                    config.params = params
                } else {
                    // 非GET请求如果没有提供data，则将params视为data
                    config.data = params
                    config.params = undefined
                }
            } else {
                // 兼容restful风格
                config.url = config.url + params
                config.params = undefined
            }
        }
        return config
    },

    /**
     * 请求拦截器处理
     */
    requestInterceptors: (config, options) => {
        // 请求之前处理config
        const token = getToken()
        if (token && (config as Recordable)?.requestOptions?.withToken === true) {
            // jwt token
            ;(config as Recordable).headers.Authorization = options.authenticationScheme
                ? `${options.authenticationScheme} ${token}`
                : token
        }
        return config
    },

    /**
     * 响应拦截器处理
     */
    responseInterceptors: (res: AxiosResponse<any>) => {
        return res
    },

    /**
     * 响应错误处理
     */
    responseInterceptorsCatch: (error: any) => {
        const { response, code, message } = error || {}
        // 此处要根据后端接口返回格式修改
        const msg: string = response?.data?.message ?? ''
        const err: string = error?.toString?.() ?? ''
        let errMessage = ''

        try {
            if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
                errMessage = '接口请求超时请刷新页面重试'
            }
            if (err?.includes('Network Error')) {
                errMessage = '网络异常，请检查您的网络连接是否正常!'
            }

            NoticeApi.error({ message: errMessage })
            return Promise.reject(error)
        } catch (error) {
            throw new Error(error as unknown as string)
        }

        // 请求是否被取消
        const isCancel = axios.isCancel(error)
        if (!isCancel) {
            checkStatus(response?.status, msg)
        } else {
            console.warn(error, '请求被取消！')
        }
        return Promise.reject(error)
    }
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
    return new VAxios(
        deepMerge(
            {
                // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
                // authentication schemes，e.g: Bearer
                authenticationScheme: 'Bearer',
                timeout: 1000 * 30,
                headers: { 'Content-Type': ContentTypeEnum.JSON },
                // 数据处理方式
                transform,
                // 配置项，下面的选项都可以在独立的接口请求中覆盖
                requestOptions: {
                    // 接口地址， 不填则使用默认apiUrl
                    apiUrl: import.meta.env.VITE_BASE_URL,
                    // 接口拼接地址
                    urlPrefix: undefined,
                    //  是否加入时间戳
                    joinTime: false,
                    // 格式化请求参数
                    formatRequestParam: true,
                    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
                    isReturnNativeResponse: false,
                    // 是否需要对返回数据进行处理
                    isTransformResponse: true,
                    // 取消重复请求
                    isCancelRepeatRequest: true,
                    // 是否携带token
                    withToken: true
                }
            },
            opt || {}
        )
    )
}

export const http = createAxios()
