var results = [];

$('#analyse').on('click', function(event) {



	let pages = $('#pageList').val().split('\n');
	let names = []
	pages.forEach(function(d) {
		names.push(d.replace("https://commons.wikimedia.org/wiki/", ""));
	})

	names.forEach(function(d) {
		//add it to the array
		results.push({
			"name": d,
			"extension":"",
			"usage":"",
			"Talk page":"",
			"Talk size":"",
			"revisions":"",
			"users":""
		});

		getDetails(d, results, results.length - 1);
		getTalkPage(d, results, results.length - 1);
		setTimeout(500);
		getGlobalUsage(d, results, results.length - 1);
	})
	console.log(results)
});

function updateTable() {
	//Create table
	d3.select("#results").select("table").remove();
	let table = d3.select("#results").append("table").attr("class","table").attr("class","table-striped")
	let thead = table.append('thead');
	let tbody = table.append('tbody');

	let headers = Object.keys(results[0])

	thead.append('tr')
		.selectAll('th')
		.data(headers)
		.enter()
		.append('th')
		.text(d => d)

	let tr = tbody.selectAll("tr")
		.data(results)
		.enter().append("tr");

	let td = tr.selectAll("td")
		.data(function(d, i) {
			return Object.values(d);
		})
		.enter().append("td")
		.text(function(d) {
			return d;
		});

}

function getDetails(_name, _resultsArray, _index) {
	$.ajax({
		type: "GET",
		//using "cors-anywhere" prefix since the commons API doesn't provide CORS
		url: 'https://wikimedia-cors.herokuapp.com/' + "https://tools.wmflabs.org/magnus-toolserver/commonsapi.php?versions&image=" + _name,
		dataType: "xml",
		success: function(xml) {
			try {
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
				// console.log(extension)
				// console.log(users)
				_resultsArray[_index]["revisions"] = users.length;
				_resultsArray[_index]["users"] = users.join(", ");
				_resultsArray[_index]["extension"] = extension;

				// console.log(_resultsArray);
				updateTable()
			} catch (e) {
				console.log(e);
			}
		}
	});
}

//TODO get image usage using this:
// https://www.mediawiki.org/wiki/Extension:GlobalUsage
// example: https://commons.wikimedia.org/w/api.php?action=query&prop=globalusage&titles=File:2015_Finland_opinion_polls.png&format=json

function getGlobalUsage(_name, _resultsArray, _index) {

	var settings = {
		'cache': false,
		'dataType': "jsonp",
		"async": true,
		"crossDomain": true,
		"url": "https://commons.wikimedia.org/w/api.php?action=query&prop=globalusage&format=json&titles=" + _name,
		"method": "GET",
		"headers": {
			"accept": "application/json",
			"Access-Control-Allow-Origin": "*"
		}
	}

	$.ajax(settings).done(function(response) {
		// console.log(response)
		try {
			var key = Object.keys(response['query']['pages'])[0];
			var usage = response['query']['pages'][key]['globalusage'];
			// console.log(usage)
			_resultsArray[_index]["usage"] = usage.length;
			// console.log(_resultsArray);
			updateTable();
		} catch (e) {
			console.log(e);
		}
	});
}

// TODO get discussion page
// https://commons.wikimedia.org//w/api.php?action=parse&page=File_talk:Viru_Bog_at_winter.jpg&prop=wikitext&formatversion=2&format=json
function getTalkPage(_name, _resultsArray, _index) {

	var settings = {
		'cache': false,
		'dataType': "jsonp",
		"async": true,
		"crossDomain": true,
		"url": "https://commons.wikimedia.org//w/api.php?action=parse&prop=wikitext&formatversion=2&format=json&page=File_talk:" + _name.replace("File:",""),
		"method": "GET",
		"headers": {
			"accept": "application/json",
			"Access-Control-Allow-Origin": "*"
		}
	}

	let hasTalk = false;
	let talkSize = 0;

	$.ajax(settings).done(function(response) {
		try {
			if('parse' in response) {
				// console.log(response['parse']['wikitext'])
				talkSize = response['parse']['wikitext'].length;
				hasTalk = true;
			}
			_resultsArray[_index]["Talk page"] = hasTalk;
			_resultsArray[_index]["Talk size"] = talkSize;
			updateTable();
		} catch (e) {
			console.log(e);
		}
	});
}
