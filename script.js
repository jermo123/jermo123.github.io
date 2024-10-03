document.addEventListener('DOMContentLoaded', () => {
    const orbit = document.querySelector('.orbit');
    const labels = document.querySelectorAll('.orbit-label');
    const popup = document.getElementById('popup');
    const closeButton = document.querySelector('.close-button');
    const popupInnerContent = document.querySelector('.popup-inner-content');

    labels.forEach(label => {
        label.addEventListener('mouseenter', () => {
            orbit.style.animationPlayState = 'paused';
        });

        label.addEventListener('mouseleave', () => {
            orbit.style.animationPlayState = 'running';
        });

        label.addEventListener('click', () => {
            // Add click effect
            label.classList.add('clicked');
            // Pause orbit
            orbit.style.animationPlayState = 'paused';
            // Show popup after animation
            setTimeout(() => {
                // Load dynamic content
                const content = label.getAttribute('data-content');
                popupInnerContent.innerHTML = `
                    <h1>${content}</h1>
                    <p>This is where content about <strong>${content}</strong> will appear.</p>
                `;
                popup.style.display = 'block';
            }, 1000);
        });
    });

    // Close popup
    closeButton.addEventListener('click', () => {
        popup.style.display = 'none';
        orbit.style.animationPlayState = 'running';
        labels.forEach(label => label.classList.remove('clicked'));
    });
});
