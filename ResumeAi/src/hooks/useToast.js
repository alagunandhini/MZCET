import { useState, useRef } from "react";

const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const timeoutRef = useRef(null);

  // autoHide: pass false for toasts that should stay until the user
  // dismisses them (e.g. important errors with an OK button), true (or
  // omit) for the old auto-vanishing behavior.
  const showToast = (message, type = "success", autoHide = true) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast({ show: true, message, type });

    if (autoHide) {
      timeoutRef.current = setTimeout(() => {
        setToast({ show: false, message: "", type });
      }, 5000);
    }
  };

  const hideToast = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast((prev) => ({ ...prev, show: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};

export default useToast;