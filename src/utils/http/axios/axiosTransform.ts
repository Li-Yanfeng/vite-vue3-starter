/**
 * 数据处理类，可以根据项目自行配置
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { RequestOptions, Result } from './types'

export interface CreateAxiosOptions extends AxiosRequestConfig {
    // 身份验证方案
    authenticationScheme?: string
    // 请求数据格式转换
    transform?: AxiosTransform
    // 请求时可选项
    requestOptions?: RequestOptions
}

export abstract class AxiosTransform {
    /**
     * 请求之前处理配置
     */
    beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig

    /**
     * 请求成功处理
     */
    transformRequestHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any

    /**
     * 请求失败处理
     */
    requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>

    /**
     * 请求之前的拦截器
     */
    requestInterceptors?: (config: AxiosRequestConfig, options: CreateAxiosOptions) => AxiosRequestConfig

    /**
     * 请求之后的拦截器
     */
    responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>

    /**
     * 请求之前的拦截器错误处理
     */
    requestInterceptorsCatch?: (error: Error) => void

    /**
     * 请求之后的拦截器错误处理
     */
    responseInterceptorsCatch?: (error: Error) => void
}
