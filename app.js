angular.module('redditBrowser', ['ngRoute'])

    .factory('redditService', function($http) {

        var getAccessToken = function()
        {
            var postData = {
                grant_type: 'https://oauth.reddit.com/grants/installed_client',
                device_id: '123456789012345697802121'
            };

            var headers = {
                "Authorization": "Basic " + btoa("bIDYcVWjkQJ0sA:T4AyTTjRj0CjIWKzgvsghfTPnkM"),
                'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
            };

            return $http.post('https://www.reddit.com/api/v1/access_token', $.param(postData), {headers: headers})
        };

        var getSubreddit = function(subreddit)
        {
            return new Promise(function(resolve, reject) {
                    resolve([]);
            });
        };

        return {
            getAccessToken: getAccessToken,
            getSubreddit: getSubreddit
        };
    })

    .controller('MainController', function($scope, $rootScope, $location, redditService) {
        redditService.getAccessToken().then(function (res) {
            console.log(res);
        });
    })

    .controller('SubredditController', function($scope, $route, redditService) {
        redditService.getSubreddit($route.current.params['subreddit']).then(function(res) {
            console.log(res);
        })
    })

    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/r/:subreddit', {
                templateUrl: 'subreddit.html',
                controller: 'SubredditController'
            });

        $locationProvider.html5Mode(true);
    });