// List of API keys
// // Marvel API key - 2abb8d4dbef38b7b61728089ea5eb10e
const marvelPublicAPIKey = "2abb8d4dbef38b7b61728089ea5eb10e";

// Define main variables
let searchButtonEl = document.querySelector(".searchBtn");
let searchInputEl = document.querySelector(".search");

// Function to call when the document loads (opacity)
window.onload = function () {
    document.body.setAttribute("class", "content-loaded")
}

// Favourites bar on the left/right of page has localStorage favourites - rename favourites to SHIELD related
// localStorage to store user's favourite heroes (will shorten loading screen since data is saved locally)


// Function to clean up search function parameters
function cleanSearchParams() {

    // Get the search params out of the URL (i.e. `?q=london&format=photo`) and convert it to an array (i.e. ['?q=london', 'format=photo'])
    let heroSearchParamsArr = document.location.search.split('&');

    // Get the query and format values
    let query = herosearchParamsArr[0].split('=').pop();

    getMarvelAPI(query);
};

// Search function
function heroLocator(event) {

    // Prevents page from auto-refreshing
    event.preventDefault();

    // Variables needed for search function
    let heroName = searchInputEl.value;

    // If no hero name, return error
    if (!heroName) {
        // console.error is a placeholder for now. Have something more dynamic that alerts user to enter again.
        console.error("Hero not found. Probably undercover at HYDRA, please try again.");
        return;
    }

    // See https://developer.marvel.com/docs#!/public/getCreatorCollection_get_0
    fetchJsonData(buildApiUrl("characters") + `&name=${heroName}`).then(function(jsonData) {
       let data = jsonData.data;

       if (data.total === 0) {
           console.error("No heroes found!");
       } else {
           // Always use the first result
           let result = data.results[0];
           let thumbnailUrl = `${result.thumbnail.path}.${result.thumbnail.extension}`;

           console.log(result.name);
           console.log(result.description);
           console.log(thumbnailUrl);

       }
    }).catch(function(err) {
        console.log("Failed to get hero data!");
    })

}

// Search input

// Autocomplete widget for search bar
function fetchJsonData(url) {
    return fetch(url).then(function(response) {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    });


}

function buildApiUrl(apiPath) {
    return `https://gateway.marvel.com/v1/public/${apiPath}?apikey=${marvelPublicAPIKey}`;
}

/**
 * Repeatedly request heroes from the API to build a list of all heroes. We don't call this as part of the actual
 * website's usage. Instead, we call it once to build a list of heroes that we can then use for autocomplete during
 * search without having to constantly make new requests.
 *
 * See heroes.js for the list.
 */
function buildHeroList() {

    let characterApiUrl = buildApiUrl("characters") + "&limit=100";
    let allHeroList = [];

    let handleResponse = function(jsonData) {
        let data = jsonData.data;

        data.results.forEach(function(result) {
            allHeroList.push(result.name);
        });

        let currentCount = allHeroList.length;
        if (currentCount < data.total) {
            return fetchJsonData(characterApiUrl + `&offset=${currentCount}`).then(handleResponse);
        }
    };

    fetchJsonData(characterApiUrl).then(handleResponse).then(function() {
        console.log(`Got list of ${allHeroList.length} heroes, copy following line into heroes.js to update the list`);
        console.log(JSON.stringify(allHeroList));
    }).catch(function(err) {
        console.log("Failed to build hero list: " + err);
    });
}

// need a function to renderHeroResults (this will have us dynamically changing HTML and CSS)
function renderHeroResults() {

}

// Search button event listener
searchButtonEl.addEventListener("click", heroLocator);

$(searchInputEl).autocomplete({source: HeroList});


