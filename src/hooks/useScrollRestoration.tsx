import { useNavigate } from "react-router-dom";

export const useScrollRestoration = () => {
  const navigate = useNavigate();

  const navigateWithScrollSave = (path: string) => {
    // Save current scroll position
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    
    // Navigate to the new path
    navigate(path);
  };

  const restoreScrollPosition = () => {
    const savedPosition = sessionStorage.getItem('scrollPosition');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem('scrollPosition');
    }
  };

  return {
    navigateWithScrollSave,
    restoreScrollPosition
  };
};