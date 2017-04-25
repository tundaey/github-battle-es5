var axios = require('axios');
var id = "YOUR CLIENT ID";
var sec = "YOUR SECRET";
var params  = "?client_id=" + id + "&client_secret=" + sec;


module.exports = {

	battle: function(players){
		return axios.all(players.map(getUserData))
		.then(sortPlayers)
		.catch(handleError)
	},

	fetchPopularRepos : function(language){
		var encodedURI = window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:'+ language + '&sort=stars&order=desc&type=Repositories');

		return axios.get(encodedURI)
			.then(function(response){
				return response.data.items;
			})
	}
}


function getProfile(username){
	return axios.get('https://api.github.com/users/' + username)
	.then(function(user){
		return user.data;
	})
}

function getRepos(username){
	return axios.get('https://api.github.com/users/' + username + '/repos' + '?per_page=100')
}

function getStarCount(repos){
	console.log('repos', repos)
	return repos.reduce(function(count, repo){
		return count + repo.stargazers_count;
	}, 0)
}

function calculateScore(profile, repos){
	/*console.log('profile', profile);
	console.log('repos', repos.data)*/
	var followers = profile.followers;
	var totalStars = getStarCount(repos.data);
	return (followers * 3) + totalStars
}

function handleError(error){
	console.warn(error);
	return null;
}

function getUserData(player){
	return axios.all([
			getProfile(player),
			getRepos(player)
		]).then(function(data){
			var profile = data[0];
			var repos = data[1];

			return {
				profile: profile,
				score: calculateScore(profile, repos)
			}
		})
}

function sortPlayers(players){
	return players.sort(function(a, b){
		return b.score - a.score
	})
}