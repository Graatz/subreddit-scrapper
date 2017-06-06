let after = "";
let subreddit = "";
let currentUrl = "";
let images = [];
let finishedLoading = true;

function setSubreddit(sub) {
  $(".images").children().html("");
  after = "";
  subreddit = sub;
  currentUrl = "https://www.reddit.com/r/" + subreddit + "/.json";
  $(".subreddit-header").html("/r/" + subreddit);
  updateUrl();
}

function updateUrl() {
  if (finishedLoading) {
    currentUrl = "https://www.reddit.com/r/" + subreddit + "/.json" + after;
    loadImages();
  }
}

function loadImages() {
  let imageNumber = 0;
  images = [];
  $.getJSON(currentUrl, function( data ) {
    $.each(data.data.children, function (i, item) {
      if (imageNumber === 0)
        loadingStarted();

      imageExists(item.data.url, function(src, exists) {
        if (exists && finishedLoading === false)
          placeImage(item.data.url, item.data.title);

        if (imageNumber === data.data.children.length - 1)
          loadingFinished();

        imageNumber ++;
      });
    });
    if (data.data.after != null)
      after = "?after=" + data.data.after;
    else
      after = "undefined";
  });
}

function loadingStarted() {
  $(".loader").fadeIn(0);
  finishedLoading = false;
}

function loadingFinished() {
  for (let i = 0; i < images.length; i++) {
    images[i].addClass('show').appendTo(getMinContainer());
  }

  finishedLoading = true;
  $(".loader").fadeOut(0);
  $(".images").fadeIn();

  if(($(window).scrollTop() + $(window).height() == $(document).height()) && finishedLoading === true) {
    if (after != "undefined")
      updateUrl();
  }
}

function placeImage(src, title) {
  let img = $('<img/>').attr({ 'src': src, 'alt': title }).addClass("image");
  img.click(function() {
    $(".zoom").children("img").attr({ 'src': $(this).attr('src'), 'alt': $(this).attr('alt')});
    $(".zoom").children(".title").html(title);
    $(".zoom").fadeIn(200);
  });
  images.push(img);
}

function getMinContainer() {
  let tab = [];
  tab[0] = $(".container-1").height();
  tab[1] = $(".container-2").height();
  tab[2] = $(".container-3").height();
  let min = tab[0];
  let index = 1;
  for(let i = 0; i < tab.length; i++) {
    if (tab[i] < min)
      index = i + 1;
  }

  return '.container-' + index;
}

function imageExists(src, callback) {
  let img = new Image();
  img.src = src;
  img.onerror = function() {
    callback(src, false);
  };
  img.onload = function() {
    if (img.width < $('.container-1').width()) callback(src, false);
    else callback(src, true);
  }
}

$(document).ready(function() {
  $(document).scroll(function() {
    if(($(window).scrollTop() + $(window).height() == $(document).height()) && finishedLoading === true) {
      if (after != "undefined") {
        console.log("scrollEvent");
        updateUrl();
      }
    }
  });

  $(".zoom").hide();
  $('.zoom').click(function() {
    $(".zoom").fadeOut(200);
  })

  $('.subreddit-input').keyup(function(event) {
    if(event.keyCode == 13){
        $(".subreddit-button").click();
    }
  });
  $(".subreddit-button").click(function() {
    setSubreddit($(".subreddit-input").val());
  });

  $(".tag").click(function (){
    console.log("tagEvent");
    setSubreddit($(this).html());
  });
});
