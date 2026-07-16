import Swal from 'sweetalert2';

export const showAlert = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#6366F1', // electric color
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-2xl shadow-xl shadow-black/5 border border-gray-100',
        confirmButton: 'rounded-xl font-bold px-6 py-2 shadow-md shadow-electric/20',
        title: 'text-midnight font-bold',
      }
    });
  },
  
  error: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#6366F1',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-2xl shadow-xl shadow-black/5 border border-gray-100',
        confirmButton: 'rounded-xl font-bold px-6 py-2 shadow-md shadow-electric/20',
        title: 'text-midnight font-bold',
      }
    });
  },

  warning: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonColor: '#6366F1',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-2xl shadow-xl shadow-black/5 border border-gray-100',
        confirmButton: 'rounded-xl font-bold px-6 py-2 shadow-md shadow-electric/20',
        title: 'text-midnight font-bold',
      }
    });
  },

  custom: (options: any) => {
    return Swal.fire({
      confirmButtonColor: '#6366F1',
      cancelButtonColor: '#E2E8F0',
      customClass: {
        popup: 'rounded-2xl shadow-xl shadow-black/5 border border-gray-100',
        confirmButton: 'rounded-xl font-bold px-6 py-2 shadow-md shadow-electric/20',
        cancelButton: 'rounded-xl font-bold px-6 py-2 text-coolgrey',
        title: 'text-midnight font-bold',
      },
      ...options
    });
  }
};
