import { useState, useRef } from 'react';

const useNewsletterForm = () => {
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowNewsletterForm(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowNewsletterForm(false);
    }, 500);
  };

  return { showNewsletterForm, handleMouseEnter, handleMouseLeave };
};

export default useNewsletterForm;
