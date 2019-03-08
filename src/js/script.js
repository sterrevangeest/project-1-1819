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
  get: function(music) {
    var div = document.querySelector("#music");
    console.log(div);
    div.innerHTML = "";
    return document
      .querySelector("#id-checkbox")
      .addEventListener("click", function(event) {
        var birthyear = Number(document.getElementById("date").value) + 20;
        console.log(birthyear);
        const result = music.filter(
          music => birthyear - 10 < music.year && music.year > birthyear + 10
        );
        console.log(result);
        console.log(birthyear);
        event.preventDefault();

        render.musicOnYear(result);
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
              div.innerHTML += `<div><p><span>${algoTitle}</span> ${algoArtist} <span class="addnumber" id=${
                data.id
              } >+ toevoegen</span></p></div>`;
            }
            if (algoArtist.toLowerCase().indexOf(word.toLowerCase()) != -1) {
              div.innerHTML += `<div><p><span>${algoTitle}</span> ${algoArtist}<span class="addnumber" id=${
                data.id
              } >+ toevoegen</span></p></div>`;
            }
            // else {
            //   div.innerHTML = "";
            //   div.innerHTML = "geen resultaat";
            // }
          });
        });
        event.preventDefault();
      });
  },
  addmusic: function(data) {
    var divmusic = document.querySelector("#music");
    var list = document.querySelector("#list");
    var button = document.getElementsByClassName("addnumber");

    //laad lijst
    if (localStorage.tracks !== 0 && localStorage.tracks !== undefined) {
      console.log("er is al een lijst");
      var localStorageList = JSON.parse(localStorage.getItem("tracks"));
      console.log(localStorageList);

      var markup = localStorageList
        .map(function(data) {
          return ` <div>
                      <p><span>${
                        data.songtitle
                      } </span>${data.artist}<span class="addnumber" id=${data.id} >x</span></p>
                  </div>`;
        })
        .join("");
      list.insertAdjacentHTML("beforeend", markup);
    } else {
      console.log("nog geen lijst");
    }

    divmusic.addEventListener("click", function(event) {
      if (event.target.className == "addnumber") {
        console.log(event.target.id);
        event.target.classList.add("added"); // button.classList.toggle("added");
        // Handle click
        console.log(event.target.id);
        var id = Number(event.target.id);

        var existingLocalStorage = JSON.parse(localStorage.getItem("tracks"));
        console.log(existingLocalStorage);

        if (!existingLocalStorage) {
          var track = [data[id - 1]];
          console.log(track);

          localStorage.setItem("tracks", JSON.stringify(track)); //track[0]

          var markup = localStorage
            .map(function(data) {
              return ` <div>
                          <p><span>${
                            data.songtitle
                          } </span>${data.artist}<span class="addnumber" id=${data.id} >x verwijderen</span></p>
                      </div>`;
            })
            .join("");
          list.insertAdjacentHTML("beforeend", markup);
        } else {
          var found = existingLocalStorage.find(ls => ls.id == id);

          if (!found) {
            console.log(id, existingLocalStorage);
            var track = [data[id - 1]][0];
            existingLocalStorage.push(track);
            localStorage.setItem(
              "tracks",
              JSON.stringify(existingLocalStorage)
            );
          } else {
            console.log("found", found);
          }
        }
      }
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
        const stream = await api.createStream("search/dementie{10}");
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
      <div><a href="${data["detail-page"]._text}">
          <img src="${data.coverimages.coverimage[1]._text}">
          <p>${data.titles.title._text}</p>
           <p class="format">${data.formats.format._text}</p>
          </a>
    </div > `;
      })
      .join("");
    sectionBooks.insertAdjacentHTML("beforeend", markup);
  },

  music: function(birthyear) {
    var sectionMusic = document.getElementById("music");

    var music = JSON.parse(localStorage.getItem("music"));

    // const result = music.filter(music => music.year != birthyear);

    filter.get(music);
    console.log(music);
    var markup = music
      .map(function(data) {
        return ` <div>

                    <p> <img src="../src/css/play-button.svg" class="playbutton" alt=""><span>${
                      data.songtitle
                    } </span>${data.artist}<span class="addnumber" id=${data.id} >+ opslaan</span></p>
                </div>`;
      })
      .join("");
    sectionMusic.insertAdjacentHTML("beforeend", markup);
    filter.addmusic(music);
    filter.search(music);
  },
  musicOnYear: function(music) {
    var sectionMusic = document.getElementById("music");
    sectionMusic.innerHTML = "";
    console.log(music);
    var markup = music
      .map(function(data) {
        return ` <div>
                    <p><span>${
                      data.songtitle
                    } </span>${data.artist}<span class="addnumber" id=${data.id} >+ opslaan</span></p>
              </div>`;
      })
      .join("");

    sectionMusic.insertAdjacentHTML("beforeend", markup);
  }
};

handler.routes();
