
import { LoaderCircle } from "lucide-react";

export default function Loader({ text = "Loading..." }) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-gray-500">
            <LoaderCircle size={30} className="animate-spin text-[#a20000]" />
            <span className="text-sm">{text}</span>
        </div>
    );
}
