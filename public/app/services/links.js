angular.module('hack.linkService', [])

.factory('Links', function($window, $http, $interval, Followers) {
  var personalStories = [];
  var topStories = [];
  var bookmarkStories = [];


  var topStoriesWithKeyword = [];

  var getTopStories = function() {
    console.log('getTopStories');
    var url = '/api/cache/topStories'

    return $http({
      method: 'GET',
      url: url
    })
    .then(function(resp) {

      // Very important to not point topStories to a new array.
      // Instead, clear out the array, then push all the new
      // datum in place. There are pointers pointing to this array.
      topStories.splice(0, topStories.length);
      topStories.push.apply(topStories, resp.data);
    });
  };

  var getTopStoriesWithKeyword = function(keyword) {
    console.log('getTopStoriesWithKeyword');
    var url = '/api/cache/topStoriesWithKeyword'

    return $http({
      method: 'GET',
      url: url,
      params: {keyword: keyword}
    })
    .then(function(resp) {
      console.log(resp);

      // Very important to not point topStories to a new array.
      // Instead, clear out the array, then push all the new
      // datum in place. There are pointers pointing to this array.
      topStoriesWithKeyword.splice(0, topStoriesWithKeyword.length);
      topStoriesWithKeyword.push.apply(topStoriesWithKeyword, resp.data);
      console.log(topStoriesWithKeyword);
    });
  }

  var getPersonalStories = function(usernames){
    var query = 'http://hn.algolia.com/api/v1/search_by_date?hitsPerPage=500&tagFilters=(story,comment),(';
    var csv = arrToCSV(usernames);

    query += csv + ')';

    return $http({
      method: 'GET',
      url: query
    })
    .then(function(resp) {
      angular.forEach(resp.data.hits, function(item){
        // HN Comments don't have a title. So flag them as a comment.
        // This will come in handy when we decide how to render each item.
        if(item.title === null){
          item.isComment = true;
        }
      });

      // Very important to not point personalStories to a new array.
      // Instead, clear out the array, then push all the new
      // datum in place. There are pointers pointing to this array.
      personalStories.splice(0, personalStories.length);
      personalStories.push.apply(personalStories, resp.data.hits);
    });
  };

  var getBookmarks = function(){
    var user = $window.localStorage.getItem('com.hack');

    var data = {username: user};
    return $http({
      method: 'POST',
      url: '/api/bookmarks/getBookmarks',
      data: data
    })
    .then(function(resp) {
      bookmarkStories.splice(0, bookmarkStories.length);
      angular.forEach(resp.data, function (story) {
        bookmarkStories.push(story);
      });
    });
  };

  var arrToCSV = function(arr){
    var holder = [];

    for(var i = 0; i < arr.length; i++){
      holder.push('author_' + arr[i]);
    }

    return holder.join(',');
  };

  var init = function(){
    getPersonalStories(Followers.following);

    $interval(function(){
      getPersonalStories(Followers.following);
      getTopStories();
    }, 300000);
  };

  init();

  return {
    getTopStories: getTopStories,
    getTopStoriesWithKeyword: getTopStoriesWithKeyword,
    getPersonalStories: getPersonalStories,
    personalStories: personalStories,
    topStories: topStories,
    topStoriesWithKeyword: topStoriesWithKeyword,
    getBookmarks: getBookmarks,
    bookmarkStories: bookmarkStories
  };
});


