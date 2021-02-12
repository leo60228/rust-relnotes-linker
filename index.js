const fetch = require('node-fetch');
const RegExTag = require('regextag');
const Cache = require('timed-cache');

const jsonTtl = 1000 * 60 * 5;
const releaseTtl = 1000 * 60 * 60 * 24;
const cache = new Cache();

async function getReleases() {
    const cachedReleases = cache.get('releases');

    if (cachedReleases) {
        return cachedReleases;
    } else {
        const releasesReq = await fetch('https://blog.rust-lang.org/releases.json');
        const { releases: revReleases } = await releasesReq.json();
        const releases = revReleases.reverse();

        cache.put('releases', releases, { ttl: jsonTtl });

        return releases;
    }
}

async function getRelease(version) {
    const normalizedVersion = version.replace(/(1\.[0-9]+)\.0$/, '$1');

    const cachedRelease = cache.get(normalizedVersion);

    if (cachedRelease) {
        return cachedRelease;
    } else {
        const releases = await getReleases();
        const versionRegex = RegExTag()`\b${normalizedVersion}(?:\.0)?\b`;

        for (const { url, title } of releases) {
            if (versionRegex.test(title)) {
                const absUrl = new URL(url, 'https://blog.rust-lang.org/releases.json').toString();
                cache.put(normalizedVersion, absUrl, { ttl: releaseTtl });
                return absUrl;
            }
            versionRegex.lastIndex = 0;
        }
    }

    return null;
}

exports.relnotes = async (req, res) => {
    res.type('text/plain');

    if (req.method !== 'GET') {
        res.status(405).send(`Only GET is accepted.`);
        return;
    }

    const { release } = req.query;
    if (typeof release !== 'string') {
        res.status(400).send(`Couldn't get a version string.`);
        return;
    }

    const url = await getRelease(release);
    if (url !== null) {
        res.redirect(url);
    } else {
        res.status(204).send(`Couldn't find release ${version}.`);
    }
};
