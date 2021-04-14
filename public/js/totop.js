window.onscroll = () => {
    scrollToTop();
  };
  
  
  // When the user scrolls down 100px from the top of the document, show totop btn
  
  function scrollToTop() {
      //scroll to top 
    const totop = document.getElementById("toTopBtn");
    if (document.body.scrollTop > 100|| document.documentElement.scrollTop > 100) {
      totop.style.display = "block";
    } else {
      totop.style.display = "none";
    }
  }
  
  // When the user clicks on the button, scroll to the top of the document
  function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }