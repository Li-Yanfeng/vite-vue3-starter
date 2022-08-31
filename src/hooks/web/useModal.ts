import { Modal } from 'ant-design-vue'
import { ModalFuncProps } from 'ant-design-vue/lib/modal/Modal'

const baseProps = () => {
    return {
        okText: '确认',
        cancelText: '取消',
        centered: true
    }
}

const createProps = (props: ModalFuncProps) => {
    return {
        ...baseProps(),
        ...props
    }
}

export class ModalApi {
    static success = (props: ModalFuncProps) => {
        return Modal.success(createProps(props))
    }

    static error = (props: ModalFuncProps) => {
        return Modal.error(createProps(props))
    }

    static info = (props: ModalFuncProps) => {
        return Modal.info(createProps(props))
    }

    static warning = (props: ModalFuncProps) => {
        return Modal.warning(createProps(props))
    }

    static confirm = (props: ModalFuncProps) => {
        return Modal.confirm(createProps(props))
    }
}
