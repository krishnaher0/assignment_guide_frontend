import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import NewAssignmentModal from '../../../components/NewAssignmentModal';
import NewAssignmentFAB from '../../../components/NewAssignmentFAB';
import { AssignmentModalProvider, useAssignmentModal } from '../../../context/AssignmentModalContext';
import NotificationDropdown from '../../../components/NotificationDropdown';
import ProfileDropdown from '../../../components/ProfileDropdown';
import {
    HiOutlineHome,
    HiOutlineClipboardList,
    HiOutlineCreditCard,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlinePlus,
    HiOutlineDocumentText,
    HiOutlineClipboardCheck,
    HiOutlineReceiptTax
} from 'react-icons/hi';
import { FaCode } from 'react-icons/fa';

const sidebarItems = [
    { path: '/dashboard/client', label: 'Dashboard', icon: HiOutlineHome },
    { path: '/dashboard/client/tasks', label: 'My Assignments', icon: HiOutlineClipboardList },
    { path: '/dashboard/client/quotes', label: 'Quotes', icon: HiOutlineDocumentText },
    { path: '/dashboard/client/contracts', label: 'Contracts', icon: HiOutlineClipboardCheck },
    { path: '/dashboard/client/invoices', label: 'Invoices', icon: HiOutlineReceiptTax },
    { path: '/dashboard/client/payment', label: 'Payments', icon: HiOutlineCreditCard },
];

function ClientLayoutContent() {
    const location = useLocation();
    const { isOpen, openModal, closeModal, handleSuccess } = useAssignmentModal();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getCurrentPageTitle = () => {
        const currentItem = sidebarItems.find(item => item.path === location.pathname);
        return currentItem?.label || 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-[#09090b]">
            {/* New Assignment Modal */}
            <NewAssignmentModal
                isOpen={isOpen}
                onClose={closeModal}
                onSuccess={handleSuccess}
            />

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0a0a0f] border-r border-zinc-800/50 transform transition-transform duration-300 md:translate-x-0 ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50">
                        <Link to="/dashboard/client" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <FaCode className="text-white text-sm" />
                            </div>
                            <div>
                                <span className="text-lg font-semibold text-white tracking-tight">ProjectHub</span>
                                <p className="text-[10px] text-zinc-500 -mt-1">Client Portal</p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                        >
                            <HiOutlineX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <p className="px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Menu</p>
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/10 text-white border border-blue-500/20'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    )}
                                </Link>
                            );
                        })}

                        {/* New Assignment Button */}
                        <button
                            onClick={() => {
                                openModal();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all mt-4"
                        >
                            <HiOutlinePlus className="w-5 h-5" />
                            New Assignment
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="md:ml-64">
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-zinc-800/50 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl"
                        >
                            <HiOutlineMenu className="w-6 h-6" />
                        </button>
                        <Link to="/dashboard/client" className="flex items-center gap-2 md:hidden">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <FaCode className="text-white text-sm" />
                            </div>
                        </Link>
                        <h1 className="text-lg font-semibold text-white hidden md:block">
                            {getCurrentPageTitle()}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationDropdown />
                        <ProfileDropdown variant="default" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* FAB for mobile */}
            <div className="md:hidden">
                <NewAssignmentFAB onClick={() => openModal()} />
            </div>
        </div>
    );
}

export default function ClientLayout() {
    return (
        <AssignmentModalProvider>
            <ClientLayoutContent />
        </AssignmentModalProvider>
    );
}
