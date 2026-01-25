import { createContext, useContext, useState } from 'react';

const AssignmentModalContext = createContext();

export function AssignmentModalProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [onSuccessCallback, setOnSuccessCallback] = useState(null);

    const openModal = (onSuccess = null) => {
        setOnSuccessCallback(() => onSuccess);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setOnSuccessCallback(null);
    };

    const handleSuccess = () => {
        if (onSuccessCallback) {
            onSuccessCallback();
        }
    };

    return (
        <AssignmentModalContext.Provider value={{ isOpen, openModal, closeModal, handleSuccess }}>
            {children}
        </AssignmentModalContext.Provider>
    );
}

export function useAssignmentModal() {
    const context = useContext(AssignmentModalContext);
    if (!context) {
        throw new Error('useAssignmentModal must be used within AssignmentModalProvider');
    }
    return context;
}
