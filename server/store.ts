import Redis from "ioredis";

export async function getNet(redis: Redis){
    const data = await fetch("https://api.manifold.markets/v0/get-user-portfolio?userId=z4AJOt8LtNeAXXm7ZhAY1C7A9Ib2");
    const json = await data.json();
    const networth = (json.investmentValue + json.balance); 
    const starting = json.investmentValue - json.dailyProfit;
    const percentChange = (((networth - starting) / starting) * 100).toFixed(2) 
    console.log(percentChange);
    console.log(networth);
    await redis.set("networth", networth);
    await redis.set("24hchange", percentChange);
}

export async function getListeningTo(redis: Redis)  {
    const data = await fetch(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=Wina-&api_key=${process.env.LASTFM_APIKEY}&format=json&limit=10` );
    const json = await data.json();
    const trackdata = json.recenttracks.track.map((track: { artist: { ['#text']: string }, name: string, album: { ['#text']: string }, ['@attr']?: { nowplaying?: string }, date?: { uts: string }, image: { size: string, ['#text']: string }[], url: string }) => { 
      const mediumImage = track.image.find((img: { size: string, ['#text']: string }) => img.size === 'medium');
      return {
        artist: track.artist['#text'],
        name: track.name,
        album: track.album['#text'],
        nowPlaying: !!track['@attr']?.nowplaying,
        timestamp: track.date ? parseInt(track.date.uts, 10) : undefined, 
        mediumImage: mediumImage ? mediumImage['#text'] : null, 
        url: track.url 
      };
    });
    await redis.set("lastfm-last-played", JSON.stringify(trackdata));
}

