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

const getTownsTemperatures = (...town) => new Promise((s, f) => getTemperatures(...town)
    .then(e => s(e.reduce((acc, cur) => {
        acc.push({ [cur['city_info'].name]: { tmp: cur['current_condition'].tmp, img: cur['current_condition'].icon_big } })
        return acc
    }, []))).catch(f))

http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.writeHead(200)
    getTownsTemperatures('strasbourg', 'paris', 'lyon', 'lille', 'nancy').then(e => res.end(`<html>
        <head>
            <title>Weather | Node.js</title>
            <link rel="stylesheet" href="https://unpkg.com/sakura.css/css/sakura.css" type="text/css">
        </head>
        <body>
            <h1>Weather</h1>
            <ul>    
                ${e.map(t => `
                <li>
                    ${Object.keys(t).pop()} | <strong>${t[Object.keys(t).pop()].tmp}</strong>
                    <br/>
                    <img src="${t[Object.keys(t).pop()].img}" alt=${Object.keys(t).pop()}/>
                </li>`).join('')} 
            </ul>
        </body>
    </html>`))
}).listen('1664', 'localhost', () => console.log('server running on localhost:1664'))