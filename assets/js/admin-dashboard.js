document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin-login.html';
        return;
    }

    // Load current content
    loadAllContent();

    // Set up form handlers
    document.getElementById('featuredForm').addEventListener('submit', handleFeaturedUpdate);
    document.getElementById('post1Form').addEventListener('submit', handlePost1Update);
    document.getElementById('post2Form').addEventListener('submit', handlePost2Update);
    document.getElementById('footerForm').addEventListener('submit', handleFooterUpdate);
});

async function loadAllContent() {
    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // Load featured content
        const featuredResponse = await fetch('/api/content/featured', { headers });
        if (featuredResponse.ok) {
            const featuredContent = await featuredResponse.json();
            updateFeaturedForm(featuredContent);
        }

        // Load The Artist content
        const post1Response = await fetch('/api/content/posts/0', { headers });
        if (post1Response.ok) {
            const post1Content = await post1Response.json();
            updatePost1Form(post1Content);
        }

        // Load Latest Tracks content
        const post2Response = await fetch('/api/content/posts/1', { headers });
        if (post2Response.ok) {
            const post2Content = await post2Response.json();
            updatePost2Form(post2Content);
        }

        // Load footer content
        const footerResponse = await fetch('/api/content/footer', { headers });
        if (footerResponse.ok) {
            const footerContent = await footerResponse.json();
            updateFooterForm(footerContent);
        }
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function updateFeaturedForm(content) {
    document.getElementById('featuredTitle').value = content.title;
    document.getElementById('featuredText').value = content.text;
}

function updatePost1Form(content) {
    document.getElementById('post1Title').value = content.title;
    document.getElementById('post1Text').value = content.text;
}

function updatePost2Form(content) {
    document.getElementById('post2Title').value = content.title;
    document.getElementById('post2Text').value = content.text;
}

function updateFooterForm(content) {
    document.getElementById('footerEmail').value = content.email;
    document.getElementById('tiktokLink').value = content.social.tiktok;
    document.getElementById('facebookLink').value = content.social.facebook;
    document.getElementById('instagramLink').value = content.social.instagram;
    document.getElementById('spotifyLink').value = content.social.spotify;
}

async function handleFeaturedUpdate(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
        const response = await updateContent('/api/content/featured', formData);
        if (response.ok) {
            const data = await response.json();
            // Update the image preview if a new image was uploaded
            if (data.image) {
                document.querySelector('#featured-image-preview').src = `images/${data.image}`;
            }
        }
    } catch (error) {
        console.error('Error updating featured content:', error);
    }
}

async function handlePost1Update(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
        const response = await updateContent('/api/content/posts/0', formData);
        if (response.ok) {
            const data = await response.json();
            // Update the image preview if a new image was uploaded
            if (data.image) {
                document.querySelector('#post1-image-preview').src = `images/${data.image}`;
            }
        }
    } catch (error) {
        console.error('Error updating post 1:', error);
    }
}

async function handlePost2Update(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
        const response = await updateContent('/api/content/posts/1', formData);
        if (response.ok) {
            const data = await response.json();
            // Update the image preview if a new image was uploaded
            if (data.image) {
                document.querySelector('#post2-image-preview').src = `images/${data.image}`;
            }
        }
    } catch (error) {
        console.error('Error updating post 2:', error);
    }
}

async function handleFooterUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        social: {
            tiktok: formData.get('social.tiktok'),
            facebook: formData.get('social.facebook'),
            instagram: formData.get('social.instagram'),
            spotify: formData.get('social.spotify')
        }
    };
    await updateContent('/api/content/footer', data);
}

async function updateContent(endpoint, data) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' })
            },
            body: data instanceof FormData ? data : JSON.stringify(data)
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/admin-login.html';
            return response;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update content');
        }

        return response;
    } catch (error) {
        console.error('Error updating content:', error);
        throw error;
    }
} 