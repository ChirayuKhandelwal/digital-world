import Swal from 'sweetalert2';

const commonClasses = {
  popup: 'bg-white/95 backdrop-blur-2xl border border-white/40 rounded-[2rem] shadow-2xl shadow-electric/10 p-2 overflow-hidden',
  title: 'text-2xl font-black text-midnight tracking-tight pt-4',
  htmlContainer: 'text-coolgrey font-medium text-sm px-6 pb-4',
  actions: 'flex gap-3 w-full px-6 pb-6 mt-4',
  confirmButton: 'flex-1 bg-electric hover:bg-electric/90 text-white font-bold rounded-xl px-6 py-3.5 shadow-lg shadow-electric/25 transition-all hover:scale-[1.02] active:scale-95',
  cancelButton: 'flex-1 bg-gray-100 hover:bg-gray-200 text-midnight font-bold rounded-xl px-6 py-3.5 transition-all hover:scale-[1.02] active:scale-95 border-0',
};

export const showAlert = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      iconColor: '#6366F1', // electric blue
      buttonsStyling: false,
      confirmButtonText: 'Awesome!',
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut animate__faster'
      },
      customClass: {
        ...commonClasses,
        icon: 'border-0 scale-125 my-6',
      }
    });
  },
  
  error: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      iconColor: '#ef4444',
      buttonsStyling: false,
      confirmButtonText: 'Try Again',
      showClass: {
        popup: 'animate__animated animate__shakeX animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
      },
      customClass: {
        ...commonClasses,
        icon: 'border-0 scale-125 my-6',
        confirmButton: 'flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-6 py-3.5 shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-95',
      }
    });
  },

  warning: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      iconColor: '#f97316',
      buttonsStyling: false,
      confirmButtonText: 'Got it',
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut animate__faster'
      },
      customClass: {
        ...commonClasses,
        icon: 'border-0 scale-125 my-6',
        confirmButton: 'flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-6 py-3.5 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95',
      }
    });
  },

  custom: (options: any) => {
    return Swal.fire({
      buttonsStyling: false,
      showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__zoomOut animate__faster'
      },
      customClass: {
        ...commonClasses,
        ...(options.customClass || {})
      },
      ...options
    });
  }
};
