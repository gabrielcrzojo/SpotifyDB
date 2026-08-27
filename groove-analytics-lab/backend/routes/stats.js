const express = require('express');
const router = express.Router();

// Helper to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// GET /api/stats/summary - Dynamic high-level overview metrics
router.get('/summary', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const totalTracks = data.length;
        if (totalTracks === 0) {
            return res.json({
                totalTracks: 0,
                totalGenres: 0,
                totalArtists: 0,
                explicitPercent: 0,
                avgPopularity: 0,
                avgDurationMs: 0,
                avgDanceability: 0,
                avgEnergy: 0,
                avgValence: 0
            });
        }

        const genres = new Set();
        const artists = new Set();
        let explicitCount = 0;
        let popSum = 0;
        let durationSum = 0;
        let danceSum = 0;
        let energySum = 0;
        let valenceSum = 0;
        let acousticSum = 0;

        data.forEach(t => {
            if (t.track_genre) genres.add(t.track_genre);
            if (t.artists) artists.add(t.artists);
            
            const isExplicit = t.explicit === true || t.explicit === 'true' || t.explicit === 'True';
            if (isExplicit) explicitCount++;
            
            popSum += (t.popularity || 0);
            durationSum += (t.duration_ms || 0);
            danceSum += (t.danceability || 0);
            energySum += (t.energy || 0);
            valenceSum += (t.valence || 0);
            acousticSum += (t.acousticness || 0);
        });

        res.json({
            totalTracks,
            totalGenres: genres.size,
            totalArtists: artists.size,
            explicitCount,
            cleanCount: totalTracks - explicitCount,
            explicitPercent: (explicitCount / totalTracks) * 100,
            avgPopularity: popSum / totalTracks,
            avgDurationMs: durationSum / totalTracks,
            avgDanceability: danceSum / totalTracks,
            avgEnergy: energySum / totalTracks,
            avgValence: valenceSum / totalTracks,
            avgAcousticness: acousticSum / totalTracks
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/stats/scatter-plot - Multi-axis scatter plot data with filtering & custom sampling
router.get('/scatter-plot', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const xAxis = req.query.xAxis || 'danceability';
        const yAxis = req.query.yAxis || 'popularity';
        const genre = req.query.genre;
        const explicitParam = req.query.explicit;
        const maxSample = Math.min(Math.max(parseInt(req.query.sampleSize) || 1500, 100), 5000);

        let filtered = data;
        if (genre) {
            filtered = filtered.filter(t => t.track_genre === genre);
        }
        if (explicitParam !== undefined && explicitParam !== '') {
            const isExp = explicitParam === 'true';
            filtered = filtered.filter(t => {
                const trackExp = t.explicit === true || t.explicit === 'true' || t.explicit === 'True';
                return trackExp === isExp;
            });
        }

        let indices = Array.from({ length: filtered.length }, (_, i) => i);
        shuffleArray(indices);

        const sampleSize = Math.min(maxSample, filtered.length);
        const sampledIndices = indices.slice(0, sampleSize);

        const result = sampledIndices.map(i => {
            const t = filtered[i];
            return {
                track_id: t.track_id,
                track_name: t.track_name,
                artists: t.artists,
                track_genre: t.track_genre,
                explicit: t.explicit === true || t.explicit === 'true' || t.explicit === 'True',
                popularity: t.popularity || 0,
                danceability: t.danceability || 0,
                energy: t.energy || 0,
                valence: t.valence || 0,
                acousticness: t.acousticness || 0,
                speechiness: t.speechiness || 0,
                instrumentalness: t.instrumentalness || 0,
                liveness: t.liveness || 0,
                tempo: t.tempo || 0,
                loudness: t.loudness || 0,
                duration_ms: t.duration_ms || 0,
                x: t[xAxis] !== undefined ? t[xAxis] : 0,
                y: t[yAxis] !== undefined ? t[yAxis] : 0
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/stats/explicit-comparison
router.get('/explicit-comparison', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        let expSum = 0, expCount = 0;
        let nonExpSum = 0, nonExpCount = 0;

        data.forEach(t => {
            const isExplicit = t.explicit === true || t.explicit === 'true' || t.explicit === 'True';
            if (isExplicit) {
                expSum += (t.popularity || 0);
                expCount++;
            } else {
                nonExpSum += (t.popularity || 0);
                nonExpCount++;
            }
        });

        const expAvg = expCount > 0 ? (expSum / expCount) : 0;
        const nonExpAvg = nonExpCount > 0 ? (nonExpSum / nonExpCount) : 0;

        let diff = 0;
        if (nonExpAvg > 0) {
            diff = ((expAvg - nonExpAvg) / nonExpAvg) * 100;
        }

        res.json({
            explicit: {
                avgPopularity: expAvg,
                count: expCount
            },
            nonExplicit: {
                avgPopularity: nonExpAvg,
                count: nonExpCount
            },
            percentageDifference: diff
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/stats/top-genres
router.get('/top-genres', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 150);

        const genreStats = {};

        data.forEach(t => {
            const g = t.track_genre;
            if (!g) return;
            if (!genreStats[g]) {
                genreStats[g] = { sum: 0, count: 0, danceSum: 0, energySum: 0, valenceSum: 0 };
            }
            genreStats[g].sum += (t.popularity || 0);
            genreStats[g].danceSum += (t.danceability || 0);
            genreStats[g].energySum += (t.energy || 0);
            genreStats[g].valenceSum += (t.valence || 0);
            genreStats[g].count++;
        });

        const results = Object.keys(genreStats).map(g => ({
            genre: g,
            avgPopularity: genreStats[g].sum / genreStats[g].count,
            avgDanceability: genreStats[g].danceSum / genreStats[g].count,
            avgEnergy: genreStats[g].energySum / genreStats[g].count,
            avgValence: genreStats[g].valenceSum / genreStats[g].count,
            trackCount: genreStats[g].count
        }));

        results.sort((a, b) => b.avgPopularity - a.avgPopularity);

        res.json(results.slice(0, limit));
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/stats/top-artists - Top artists leaderboard
router.get('/top-artists', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
        const minTracks = parseInt(req.query.minTracks) || 3;
        const sortBy = req.query.sortBy || 'popularity'; // 'popularity' or 'tracks'

        const artistStats = {};

        data.forEach(t => {
            const a = t.artists;
            if (!a) return;
            if (!artistStats[a]) {
                artistStats[a] = {
                    artist: a,
                    popSum: 0,
                    trackCount: 0,
                    genres: new Set(),
                    danceSum: 0,
                    energySum: 0
                };
            }
            artistStats[a].popSum += (t.popularity || 0);
            artistStats[a].danceSum += (t.danceability || 0);
            artistStats[a].energySum += (t.energy || 0);
            artistStats[a].trackCount++;
            if (t.track_genre) artistStats[a].genres.add(t.track_genre);
        });

        const results = Object.values(artistStats)
            .filter(item => item.trackCount >= minTracks)
            .map(item => ({
                artist: item.artist,
                avgPopularity: item.popSum / item.trackCount,
                trackCount: item.trackCount,
                avgDanceability: item.danceSum / item.trackCount,
                avgEnergy: item.energySum / item.trackCount,
                genres: Array.from(item.genres).slice(0, 3)
            }));

        if (sortBy === 'tracks') {
            results.sort((a, b) => b.trackCount - a.trackCount);
        } else {
            results.sort((a, b) => b.avgPopularity - a.avgPopularity);
        }

        res.json(results.slice(0, limit));
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/stats/genre-profile - Audio features profile comparison for selected genres
router.get('/genre-profile', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const genresParam = req.query.genres; // e.g. "pop,rock,classical"
        const selectedGenres = genresParam ? genresParam.split(',').map(s => s.trim().toLowerCase()) : null;

        const genreStats = {};

        data.forEach(t => {
            const g = t.track_genre;
            if (!g) return;
            if (selectedGenres && !selectedGenres.includes(g.toLowerCase())) return;

            if (!genreStats[g]) {
                genreStats[g] = {
                    genre: g,
                    count: 0,
                    danceability: 0,
                    energy: 0,
                    speechiness: 0,
                    acousticness: 0,
                    instrumentalness: 0,
                    liveness: 0,
                    valence: 0,
                    popularity: 0,
                    tempo: 0
                };
            }

            genreStats[g].count++;
            genreStats[g].danceability += (t.danceability || 0);
            genreStats[g].energy += (t.energy || 0);
            genreStats[g].speechiness += (t.speechiness || 0);
            genreStats[g].acousticness += (t.acousticness || 0);
            genreStats[g].instrumentalness += (t.instrumentalness || 0);
            genreStats[g].liveness += (t.liveness || 0);
            genreStats[g].valence += (t.valence || 0);
            genreStats[g].popularity += (t.popularity || 0);
            genreStats[g].tempo += (t.tempo || 0);
        });

        const profiles = Object.values(genreStats).map(g => ({
            genre: g.genre,
            trackCount: g.count,
            avgPopularity: g.popularity / g.count,
            avgTempo: g.tempo / g.count,
            danceability: g.danceability / g.count,
            energy: g.energy / g.count,
            speechiness: g.speechiness / g.count,
            acousticness: g.acousticness / g.count,
            instrumentalness: g.instrumentalness / g.count,
            liveness: g.liveness / g.count,
            valence: g.valence / g.count
        }));

        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/stats/feature-distribution - Histogram distribution of any feature
router.get('/feature-distribution', (req, res) => {
    try {
        const data = req.app.locals.tracksData;
        const feature = req.query.feature || 'popularity';
        const numBins = Math.min(Math.max(parseInt(req.query.bins) || 10, 5), 30);

        let min = Infinity;
        let max = -Infinity;

        data.forEach(t => {
            const val = t[feature];
            if (typeof val === 'number') {
                if (val < min) min = val;
                if (val > max) max = val;
            }
        });

        if (min === Infinity) {
            return res.json([]);
        }

        const step = (max - min) / numBins;
        const bins = Array.from({ length: numBins }, (_, i) => {
            const start = min + i * step;
            const end = start + step;
            return {
                binLabel: `${start.toFixed(1)} - ${end.toFixed(1)}`,
                rangeStart: start,
                rangeEnd: end,
                count: 0
            };
        });

        data.forEach(t => {
            const val = t[feature];
            if (typeof val === 'number') {
                let binIdx = Math.floor((val - min) / step);
                if (binIdx >= numBins) binIdx = numBins - 1;
                if (binIdx >= 0) bins[binIdx].count++;
            }
        });

        res.json({
            feature,
            min,
            max,
            bins
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
