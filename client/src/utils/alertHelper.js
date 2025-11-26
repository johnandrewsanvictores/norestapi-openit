import Swal from 'sweetalert2';

const getSwal = () => {
  if (typeof window !== 'undefined' && window.Swal) {
    return window.Swal;
  }
  return Swal;
};

export const showError = (message = "Something went wrong!", title = "Error") => {
    const SwalInstance = getSwal();
    SwalInstance.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#d33',
        background: '#1A1A1A',
        color: '#ffffff',
        confirmButtonText: 'OK'
    });
};

export const showSuccess = (message = "Success!", title = "Success") => {
    const SwalInstance = getSwal();
    SwalInstance.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1A1A1A',
        color: '#ffffff',
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', SwalInstance.stopTimer);
            toast.addEventListener('mouseleave', SwalInstance.resumeTimer);
        }
    });
};

export const showConfirmation = async ({
                                           title = "Are you sure?",
                                           text = "You won't be able to revert this!",
                                           confirmButtonText = "Yes",
                                           cancelButtonText = "Cancel",
                                           icon = "warning",
                                       }) => {
    const SwalInstance = getSwal();
    const result = await SwalInstance.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: "#FF7F00",
        cancelButtonColor: "#d33",
        confirmButtonText,
        cancelButtonText,
        background: '#1A1A1A',
        color: '#ffffff',
    });
    return result.isConfirmed;
};
