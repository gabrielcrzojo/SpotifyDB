const express = require('express');
const router = express.Router();

// GET /api/tracks/genres - List all genres with track count
router.get('/genres', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const counts = {};
        data.forEach(t => {
            if (t.track_genre) {
                counts[t.track_genre] = (counts[t.track_genre] || 0) + 1;
            }
        });
        const list = Object.keys(counts).sort().map(g => ({
            genre: g,
            count: counts[g]
        }));
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/tracks - Search and filter with sorting & pagination
router.get('/', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
        
        const { search, genre, explicit, sortBy = 'popularity', sortOrder = 'desc', minPop, maxPop } = req.query;
        
        let filtered = data;
        
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(t => 
                (t.track_name && t.track_name.toLowerCase().includes(searchLower)) ||
                (t.artists && t.artists.toLowerCase().includes(searchLower)) ||
                (t.album_name && t.album_name.toLowerCase().includes(searchLower))
            );
        }
        
        if (genre) {
            filtered = filtered.filter(t => t.track_genre === genre);
        }
        
        if (explicit !== undefined && explicit !== '') {
            const isExplicitFilter = explicit === 'true';
            filtered = filtered.filter(t => {
                const isExplicit = t.explicit === true || t.explicit === 'true' || t.explicit === 'True';
                return isExplicit === isExplicitFilter;
            });
        }

        if (minPop !== undefined && minPop !== '') {
            const min = parseFloat(minPop);
            if (!isNaN(min)) filtered = filtered.filter(t => (t.popularity || 0) >= min);
        }

        if (maxPop !== undefined && maxPop !== '') {
            const max = parseFloat(maxPop);
            if (!isNaN(max)) filtered = filtered.filter(t => (t.popularity || 0) <= max);
        }

        // Sorting
        const numericFields = ['popularity', 'duration_ms', 'danceability', 'energy', 'valence', 'acousticness', 'tempo', 'loudness', 'speechiness', 'instrumentalness', 'liveness'];
        const isNumeric = numericFields.includes(sortBy);
        const orderMultiplier = sortOrder === 'asc' ? 1 : -1;

        filtered = [...filtered].sort((a, b) => {
            if (isNumeric) {
                const valA = a[sortBy] !== undefined ? a[sortBy] : 0;
                const valB = b[sortBy] !== undefined ? b[sortBy] : 0;
                return (valA - valB) * orderMultiplier;
            } else {
                const strA = (a[sortBy] || '').toString().toLowerCase();
                const strB = (b[sortBy] || '').toString().toLowerCase();
                return strA.localeCompare(strB) * orderMultiplier;
            }
        });
        
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const pageData = filtered.slice(startIndex, endIndex).map(t => ({
            track_id: t.track_id,
            track_name: t.track_name,
            artists: t.artists,
            album_name: t.album_name,
            popularity: t.popularity,
            duration_ms: t.duration_ms,
            explicit: t.explicit === true || t.explicit === 'true' || t.explicit === 'True',
            danceability: t.danceability,
            energy: t.energy,
            valence: t.valence,
            acousticness: t.acousticness,
            tempo: t.tempo,
            track_genre: t.track_genre
        }));
        
        res.json({
            data: pageData,
            totalPages,
            currentPage: page,
            totalItems
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/tracks/:id - Track details
router.get('/:id', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const track = data.find(t => t.track_id === req.params.id);
        
        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }
        
        res.json({
            ...track,
            explicit: track.explicit === true || track.explicit === 'true' || track.explicit === 'True'
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
