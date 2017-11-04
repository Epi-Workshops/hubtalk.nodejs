const http = require('http')
const { URL } = require('url')

const getUrl = str => new URL(str)

const fetch = url => new Promise(s => http.request(url, s).end())

const constructUrl = town => `http://www.prevision-meteo.ch/services/json/${town}`

const fetchInfos = town => new Promise((s, f) => fetch(getUrl(constructUrl(town))).then(res => {
    const data = []
    res.on('data', chunk => data.push(chunk))
    res.on('end', () => s(JSON.parse(data.join(''))))
}).catch(f))

const getTemperatures = (...town) => Promise.all(town.map(fetchInfos))