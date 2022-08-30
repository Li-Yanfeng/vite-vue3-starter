/**
 * 日期 工具
 */
import { format } from 'date-fns'

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const DATE_FORMAT = 'YYYY-MM-DD'

/**
 * 标准日期时间格式：yyyy-MM-dd HH:mm:ss
 */
export function formatToDateTime(date: Date | number, formatStr = DATE_TIME_FORMAT): string {
    return format(date, formatStr)
}

/**
 * 标准日期格式：yyyy-MM-dd
 */
export function formatToDate(date: Date | number, formatStr = DATE_FORMAT): string {
    return format(date, formatStr)
}
