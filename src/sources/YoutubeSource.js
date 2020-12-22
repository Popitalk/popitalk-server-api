const { google } = require("googleapis");
const config = require("../config");

module.exports.searchVideos = async (terms, page) => {
  const api = terms && terms !== "" ? "search" : "videos";
  const parameters = {
    part: "snippet",
    maxResults: 25,
    key: config.youtubeApiKey
  };
  if (terms && terms !== "") {
    parameters.q = terms;
    parameters.type = "video";
  } else {
    parameters.chart = "mostPopular";
  }
  if (page) {
    parameters.pageToken = page;
  }

  const youtube = google.youtube("v3");
  const response = await youtube[api].list(parameters);

  const results = response.data.items.map(i => {
    const id = i.id.videoId ? i.id.videoId : i.id;

    return {
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      publishedAt: i.snippet.publishedAt,
      title: i.snippet.title,
      thumbnail: i.snippet.thumbnails.high.url
    };
  });

  return {
    nextPageToken: response.data.nextPageToken,
    prevPageToken: response.data.prevPageToken,
    totalResults: response.data.pageInfo.totalResults,
    results
  };
};
