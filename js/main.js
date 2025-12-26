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
});
