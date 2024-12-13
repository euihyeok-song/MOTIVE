import { useToast } from 'primevue/usetoast';

const useToastMessage = () => {
    const toast = useToast();

    const life = 3000;

    const showSuccess = (summary, detail) => {
        toast.add({
            severity: 'success',
            summary,
            detail,
            life,
        });
    };

    const showError = (summary, detail) => {
        toast.add({
            severity: 'error',
            summary,
            detail,
            life,
        });
    };

    const showWarning = (summary, detail) => {
        toast.add({
            severity: 'warn',
            summary,
            detail,
            life,
        });
    };

    return {
        showSuccess,
        showError,
        showWarning,
    };
};

export default useToastMessage;
