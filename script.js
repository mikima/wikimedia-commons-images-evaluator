console.log('pronto')

$('#analyse').on('click', function(event) {
	console.log(event, 'ciao')
	let pages = $('#pageList').val().split('\n');
	let names = []
	pages.forEach(function(d) {
		names.push(d.replace("https://commons.wikimedia.org/wiki/", ""));
	})
	console.log(names);
	getDetails(names[0]);
});

function getDetails(_name) {
	$.ajax({
		type: "GET",
		//using "cors-anywhere" prefix since the commons API doesn't provide CORS
		url: 'https://cors-anywhere.herokuapp.com/'+"https://tools.wmflabs.org/magnus-toolserver/commonsapi.php?image=2015_Finland_opinion_polls.png&versions",
		dataType: "xml",
		success: function(xml) {
			console.log(xml)
			var users = []
			//get revisions in XML
			var revisions = xml.getElementsByTagName("version");
			// for each revision, get the user name
			for (var i = 0; i < revisions.length; i++) {
				var user = revisions[i].getElementsByTagName("user")[0].innerHTML
				console.log(user)
				users.push(user);
			}
			//get the file name
			var extension = xml.getElementsByTagName("file")[0].getElementsByTagName("name")[0].innerHTML.split('.').pop();;
			console.log(extension)
		}

	});
}
