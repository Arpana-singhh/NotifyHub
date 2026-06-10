import { Modal } from 'antd';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    okText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    message,
    okText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <Modal
            open={open}
            title={title}
            okText={okText}
            cancelText={cancelText}
            okButtonProps={{ danger: true }}
            onOk={onConfirm}
            onCancel={onCancel}
        >
            <p>{message}</p>
        </Modal>
    );
}
