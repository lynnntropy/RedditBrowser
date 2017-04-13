function makeUniqueId()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

angular.module('redditBrowser', ['ngRoute', 'ngSanitize', 'angularMoment'])

    .value('redditCredentials', 'bIDYcVWjkQJ0sA:T4AyTTjRj0CjIWKzgvsghfTPnkM')

    .factory('redditService', function($http, redditCredentials, $httpParamSerializerJQLike) {

        var reddit = null;

        var getAccessToken = function()
        {
            var postData = {
                grant_type: 'https://oauth.reddit.com/grants/installed_client',
                device_id: makeUniqueId()
            };

            var headers = {
                "Authorization": "Basic " + btoa(redditCredentials),
                'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
            };

            return $http.post('https://www.reddit.com/api/v1/access_token', $httpParamSerializerJQLike(postData), {headers: headers})
        };

        var init = function()
        {
            return new Promise(function (resolve, reject) {
                getAccessToken().then(function (res) {
                    console.log(res);
                    reddit = new snoowrap({
                        userAgent: 'RedditBrowser by /u/OmegaVesko',
                        accessToken: res.data.access_token
                    });
                    console.log(reddit);
                    resolve(reddit)
                });
            });
        };

        var getSubreddit = function(subreddit)
        {
            return reddit.getSubreddit(subreddit).getHot();
        };

        var getPost = function(postId)
        {
            return reddit.getSubmission(postId).fetch();
        };

        var getPopularSubreddits = function()
        {
            return reddit.getPopularSubreddits();
        };

        return {
            init: init,
            getSubreddit: getSubreddit,
            getPost: getPost,
            getPopularSubreddits: getPopularSubreddits
        };
    })

    .controller('MainController', function($scope, $rootScope, $location, redditService) {
        redditService.init().then(function (res) {
            $scope.$apply(function () {
                $location.path('/r/all');
                redditService.getPopularSubreddits().then(function (subreddits) {
                    $scope.popularSubreddits = subreddits.slice(0, 5);
                    console.log($scope.popularSubreddits);
                })
            });

            $scope.openSubreddit = function()
            {
                $location.path('/r/' + $scope.subredditInput);
            }
        })
    })

    .controller('SubredditController', function($scope, $route, redditService) {
        redditService.getSubreddit($route.current.params['subreddit']).then(function(posts) {
            console.log(posts);
            $scope.$apply(function () {
                $scope.posts = posts;
                $scope.posts.forEach(function (item) {
                    item.moment = moment(item.created_utc * 1000);
                });
            });
        })
    })

    .controller('PostController', function($scope, $route, redditService) {
        redditService.getPost($route.current.params['postId']).then(function (post) {
            console.log(post);
            $scope.$apply(function () {
                $scope.post = post;
                $scope.post.moment = moment($scope.post.created_utc * 1000);
                $scope.post.comments
            });
        })
    })

    .directive('comment', function () {
        return {
            restrict: 'E',
            templateUrl: 'comment.html',
            scope: {
                comment: '=bindComment'
            }
        }
    })

    .controller('CommentController', function($scope) {
        $scope.comment.moment = moment($scope.comment.created_utc * 1000);
    })

    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/r/:subreddit', {
                templateUrl: 'subreddit.html',
                controller: 'SubredditController'
            })
            .when('/r/:subreddit/comments/:postId/:slug', {
                templateUrl: 'post.html',
                controller: 'PostController'
            });

        $locationProvider.html5Mode(true);
    });