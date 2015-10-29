var magehelper = (function () {

  var token = null;
  var url = null;
  var events = [];
  var observations = [];
  var ducklings = [];
  var activeOnly = true;

  function getTokenForURL() {
	return "?access_token=" + token;
  }

  function loudly(msg) {
	for (var i = 0; i < ducklings.length; i++) {
	  var callback = ducklings[i];
	  if (callback && typeof (callback) === "function") {
		callback(msg);
	  }
	}
  }

  // Return an object exposed to the public
  return {
	getIconURL: function (observation) {
	  if(observation.properties && observation.properties.type) {
		
		return url + "/events/" + observation.eventId + "/form/icons/"
		  + encodeURIComponent(observation.properties.type) 
		  + getTokenForURL();
	  }
	},
	squawk: function (callback) {
	  ducklings[ducklings.length] = callback;
	},
	login: function (endpoint, username, uid, pass) {
	  loudly({loggingIn: true});
	  url = endpoint;
	  $.post(url + "/login", {username: username,
		uid: uid,
		password: pass
	  }, function (data, textStatus, jqXHR) {

		if (data.token) {
		  token = data.token;
		  loudly({loggedIn: true});
		  magehelper.loadEvents();

		} else
		  loudly({failed: true, details: "Sorry, couldn't log you in."});
		console.debug("data", data, "textStatus", textStatus, "jqXHR", jqXHR);
	  }).fail(function () {
		loudly({failed: true, details: "Sorry, couldn't log you in."});
	  });
	},
	loadEvents: function () {
	  if (!magehelper.isReady())
		return;
	  loudly({events_loading: true});
	  $.get(url + "/events", {access_token: token},
	  function (data, textStatus, jqXHR) {
		if (data) {
		  events = data;
		  loudly({events_loaded: true});
		} else
		  loudly({failed: true, details: "Sorry, couldn't list events."});
		console.debug("hm, no data for events?");
		console.debug("data", data, "textStatus", textStatus, "jqXHR", jqXHR);
	  });

	},
	loadObservations: function (eid) {
	  if (!magehelper.isReady())
		return;
	  loudly({observations_loading: true});
	  if(eid == "none") {
		observations = [];
		loudly({observations_loaded: true, observations_count: 0});
		return;
	  }
	  $.get(url + "/events/" + eid + "/observations", {access_token: token},
	  function (data, textStatus, jqXHR) {
		if (data) {
		  if(activeOnly) {
			var trimmed = [];
			for(var i=0; i<data.length; i++) {
			  var o = data[i];
			  if(o.state && o.state.name && o.state.name == "active") 
				trimmed[trimmed.length] = o;
			}
			observations = trimmed;
		  } else observations = data;
		loudly({observations_loaded: true, observations_count: observations.length});
		} else
		  loudly({failed: true, details: "Sorry, couldn't load observations."});
		console.debug("hm, no data for observations?");
		console.debug("data", data, "textStatus", textStatus, "jqXHR", jqXHR);
	  });

	},
	isReady: function () {
	  if (token == null || url == null)
		return false;
	  return true;

	},
	getToken: function () {
	  return token;
	},
	getEvents: function () {
	  return events;
	},
	isActiveOnly: function() { return activeOnly; },
	setActiveOnly: function(arg) { if(arg) activeOnly = true; else activeOnly = false; },
	getObservations: function () { return observations; },
	// Public alias to a private function
  };
})();