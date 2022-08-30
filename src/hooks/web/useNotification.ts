import { notification } from 'ant-design-vue'

notification.config({
    duration: 3
})

interface NotificationArgsProps {
    message: string
    description?: string
}

export class NoticeApi {
    static success = (args: NotificationArgsProps) => {
        notification.success(args)
    }

    static error = (args: NotificationArgsProps) => {
        notification.error(args)
    }

    static info = (args: NotificationArgsProps) => {
        notification.info(args)
    }

    static warning = (args: NotificationArgsProps) => {
        notification.warning(args)
    }
}
