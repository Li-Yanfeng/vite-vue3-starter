import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import type { RequestOptions, Result, UploadFileParams } from './types'
import type { CreateAxiosOptions } from './axiosTransform'
import qs from 'qs'
import { AxiosCanceler } from './axiosCancel'
import { isFunction } from '~/utils/is'
import { cloneDeep } from 'lodash-es'
import { ContentTypeEnum, RequestEnum } from '~/enums/httpEnum'

export * from './axiosTransform'

/**
 * axios 模块
 */
export class VAxios {
    private axiosInstance: AxiosInstance
    private readonly options: CreateAxiosOptions

    constructor(options: CreateAxiosOptions) {
        this.options = options
        this.createAxios(options)
        this.setupInterceptors()
    }

    /**
     * 创建 axios 实例
     */
    private createAxios(config: CreateAxiosOptions): void {
        this.axiosInstance = axios.create(config)
    }

    private getTransform() {
        const { transform } = this.options
        return transform
    }

    /**
     * 获取 axios 实例
     */
    getAxios(): AxiosInstance {
        return this.axiosInstance
    }

    /**
     * 重新配置 axios
     */
    configAxios(config: CreateAxiosOptions) {
        if (!this.axiosInstance) {
            return
        }
        this.createAxios(config)
    }

    /**
     * 设置通用header
     */
    setHeader(headers: any): void {
        if (!this.axiosInstance) {
            return
        }
        Object.assign(this.axiosInstance.defaults.headers, headers)
    }

    /**
     * 拦截器配置
     */
    private setupInterceptors() {
        const transform = this.getTransform()
        if (!transform) {
            return
        }
        const { requestInterceptors, requestInterceptorsCatch, responseInterceptors, responseInterceptorsCatch } =
            transform

        const axiosCanceler = new AxiosCanceler()

        // 请求拦截器配置处理
        this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
            // If cancel repeat request is turned on, then cancel repeat request is prohibited
            const {
                // @ts-ignore
                requestOptions: { isCancelRepeatRequest }
            } = config

            const cancelRepeatRequest =
                isCancelRepeatRequest !== undefined
                    ? isCancelRepeatRequest
                    : this.options.requestOptions?.isCancelRepeatRequest

            cancelRepeatRequest && axiosCanceler.addPending(config)
            if (requestInterceptors && isFunction(requestInterceptors)) {
                config = requestInterceptors(config, this.options)
            }
            return config
        }, undefined)

        // 请求拦截器错误捕获
        requestInterceptorsCatch &&
            isFunction(requestInterceptorsCatch) &&
            this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch)

        // 响应结果拦截器处理
        this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
            res && axiosCanceler.removePending(res.config)
            if (responseInterceptors && isFunction(responseInterceptors)) {
                res = responseInterceptors(res)
            }
            return res
        }, undefined)

        // 响应结果拦截器错误捕获
        responseInterceptorsCatch &&
            isFunction(responseInterceptorsCatch) &&
            this.axiosInstance.interceptors.response.use(undefined, responseInterceptorsCatch)
    }

    /**
     * 支持 FormData
     */
    supportFormData(config: AxiosRequestConfig) {
        const headers = config.headers || this.options.headers
        const contentType = headers?.['Content-Type'] || headers?.['content-type']

        if (
            contentType !== ContentTypeEnum.FORM_URLENCODED ||
            !Reflect.has(config, 'data') ||
            config.method?.toUpperCase() === RequestEnum.GET
        ) {
            return config
        }

        return {
            ...config,
            data: qs.stringify(config.data, { arrayFormat: 'brackets' })
        }
    }

    /**
     * 文件上传
     */
    uploadFile<T = any>(config: AxiosRequestConfig, params: UploadFileParams) {
        const formData = new window.FormData()
        const customFilename = params.name || 'file'

        if (params.filename) {
            formData.append(customFilename, params.file, params.filename)
        } else {
            formData.append(customFilename, params.file)
        }

        if (params.data) {
            Object.keys(params.data).forEach(key => {
                const value = params.data![key]
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        formData.append(`${key}[]`, item)
                    })
                    return
                }

                formData.append(key, params.data![key])
            })
        }

        return this.request<T>({
            ...config,
            method: 'POST',
            data: formData,
            headers: {
                'Content-type': ContentTypeEnum.FORM_DATA,
                // @ts-ignore
                isCancelRepeatRequest: true
            }
        })
    }

    /**
     * Get 请求方法
     */
    get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: 'GET' }, options)
    }

    /**
     * Post 请求方法
     */
    post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: 'POST' }, options)
    }

    /**
     * Put 请求方法
     */
    put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: 'PUT' }, options)
    }

    /**
     * Delete 请求方法
     */
    delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        return this.request({ ...config, method: 'DELETE' }, options)
    }

    /**
     * 请求方法
     */
    request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
        let conf: CreateAxiosOptions = cloneDeep(config)
        const transform = this.getTransform()

        const { requestOptions } = this.options

        const opt: RequestOptions = Object.assign({}, requestOptions, options)

        const { beforeRequestHook, requestCatchHook, transformRequestHook } = transform || {}
        if (beforeRequestHook && isFunction(beforeRequestHook)) {
            conf = beforeRequestHook(conf, opt)
        }

        // 这里重新 赋值成最新的配置
        conf.requestOptions = opt

        // 支持 FormData
        conf = this.supportFormData(conf)

        return new Promise((resolve, reject) => {
            this.axiosInstance
                .request<any, AxiosResponse<Result>>(conf)
                .then((res: AxiosResponse<Result>) => {
                    if (transformRequestHook && isFunction(transformRequestHook)) {
                        try {
                            const ret = transformRequestHook(res, opt)
                            resolve(ret)
                        } catch (err) {
                            reject(err || new Error('request error!'))
                        }
                        return
                    }
                    resolve(res as unknown as Promise<T>)
                })
                .catch((e: Error | AxiosError) => {
                    if (requestCatchHook && isFunction(requestCatchHook)) {
                        reject(requestCatchHook(e, opt))
                        return
                    }
                    reject(e)
                })
        })
    }
}
