const {Vimeo} = require('vimeo');
const config = require("../config");


module.exports.searchVideos = async (terms, page) => {
  const api = terms && terms !== "" ? "search" : "videos";
  const parameters = {
    // This returns the first page of videos containing the term "vimeo staff".
    // These videos will be sorted by most relevant to least relevant.
    path: '/videos',
    query: {
      per_page: 25,
      sort: 'relevant',
      direction: 'asc'
    }
  };
  if (terms && terms !== "") {
    parameters.query.query = terms;
  } else {
    parameters.query.filter= "trending";
  }
  if (page) {
    parameters.query.page = page;
  }

  const lib = new Vimeo(config.vimeoClientId, config.vimeoClientSecret);
  if (config.vimeoAccessToken) {
    lib.setAccessToken(config.vimeoAccessToken);
    const makeRequest = async (parameters) => {
      return new Promise((resolve, reject) => {
        lib.request(parameters, function (error, response, statusCode, headers) {
            if (error) {
              console.log('error');
              console.log(error);
              return reject(err);
            } else {
              const results = response.data.map(i => {
                const uriSplit = i.uri.split("/");
                const id = uriSplit[uriSplit.length - 1];

                return {
                  id,
                  url: i.link,
                  publishedAt: i.release_time,
                  title: i.name,
                  thumbnail: i.pictures.sizes[0].link
                };
              });

              // console.log("Vimeo Results", results);

              const data = {
                nextPageToken: response.paging.next,
                prevPageToken: response.paging.previous,
                totalResults: response.total,
                results
              };
              resolve(data);
            }

          }
        );
      });
    }

    const response = await makeRequest(parameters);
    return response;

  }
};
