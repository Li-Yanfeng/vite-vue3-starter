/**
 * 请求时可选项
 */
export interface RequestOptions {
    // 是否显示成功信息
    isShowSuccessMessage?: boolean
    // 成功的文本信息
    successMessageText?: string
    // 是否显示失败信息
    isShowErrorMessage?: boolean
    // 错误的文本信息
    errorMessageText?: string
    // 接口地址， 不填则使用默认apiUrl
    apiUrl?: string
    // 请求拼接路径
    urlPrefix?: string
    // 是否添加时间戳
    joinTime?: boolean
    // 格式化请求参数
    formatRequestParam?: boolean
    // 是否返回原生响应
    isReturnNativeResponse?: boolean
    // 是否转化响应
    isTransformResponse?: boolean
    // 取消重复请求
    isCancelRepeatRequest?: boolean
    // 是否携带token
    withToken?: boolean
}

/**
 * REST API 返回结果
 */
export interface Result<T = any> {
    // 错误码
    code: string
    // 用户提示
    message: string
    // 返回数据
    data: T
    // 返回数据总数
    total: number
}

/**
 * 上传文件参数
 */
export interface UploadFileParams {
    // 其他参数
    data?: object
    // 文件参数接口字段名
    name?: string
    // 文件
    file: File | Blob
    // 文件名称
    filename?: string

    [key: string]: any
}
