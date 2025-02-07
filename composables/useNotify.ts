const toast = useToast();

const toastConfig = {
  timeout: 1000
};

export const useNotify = () => {
  return {
    toastSuccess: (title: string) =>
      toast.add({
        ...toastConfig,
        icon: 'i-heroicons-check-circle',
        color: 'green',
        title
      }),
    toastWarning: (title: string) =>
      toast.add({
        timeout: 1800,
        icon: 'i-heroicons-exclamation-circle',
        color: 'amber',
        title
      }),
    toastError: (title: string) =>
      toast.add({
        ...toastConfig,
        icon: 'i-heroicons-x-circle',
        color: 'red',
        title
      })
  };
};
