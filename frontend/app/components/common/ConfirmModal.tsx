import { Modal } from 'antd';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    okText?: string;
    cancelText?: string;
    confirmLoading?: boolean;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    message,
    okText = 'Confirm',
    cancelText = 'Cancel',
    confirmLoading = false,
    danger = true,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <Modal
            open={open}
            title={title}
            okText={okText}
            cancelText={cancelText}
            okButtonProps={{ danger }}
            confirmLoading={confirmLoading}
            onOk={onConfirm}
            onCancel={onCancel}
            centered
        >
            <p>{message}</p>
        </Modal>
    );
}
