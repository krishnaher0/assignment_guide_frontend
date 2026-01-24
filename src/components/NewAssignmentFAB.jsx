import { HiOutlinePlus } from 'react-icons/hi';

export default function NewAssignmentFAB({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
            aria-label="New Assignment"
        >
            <HiOutlinePlus className="text-white text-2xl" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-2 bg-zinc-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                New Assignment
            </span>
        </button>
    );
}
