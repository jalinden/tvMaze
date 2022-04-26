"use strict";

const $showsList = $("#shows-list")
const $episodesArea = $("#episodes-area");
let searchQuery = document.getElementById("search-query")
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  let shows = []
  let showsData = await axios.get(`https://api.tvmaze.com/search/shows?q=${term}`)
  let showDataArray = showsData.data;
  for(let showObject of showDataArray) {
      let id = showObject.show.id;
      let name = showObject.show.name;
      let summary = showObject.show.summary;
      let image = showObject.show.image ? showObject.show.image.original : 'https://tinyurl.com/tv-missing' ;
      let newShowObject = {id,name,summary,image}
      shows.push(newShowObject)
  }
 return shows; 
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              onerror="this.src = 'https://tinyurl.com/tv-missing';"
              alt="" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
           <button id="button" class="btn btn-outline-dark btn-lg Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);

  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = searchQuery.value;
  const shows = await getShowsByTerm(term);  
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


$showsList.on("click", async function(evt) {
  if(evt.target instanceof HTMLButtonElement) {
   let $dataShowId = $(evt.target).closest(".Show").data("show-id")
  await getEpisodesOfShow($dataShowId)
  }
  })

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(id) { 
  let episodes = []
  let episodesData = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodeDataArray = episodesData.data;
  for(let episodeObject of episodeDataArray) {
      let id = episodeObject.id;
      let name = episodeObject.name;
      let season = episodeObject.season;
      let number = episodeObject.number;
      let newEpisodeObject = {id,name,season,number}
      episodes.push(newEpisodeObject)
  }
 populateEpisodes(episodes); 
}

/** Empties any current episodes stored in the episodes list.
 * Then,Given an array of episode objects, creates a new <li> for each episode
 * and populates it with the proper episode data. These are added to the episodes
 * list 
 */

function populateEpisodes(episodes) { 
  $episodesArea.show();
  const $episodesList = $("#episodes-list");
  $episodesList.empty()
  for(let episode of episodes){
    let newLi = document.createElement("li");
    newLi.innerText = `${episode.name} (season ${episode.season}, number ${episode.number})`;
    $episodesList.append(newLi)
  }
}
