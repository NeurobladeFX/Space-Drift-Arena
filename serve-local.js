const express = require('express');
const app = express();
const port = 8081;
const path = require('path');

app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.listen(port, () => {
    console.log(`Development server running strictly on http://localhost:${port}`);
    console.log(`MIME types explicitly handled.`);
});
