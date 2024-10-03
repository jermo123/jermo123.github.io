// JavaScript to handle navigation and content loading
const content = document.getElementById('content');
const links = document.querySelectorAll('a[data-section]');
const body = document.body;
const landingPage = document.getElementById('landing-page');
const popupContent = document.getElementById('popup-content');
const closePopup = document.getElementById('close-popup');

// Content for each section (Updated to restore unique themes)
const sections = {
    art: `
        <section>
            <h1>Art Gallery</h1>
            <p>Discover my latest artworks and creative projects.</p>
            <div class="gallery">
                <img src="images/art1.jpg" alt="Artwork 1">
                <img src="images/art2.jpg" alt="Artwork 2">
                <img src="images/art3.jpg" alt="Artwork 3">
                <!-- Add more images as needed -->
            </div>
        </section>
    `,
    web: `
        <section>
            <h1>Web Development Projects</h1>
            <p>Welcome to my Web Development projects page!</p>
            <ul>
                <li>Project One - A cool website I built.</li>
                <li>Project Two - Another awesome project.</li>
                <!-- Add more projects as needed -->
            </ul>
        </section>
    `,
    chess: `
        <section>
            <h1>Chessitron</h1>
            <p>An innovative chess app offering advanced analysis and AI gameplay.</p>
            <img src="images/chessitron.jpg" alt="Chessitron App">
            <h2>Features</h2>
            <ul>
                <li>Real-time game analysis</li>
                <li>Adjustable AI difficulty levels</li>
                <li>Interactive tutorials and puzzles</li>
                <li>Game history and replay</li>
            </ul>
            <a href="#" class="btn">Learn More</a>
        </section>
    `,
    food: `
        <section>
            <h1>Mobes Kitchen</h1>
            <p>Sharing my favorite recipes and culinary experiments.</p>
            <div class="recipe-card">
                <h2>Fluffy Pancakes</h2>
                <p>Prep Time: 15 mins | Difficulty: Easy</p>
                <p>A simple recipe for the fluffiest pancakes you'll ever taste.</p>
            </div>
            <div class="recipe-card">
                <h2>Spicy Tomato Pasta</h2>
                <p>Prep Time: 25 mins | Difficulty: Medium</p>
                <p>A delicious pasta dish with a kick.</p>
            </div>
            <!-- Add more recipes as needed -->
        </section>
    `,
    contact: `
        <section>
            <h1>Contact Me</h1>
            <p>Email: <a href="mailto:jeromy@mobes.ca">jeromy@mobes.ca</a></p>
            <p>Connect with me on social media:</p>
            <div class="social-media">
                <a href="https://www.linkedin.com/in/jeromy" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a href="https://www.instagram.com/jeromy" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://www.twitter.com/jeromy" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            </div>
        </section>
    `
};

// Function to load content based on section
function loadContent(section) {
    // Load content
    content.innerHTML = sections[section];
    // Show popup content
    popupContent.classList.add('visible');
    // Remove existing theme classes
    body.className = '';
    // Add theme class
    body.classList.add(`${section}-theme`);
}

// Add event listeners to navigation links
links.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const section = this.getAttribute('data-section');
        loadContent(section);
    });
});

// Close popup
closePopup.addEventListener('click', () => {
    popupContent.classList.remove('visible');
    // Remove theme classes when closing popup
    body.className = '';
});

// Close popup when clicking outside the popup-inner
popupContent.addEventListener('click', (e) => {
    if (e.target === popupContent) {
        popupContent.classList.remove('visible');
        body.className = '';
    }
});

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    // Hide popup on initial load
    popupContent.classList.remove('visible');
});
