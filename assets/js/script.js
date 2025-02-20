// Custom JavaScript for your landing page

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded and parsed");

    // Example: Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Parallax effect
    window.addEventListener('scroll', function() {
        const parallax = document.querySelector('.parallax');
        let scrollPosition = window.scrollY;
        parallax.style.transform = 'translateY(' + scrollPosition * 0.5 + 'px)';
    });
});