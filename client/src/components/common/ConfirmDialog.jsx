
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
    open,
    title = "Confirm deletion",
    message = "Are you sure you want to delete this item?",
    onCancel,
    onConfirm,
    loading = false,
}) {
    return (
        <Modal open={open} title={title} onClose={onCancel} size="max-w-md">
            <div className="flex gap-3">
                <div className="rounded-full bg-red-50 p-3 text-red-600">
                    <AlertTriangle size={22} />
                </div>
                <p className="pt-2 text-sm leading-6 text-gray-600">{message}</p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="danger" loading={loading} onClick={onConfirm}>
                    Delete
                </Button>
            </div>
        </Modal>
    );
}
