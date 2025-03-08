import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// Serve static files from the "html" directory
app.use(express.static(path.join(__dirname, '../html')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});