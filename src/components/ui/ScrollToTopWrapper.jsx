import ScrollToTop from "./ScrollToTop";

const ScrollToTopWrapper = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
};

export default ScrollToTopWrapper;
