const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { response } = require('express')


const app = express()
const np = [{
    name: 'dailymail', add: 'https://www.dailymail.co.uk/home/search.html?sel=site&searchPhrase=plastic+pollution',
    base: ''
},
{
    name: 'the guardian', add: 'https://www.theguardian.com/environment/plastic',
    base: ''
},
{
    name: 'telegraph', add: 'https://www.telegraph.co.uk/plastic/',
    base: 'https://www.telegraph.co.uk'
}
]
const articles = []

np.forEach(newspaper => {
    axios.get(newspaper.add)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            $('a:contains("plastic")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                articles.push({
                    title,
                    url: newspaper.base + url,
                    source: newspaper.name
                })

            })

        })

})


app.get('/', (req, res) => { res.json('wlcm to CCAPI') })
app.get('/news', (req, res) => { res.json(articles) })
app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId
    const newspaperAdd = np.filter(newspaper => newspaper.name == newspaperId)[0].add
    const newspaperBase = np.filter(newspaper => newspaper.name == newspaperId)[0].base
    axios.get(newspaperAdd)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specArticles = []

            $('a:contains("plastic")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specArticles)
        }).catch(err => console.log(err))
})
app.listen(PORT, () => console.log(`server running on ${PORT}`))
