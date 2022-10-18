

import { useEffect, useState } from 'react';
import styled from 'styled-components'
const options = ['Episode', 'Episode (desc)']
const sorters = {
    "Episode": (one, two) => {
        return (
            one.episode - two.episode
        );
    },
    "Episode (desc)": (one, two) => {
        return (
            two.episode - one.episode
        );
    },
};
const downloadTxtFile = (textFile) => {
    const element = document.createElement("a");
    const file = new Blob(textFile, { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "podcastList.txt";
    document.body.appendChild(element);
    element.click();
}
function App() {

    const [podcastList, setPodcastList] = useState()
    const [sortBy, setSortBy] = useState('Episode')
    const [query, setQuery] = useState('')
    const [textFile, setTextFile] = useState();
    useEffect(() => {
        const getFeed = async () => {
            const feedRes = await fetch('https://feed.podbean.com/rainforestalberta/feed.xml')
            const feed = await feedRes.text()
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(feed, "text/xml");



            let items = xmlDoc.getElementsByTagName("item")
            let podcasts = []
            for (let item of items) {
                let title = item.getElementsByTagName('title')[0].childNodes[0].nodeValue
                let episode = item.getElementsByTagName('itunes:episode')[0].childNodes[0].nodeValue
                let link = item.getElementsByTagName('link')[0].childNodes[0].nodeValue
                let pubDate = item.getElementsByTagName('pubDate')[0].childNodes[0].nodeValue
                let mp3 = item.getElementsByTagName('enclosure')[0].getAttribute('url')
                podcasts.push({ title, episode, link, pubDate, mp3 })
            }
            setPodcastList(podcasts.filter((podcast) => {
                let regex = new RegExp(query.toUpperCase())
                return podcast.title.toUpperCase().match(regex)
            }))
            setTextFile(podcasts.filter((podcast) => {
                let regex = new RegExp(query.toUpperCase())
                return podcast.title.toUpperCase().match(regex)
            }).map((podcast) => `Episode: ${podcast.episode}\nTitle: ${podcast.title} \nURL: ${podcast.link} \nDate: ${new Date(podcast.pubDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} \nAudio URL: ${podcast.mp3} \n\n`))


        }
        getFeed()
    }, [query])
    return (
        <Container>
            <SortDiv>
                Sort by:
          <select onChange={(e) => {
                    setSortBy(e.target.value)
                }} >

                    {options.map((option) => {
                        return <option>{option}</option>
                    })}
                </select>
                <br />
                <input placeholder="Search" onChange={(e) => {
                    setQuery(e.target.value)
                }} /><br />
                <button onClick={() => { downloadTxtFile(textFile) }}> Download text file</button>
            </SortDiv>
            {podcastList && podcastList.sort(sorters[sortBy]).map((podcast) => {
                return (<PodcastList>
                    <div>Episode: {podcast.episode}</div>
                    <div>Title: {podcast.title}</div>
                    <div>URL: <a href={podcast.link}>{podcast.link}</a></div>
                    <div>Date: {new Date(podcast.pubDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div>Audio URL: <a href={podcast.mp3}>{podcast.mp3}</a></div></PodcastList>

                )
            })}

        </Container>
    );
}
const Container = styled.div`
    margin: 20px 40px;
`
const PodcastList = styled.div`
    margin: 10px;
`
const SortDiv = styled.div`
    display:flex;
    flex-direction:column;
width: 150px;
margin: 20px 0;


`
export default App;
