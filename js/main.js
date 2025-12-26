// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    console.log('Musikschule CMS - Site Initialized');

    // Icon Mouse Follow Effect
    const iconContainer = document.querySelector('.hero-icon-container .iconify');

    if (iconContainer) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.pageX) / 20;
            const y = (window.innerHeight / 2 - e.pageY) / 20;

            // Apply slight transition for smooth follow
            iconContainer.style.transition = 'transform 0.1s ease-out';
            iconContainer.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    // Magnetic Navigation Effect
    const navLinks = document.querySelectorAll('.nav-item');

    navLinks.forEach(link => {
        link.addEventListener('mousemove', (e) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move the element 30% of the distance from center
            link.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            link.style.transition = 'transform 0.1s ease-out';
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translate(0, 0)';
            link.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Elastic ease
        });
    });
});
