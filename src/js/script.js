console.log("lets go");

var app = {};

var router = {
  handle: function() {
    routie({
      "": function() {
        render.loader();
        console.log(localStorage.length);
        if (localStorage.length !== 0) {
          console.log("Er is localStorage");
          render.overview(localStorage.data);
        } else {
          console.log("Data uit API halen");
          api.get();
        }
      },
      "/:next": function() {
        render.detail();
      }
    });
  }
};

var api = {
  get: async function() {
    const api = new API({
      key: "1e19898c87464e239192c8bfe422f280"
    });
    const stream = await api.createStream("search/dementie{3}");
    return stream.pipe(store.localStorage).catch(console.error);
  },
  store: function(data) {}
};

var store = {
  localStorage: function(responses) {
    console.log(responses);
    localStorage.setItem("data", JSON.stringify(responses));
  }
};

var render = {
  loader: function() {
    console.log("laden");
    var sectionBooks = document.getElementById("books");
    sectionBooks.insertAdjacentHTML("beforeend", "<p>LADEN...</p>");
  },
  overview: function(response) {
    var data = JSON.parse(localStorage.getItem("data"));
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
  detail: function() {
    console.log("detail");
  }
};

router.handle();
