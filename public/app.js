// TODO: write all this shit

//TODO: write a .getJSON to get all the scraped articles and load them into cards for the front page
$.getJSON('/articles', function(data) {

    console.log(data);
    
    for (let i = 0; i < data.length; i++) {
      $('#article-container').append(
        '<div class="card" data-id=' + data[i]._id + '>' +
          '<div class="card-header">' + data[i].headline + '</div>' +
          '<div class="card-body">' +
            '<p class="card-text">' +
              data[i].summary +
            '</p>' +
            '<a href="#" class="btn btn-primary">' +
              'Save Article' +
            '</a>' +
          '</div>' +
        '</div>'
      );
    }
  });

//TODO: write a .getJSON to get all the saved articles and load them into cards for the saved page

// TODO: write a on("click") to save an article

// TODO: write a on("click") to delete an article

// TODO: write a on("click") to save a comment

// TODO: write a on("click") to delete a comment
