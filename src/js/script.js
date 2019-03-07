console.log("lets go");

var handler = {
  routes: function() {
    render.loader();

    var pageurl = window.location.href
      .toString()
      .split(window.location.host)[1];

    if (pageurl === "/music.html") {
      console.log("music");

      api.getMusic();
    } else if (pageurl === "/") {
      console.log("overview");
      api.getBooks();
    }
  }
};

var filter = {
  get: function() {
    var div = document.querySelector("#music");
    div.innerHTML = "";
    return document
      .querySelector("#id-checkbox")
      .addEventListener("click", function(event) {
        var birthyear = Number(document.getElementById("date").value) + 20;

        console.log(birthyear);
        event.preventDefault();

        api.getMusic(birthyear);
      });
  },
  search: function(data) {
    var div = document.querySelector("#music");

    document
      .querySelector("#search")
      .addEventListener("keyup", function(event) {
        div.innerHTML = "";
        var query = document.getElementById("search").value;
        data.map(function(data) {
          var algoTitle = data.songtitle;
          var algoArtist = data.artist;

          query.split(" ").map(function(word) {
            if (algoTitle.toLowerCase().indexOf(word.toLowerCase()) != -1) {
              div.innerHTML += `<div><p class="list-group-item"><span>${algoTitle}</span> ${algoArtist}</p></div>`;
            }
            if (algoArtist.toLowerCase().indexOf(word.toLowerCase()) != -1) {
              div.innerHTML += `<div><p class="list-group-item"><span>${algoTitle}</span> ${algoArtist}</p></div>`;
            }
            // else {
            //   div.innerHTML = "";
            //   div.innerHTML = "geen resultaat";
            // }
          });
        });
        event.preventDefault();
      });
  }
};

var api = {
  getBooks: function() {
    if (localStorage.books !== undefined) {
      console.log("There is BOOKS LS: render.overview");
      render.overview();
    } else if (localStorage.books == undefined) {
      console.log("There is no LS: go get BOOKS data");
      (async function() {
        const api = new API({
          key: "1e19898c87464e239192c8bfe422f280"
        });
        const stream = await api.createStream("search/dementie{3}");
        return stream.pipe(store.localStorage).catch(console.error);
      })();
    }
  },
  getMusic: function(birthyear) {
    if (localStorage.music !== undefined) {
      console.log("There is MUSIC LS:", localStorage.music);
      render.music(birthyear);
    } else if (localStorage.music == undefined) {
      console.log("There is no LS: go get MUSIC data");
      fetch("src/js/data.json")
        .then(function(response) {
          var response = response.json();
          return response;
        })
        .then(function(response) {
          localStorage.setItem("music", JSON.stringify(response));
          render.music(birthyear);
        });
    }
  }
};

var store = {
  localStorage: function(responses) {
    console.log(responses);
    localStorage.setItem("books", JSON.stringify(responses));
    render.overview();
  }
};

var render = {
  loader: function() {
    // console.log("laden");
    // var sectionBooks = document.getElementById("books");
    // sectionBooks.insertAdjacentHTML("beforeend", "<p>LADEN...</p>");
  },
  overview: function(response) {
    var data = JSON.parse(localStorage.getItem("books"));
    console.log(data);

    var sectionBooks = document.getElementById("books");
    var markup = data
      .map(function(data) {
        return `
      <ul>
          <li><img src="${data.coverimages.coverimage[1]._text}"></li>
          <li>${data.titles.title._text}</li>
        </ul>`;
      })
      .join("");
    sectionBooks.insertAdjacentHTML("beforeend", markup);
  },

  music: function(birthyear) {
    var sectionMusic = document.getElementById("music");

    console.log("music");
    var music = JSON.parse(localStorage.getItem("music"));
    console.log(music);
    const result = music.filter(music => music.year != birthyear);
    console.log(result);
    filter.search(music);

    filter.get(birthyear);
    var markup = music
      .map(function(data) {
        return ` <div>
                    <p><span>${data.songtitle} </span>${data.artist}</p>
                </div>`;
      })
      .join("");

    sectionMusic.insertAdjacentHTML("beforeend", markup);
  }
};

handler.routes();
