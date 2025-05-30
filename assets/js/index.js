document.addEventListener('DOMContentLoaded', function() {
    // Hide content initially
    document.querySelector('#main .inner').classList.remove('loaded');
    document.querySelectorAll('.tiles article').forEach(article => {
        article.classList.remove('loaded');
    });
    
    // Load all content
    loadAllContent();
});

async function loadAllContent() {
    try {
        // Load featured content (New Album)
        const featuredResponse = await fetch('/api/content/featured');
        if (featuredResponse.ok) {
            const featuredContent = await featuredResponse.json();
            updateFeaturedContent(featuredContent);
        }

        // Load The Artist content
        const post1Response = await fetch('/api/content/posts/0');
        if (post1Response.ok) {
            const post1Content = await post1Response.json();
            updatePost1Content(post1Content);
        }

        // Load Latest Tracks content
        const post2Response = await fetch('/api/content/posts/1');
        if (post2Response.ok) {
            const post2Content = await post2Response.json();
            updatePost2Content(post2Content);
        }

        // Load footer content
        const footerResponse = await fetch('/api/content/footer');
        if (footerResponse.ok) {
            const footerContent = await footerResponse.json();
            updateFooterContent(footerContent);
        }

        // After all content is loaded, trigger the animations
        setTimeout(() => {
            document.querySelector('#main .inner').classList.add('loaded');
            document.querySelectorAll('.tiles article').forEach(article => {
                article.classList.add('loaded');
            });
        }, 100); // Small delay to ensure content is rendered

    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function updateFeaturedContent(data) {
    const titleElement = document.querySelector('#featuredTitle');
    const textElement = document.querySelector('#featuredText');
    const imageElement = document.querySelector('#featuredImage');
    
    if (titleElement) titleElement.textContent = data.title;
    if (textElement) textElement.textContent = data.text;
    if (imageElement && data.image) {
        imageElement.src = `images/${data.image}`;
        imageElement.alt = data.title;
        imageElement.onerror = function() {
            console.error('Error loading image:', data.image);
            this.src = 'images/ ';
        };
    }
}

function updatePost1Content(data) {
    const titleElement = document.querySelector('#post1Title');
    const textElement = document.querySelector('#post1Text');
    const imageElement = document.querySelector('#post1Image');
    
    if (titleElement) titleElement.textContent = data.title;
    if (textElement) textElement.textContent = data.text;
    if (imageElement && data.image) {
        imageElement.src = `images/${data.image}`;
        imageElement.alt = data.title;
        imageElement.onerror = function() {
            console.error('Error loading image:', data.image);
            this.src = 'images/ ';
        };
    }
}

function updatePost2Content(data) {
    const titleElement = document.querySelector('#post2Title');
    const textElement = document.querySelector('#post2Text');
    const imageElement = document.querySelector('#post2Image');
    
    if (titleElement) titleElement.textContent = data.title;
    if (textElement) textElement.textContent = data.text;
    if (imageElement && data.image) {
        imageElement.src = `images/${data.image}`;
        imageElement.alt = data.title;
        imageElement.onerror = function() {
            console.error('Error loading image:', data.image);
            this.src = 'images/ ';
        };
    }
}

function updateFooterContent(content) {
    const footerEmail = document.getElementById('footerEmail');
    const tiktokLink = document.getElementById('tiktokLink');
    const facebookLink = document.getElementById('facebookLink');
    const instagramLink = document.getElementById('instagramLink');
    const spotifyLink = document.getElementById('spotifyLink');
    
    if (footerEmail) {
        footerEmail.textContent = content.email;
        footerEmail.href = `mailto:${content.email}`;
    }
    
    if (tiktokLink) tiktokLink.href = content.social.tiktok;
    if (facebookLink) facebookLink.href = content.social.facebook;
    if (instagramLink) instagramLink.href = content.social.instagram;
    if (spotifyLink) spotifyLink.href = content.social.spotify;
} 