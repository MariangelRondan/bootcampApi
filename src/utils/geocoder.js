const NodeGeocoder = require('node-geocoder')

const options = {
    provider: 'opencage',
    apiKey: '2dd8b7ae037844dfad3fba6db0a7e24c',
    httpAdapter: 'https',
    formatter: null
}

const geocoder = NodeGeocoder(options);

module.exports = geocoder;