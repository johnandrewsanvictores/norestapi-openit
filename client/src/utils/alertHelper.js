const getSwal = () => {
  if (typeof window !== 'undefined') {
    return window.Swal || null;
  }
  return null;
};

export const showError = (message = "Something went wrong!", title = "Error") => {
    const Swal = getSwal();
    if (Swal) {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonColor: '#d33',
        });
    } else {
        alert(`${title}: ${message}`);
    }
};

export const showSuccess = (message = "Success!", title = "Success") => {
    const Swal = getSwal();
    if (Swal) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: message,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
    } else {
        console.log(`✅ ${title}: ${message}`);
    }
};

export const showConfirmation = async ({
                                           title = "Are you sure?",
                                           text = "You won't be able to revert this!",
                                           confirmButtonText = "Yes",
                                           cancelButtonText = "Cancel",
                                           icon = "warning",
                                       }) => {
    const Swal = getSwal();
    if (Swal) {
        const result = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText,
            cancelButtonText,
        });
        return result.isConfirmed;
    } else {
        return window.confirm(`${title}\n${text}`);
    }
};
