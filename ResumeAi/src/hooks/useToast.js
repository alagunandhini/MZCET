import { useState } from "react";

const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type,
      });
    }, 5000);
  };

  return {
    toast,
    showToast,
  };
};

export default useToast;