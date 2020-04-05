console.log('pronto')

$('#analyse').on('click', function(event) {

	let pages = $('#pageList').val().split('\n');
	let names = []
	pages.forEach(function(d) {
		names.push(d.replace("https://commons.wikimedia.org/wiki/", ""));
	})

	// names.forEach(function(d){
	// 	console.log(d)
	// 	var details = getDetails(names[d]);
	//
	// 	var usage = getGlobalUsage(names[d]);
	//
	// 	// console.log(details, usage)
	// })
	getDetails(names[0]);
	getGlobalUsage(names[0]);
});

function getDetails(_name) {
	$.ajax({
		type: "GET",
		//using "cors-anywhere" prefix since the commons API doesn't provide CORS
		url: 'https://cors-anywhere.herokuapp.com/' + "https://tools.wmflabs.org/magnus-toolserver/commonsapi.php?versions&image="+_name,
		dataType: "xml",
		success: function(xml) {
			console.log(xml)
			var users = []
			//get revisions in XML
			var revisions = xml.getElementsByTagName("version");
			// for each revision, get the user name
			for (var i = 0; i < revisions.length; i++) {
				var user = revisions[i].getElementsByTagName("user")[0].innerHTML
				users.push(user);
			}
			//get the file name
			var extension = xml.getElementsByTagName("file")[0].getElementsByTagName("name")[0].innerHTML.split('.').pop();;
			console.log(extension)
			console.log(users)
			return {"revisions": users.length, "users": users.join(","), "extension":extension}
		}

	});
}

//TODO get image usage using this:
// https://www.mediawiki.org/wiki/Extension:GlobalUsage
// example: https://commons.wikimedia.org/w/api.php?action=query&prop=globalusage&titles=File:2015_Finland_opinion_polls.png&format=json

function getGlobalUsage(_name) {
	var settings = {
		'cache': false,
		'dataType': "jsonp",
		"async": true,
		"crossDomain": true,
		"url": "https://commons.wikimedia.org/w/api.php?action=query&prop=globalusage&format=json&titles="+_name,
		"method": "GET",
		"headers": {
			"accept": "application/json",
			"Access-Control-Allow-Origin": "*"
		}
	}

	$.ajax(settings).done(function(response) {
		console.log(response)
		var key = Object.keys(response['query']['pages'])[0];
		var usage = response['query']['pages'][key]['globalusage'];
		console.log(usage)
		return {"usage": usage}
	});
}
