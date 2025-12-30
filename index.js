const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const LINKS_FILE = path.join(__dirname, 'data', 'links.json');

app.use(express.json());

function readLinks() {
    const data = fs.readFileSync(LINKS_FILE, 'utf-8');
    return JSON.parse(data);
}

function writeLinks(links) {
    fs.writeFileSync(
        LINKS_FILE,
        JSON.stringify(links, null, 2),
        'utf-8'
    );
}


app.get('/ping', (req, res) => {
    res.json({ status: 'Ok' });
});

app.post('/shorten', (req, res) => {
    const { url, slug, title, content } = req.body;

    if (!url || !slug) {
        return res.status(400).json({ error: 'URL and Slug are required' });
    }

    const links = readLinks();

    if (links[slug]) {
        return res.status(409).json({ error: 'Slug already exists' });
    }

    links[slug] = {
        url,
        title: title || '',
        content: content || ''
    };

    writeLinks(links);

    res.json({
        message: 'Link shortened successfully',
        shortUrl: `http://localhost:${PORT}/${slug}`
    });
})

app.get('/:slug', (req, res) => {
    const { slug } = req.params;
    const links = readLinks();
    const link = links[slug];

    if (!link) {
        return res.status(404).json({ error: 'slug not found' });
    }

    res.redirect(link.url);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

