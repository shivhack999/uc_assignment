import { Loader2 } from "lucide-react";

export default function Button({
    children,
    variant = "primary",
    loading = false,
    disabled = false,
    className = "",
    type = "button",
    ...props
}) {
    const styles = {
        primary: "bg-[#a20000] text-white hover:bg-[#850000]",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100",
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
            {...props}
        >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {children}
        </button>
    );
}