function openMenu() {
    document.getElementById("sidebar").classList.add("active");
    document.getElementById("overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeMenu() {
    document.getElementById("sidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    document.body.style.overflow = "";
}

// Carousel class to manage slide transitions, progress bar, and swipe gestures
class Carousel {
    constructor(containerSelector, slideSelector) {
        // Carousel container and slides
        this.container = document.querySelector(containerSelector);
        this.slides = this.container.querySelectorAll(slideSelector);

        // Progress bar element (assumes a single .progress element in .loading-container)
        this.progressEl = this.container.querySelector('.loading-container .progress');

        // Configuration and state
        this.slideDuration = 10000;       // 10 seconds per slide
        this.currentSlide = 0;            // index of currently active slide
        this.slideIntervalId = null;      // ID for auto-cycle interval
        this.progressTimerId = null;      // ID for progress bar interval
        this.touchStartX = 0;             // X position on touch start

        // Initialize carousel functionality
        this.showSlide(this.currentSlide);
        this.startProgress();
        this.startAutoCycle();
        this.addEventListeners();
    }

    // Show a specific slide index (with wrap-around), update classes and animations
    showSlide(index) {
        // Calculate valid new index (wrap around)
        const lastIndex = this.slides.length - 1;
        const newIndex = index < 0 ? lastIndex : index > lastIndex ? 0 : index;

        // Remove .active from old slide and add to new slide
        this.slides[this.currentSlide].classList.remove('active');
        this.slides[newIndex].classList.add('active');

        // Reset text animations on the new slide so they play again
        this.resetAnimations(this.slides[newIndex]);

        // Update current index
        this.currentSlide = newIndex;
    }

    // Advance to the next slide
    nextSlide() {
        // Restart timers for consistent cycling
        clearInterval(this.slideIntervalId);
        this.startProgress();

        this.showSlide(this.currentSlide + 1);
        this.startAutoCycle();  // restart auto cycle from now
    }

    // Go back to the previous slide
    prevSlide() {
        clearInterval(this.slideIntervalId);
        this.startProgress();

        this.showSlide(this.currentSlide - 1);
        this.startAutoCycle();
    }

    // Start or restart the auto-cycle interval
    startAutoCycle() {
        this.slideIntervalId = setInterval(() => this.nextSlide(), this.slideDuration);
    }

    // Animate the progress bar from 0% to 100% over slideDuration
    startProgress() {
        // Clear any existing progress timer and reset width
        clearInterval(this.progressTimerId);
        if (this.progressEl) {
            this.progressEl.style.width = '0%';
        }

        const startTime = Date.now();
        this.progressTimerId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            let pct = (elapsed / this.slideDuration) * 100;
            pct = Math.min(pct, 100);
            if (this.progressEl) {
                this.progressEl.style.width = pct + '%';
            }
            if (pct >= 100) {
                clearInterval(this.progressTimerId);
            }
        }, 50);  // update 20 times per second
    }

    // Reset CSS animations for slide content (forces reflow to restart animations)
    resetAnimations(slideEl) {
        const textSelectors = '.hero-title, .hero-subtitle, .cta-button';
        const elems = slideEl.querySelectorAll(textSelectors);
        elems.forEach(el => {
            // Temporarily disable animation
            el.style.animation = 'none';
            // Force reflow (DOM layout) to "restart" the animation
            // eslint-disable-next-line no-unused-expressions
            el.offsetWidth;
            // Re-enable animation by clearing the inline style
            el.style.animation = '';
        });
    }

    // Add event listeners for hover (pause/resume) and swipe gestures
    addEventListeners() {
        // Pause auto-cycle on mouse enter, resume on leave
        this.container.addEventListener('mouseenter', () => {
            clearInterval(this.slideIntervalId);
            clearInterval(this.progressTimerId);
        });
        this.container.addEventListener('mouseleave', () => {
            // Restart timers on mouse leave
            this.startProgress();
            this.startAutoCycle();
        });

        // Swipe gesture support for touch devices
        this.container.addEventListener('touchstart', (e) => {
            // Record initial touch X position
            this.touchStartX = e.changedTouches[0].screenX;
        }, false);

        this.container.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const diffX = this.touchStartX - touchEndX;

            // Ignore very small swipes (tolerance)
            if (Math.abs(diffX) < 30) return;

            if (diffX > 0) {
                // Swiped left
                this.nextSlide();
            } else {
                // Swiped right
                this.prevSlide();
            }
        }, false);
    }
}

// Initialize the carousel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Carousel('.carousel-container', '.carousel-slide');
});
