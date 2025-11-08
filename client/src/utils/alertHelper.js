// alertHelpers.js

// Show a standard error alert
export const showError = (message = "Something went wrong!", title = "Error") => {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#d33',
    });
};

export const showSuccess = (message = "Success!", title = "Success") => {
    Swal.fire({
        toast: true,
        position: 'top-end', // top-right
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 2000, // auto close in 3 seconds
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
};

// Show a confirmation alert with Yes/Cancel
export const showConfirmation = async ({
                                           title = "Are you sure?",
                                           text = "You won't be able to revert this!",
                                           confirmButtonText = "Yes",
                                           cancelButtonText = "Cancel",
                                           icon = "warning",
                                       }) => {
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
};
