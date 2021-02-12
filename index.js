const fetch = require('node-fetch');

exports.relnotes = (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).send('405 Method Not Allowed');
        return;
    }

    const { version } = req.query;
    res.send('Hello, world!');
};
