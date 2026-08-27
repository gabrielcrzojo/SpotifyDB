const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const statsRoutes = require('./routes/stats');
const tracksRoutes = require('./routes/tracks');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Load and normalize data
let tracksData = [];
const loadData = () => {
    const startTime = Date.now();
    try {
        const rawData = fs.readFileSync(path.join(__dirname, 'data', 'spotify_dataset.json'), 'utf8');
        const parsed = JSON.parse(rawData);
        
        const audioFeatures = ['danceability', 'energy', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence'];
        
        tracksData = parsed.map(track => {
            audioFeatures.forEach(feature => {
                if (track[feature] && track[feature] > 1.0) {
                    track[feature] = track[feature] / 1000;
                }
            });
            return track;
        });

        const loadTime = Date.now() - startTime;
        console.log(`Loaded ${tracksData.length} tracks in ${loadTime}ms`);
    } catch (err) {
        console.error('Error loading dataset:', err);
        process.exit(1);
    }
};

loadData();

// Make data available to routes
app.locals.tracksData = tracksData;

app.use('/api/stats', statsRoutes);
app.use('/api/tracks', tracksRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
