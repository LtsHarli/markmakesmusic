require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use('/images', express.static('images'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        // Keep original file extension
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// JWT Authentication Middleware for admin operations only
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { password } = req.body;

    if (password === process.env.PASSWORD) {
        const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid password' });
    }
});

// Public GET endpoints (no authentication required)
app.get('/api/content/featured', async (req, res) => {
    try {
        const content = await fs.readFile('content/featured.json', 'utf8');
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load featured content' });
    }
});

app.get('/api/content/posts/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const content = await fs.readFile(`content/post${index}.json`, 'utf8');
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load post content' });
    }
});

app.get('/api/content/footer', async (req, res) => {
    try {
        const content = await fs.readFile('content/footer.json', 'utf8');
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(500).json({ error: 'Failed to load footer content' });
    }
});

// Function to delete old image
async function deleteOldImage(imagePath) {
    try {
        console.log('Attempting to delete image:', imagePath);
        if (imagePath && imagePath !== 'placeholder.jpg') {
            const fullPath = path.join('images', imagePath);
            console.log('Full path to delete:', fullPath);
            
            try {
                await fs.access(fullPath); // Check if file exists
                console.log('File exists, proceeding with deletion');
                await fs.unlink(fullPath); // Delete the file
                console.log(`Successfully deleted old image: ${imagePath}`);
            } catch (accessError) {
                if (accessError.code === 'ENOENT') {
                    console.log('File does not exist, skipping deletion');
                } else {
                    console.error('Error accessing file:', accessError);
                }
            }
        } else {
            console.log('Skipping deletion - invalid image path or placeholder');
        }
    } catch (error) {
        console.error('Error in deleteOldImage:', error);
    }
}

// Protected admin endpoints (require authentication)
app.post('/api/content/featured', authenticateAdmin, upload.single('image'), async (req, res) => {
    try {
        console.log('Updating featured content...');
        // Read current content to get old image path
        const currentContent = JSON.parse(await fs.readFile('content/featured.json', 'utf8'));
        console.log('Current image:', currentContent.image);
        
        const content = {
            title: req.body.title,
            text: req.body.text,
            image: req.file ? req.file.filename : req.body.image
        };
        console.log('New image:', content.image);

        // If new image was uploaded, delete the old one
        if (req.file && currentContent.image) {
            console.log('New file uploaded, attempting to delete old image');
            await deleteOldImage(currentContent.image);
        }

        await fs.writeFile('content/featured.json', JSON.stringify(content, null, 2));
        res.json({ 
            message: 'Featured content updated successfully',
            image: content.image 
        });
    } catch (error) {
        console.error('Error in featured update:', error);
        res.status(500).json({ message: 'Error updating featured content' });
    }
});

app.post('/api/content/posts/:index', authenticateAdmin, upload.single('image'), async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        console.log(`Updating post ${index}...`);
        
        // Read current content to get old image path
        const currentContent = JSON.parse(await fs.readFile(`content/post${index}.json`, 'utf8'));
        console.log('Current image:', currentContent.image);
        
        const content = {
            title: req.body.title,
            text: req.body.text,
            image: req.file ? req.file.filename : req.body.image
        };
        console.log('New image:', content.image);

        // If new image was uploaded, delete the old one
        if (req.file && currentContent.image) {
            console.log('New file uploaded, attempting to delete old image');
            await deleteOldImage(currentContent.image);
        }

        await fs.writeFile(`content/post${index}.json`, JSON.stringify(content, null, 2));
        res.json({ 
            message: 'Post content updated successfully',
            image: content.image 
        });
    } catch (error) {
        console.error('Error in post update:', error);
        res.status(500).json({ message: 'Error updating post content' });
    }
});

app.post('/api/content/footer', authenticateAdmin, async (req, res) => {
    try {
        const content = {
            email: req.body.email,
            social: {
                tiktok: req.body.social.tiktok,
                facebook: req.body.social.facebook,
                instagram: req.body.social.instagram,
                spotify: req.body.social.spotify
            }
        };
        await fs.writeFile('content/footer.json', JSON.stringify(content, null, 2));
        res.json({ message: 'Footer content updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating footer content' });
    }
});

// Initialize content files
async function initializeContent() {
    try {
        // Create content directory if it doesn't exist
        await fs.mkdir('content', { recursive: true });
        // Create images directory if it doesn't exist
        await fs.mkdir('images', { recursive: true });

        // Initialize featured content
        const featuredContent = {
            title: "New Album Release",
            text: "Check out my latest album featuring new tracks and collaborations.",
             
        };
        await fs.writeFile('content/featured.json', JSON.stringify(featuredContent, null, 2));

        // Initialize post 1 (The Artist)
        const post1Content = {
            title: "The Artist",
            text: "Learn more about my musical journey and artistic vision.",
             
        };
        await fs.writeFile('content/post0.json', JSON.stringify(post1Content, null, 2));

        // Initialize post 2 (Latest Tracks)
        const post2Content = {
            title: "Latest Tracks",
            text: "Listen to my newest releases and upcoming projects.",
             
        };
        await fs.writeFile('content/post1.json', JSON.stringify(post2Content, null, 2));

        // Initialize footer content
        const footerContent = {
            email: "contact@markmakesmusic.com",
            social: {
                tiktok: "https://tiktok.com/@markmakesmusic",
                facebook: "https://facebook.com/markmakesmusic",
                instagram: "https://instagram.com/markmakesmusic",
                spotify: "https://open.spotify.com/artist/markmakesmusic"
            }
        };
        await fs.writeFile('content/footer.json', JSON.stringify(footerContent, null, 2));
    } catch (error) {
        console.error('Error initializing content:', error);
    }
}

// Start server
app.listen(port, async () => {
    await initializeContent();
    console.log(`Server running on port ${port}`);
}); 