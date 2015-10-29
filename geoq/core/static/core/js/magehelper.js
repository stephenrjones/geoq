var magehelper = (function () {

  var token = null;
  var url = null;
  var events = [];
  var observations = [];
  var observationTypes = [];
  var ducklings = [];
  var activeOnly = true;
  var current_event = "none";

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
	getIconURL: function (eid, obsType) {
	  if (eid === null || obsType == null)
		return null;
	  return url + "/events/" + eid + "/form/icons/"
			  + encodeURIComponent(obsType)
			  + getTokenForURL();
	},
	getIconURLFromObservation: function (observation) {
	  if (observation.properties && observation.properties.type) {
		return magehelper.getIconURL(observation.eventId, observation.properties.type);
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
	  });

	},
	loadObservations: function (eid) {
	  if (!magehelper.isReady())
		return;
	  loudly({observations_loading: true});
	  current_event = eid;
	  if (eid == "none") {
		observations = [];
		loudly({observations_loaded: true, observations_count: 0});
		return;
	  }
	  $.get(url + "/events/" + eid + "/observations", {access_token: token},
	  function (data, textStatus, jqXHR) {
		observationTypes = [];
		if (data) {
		  if (activeOnly) {
			var trimmed = [];
			for (var i = 0; i < data.length; i++) {
			  var o = data[i];
			  if (o.state && o.state.name && o.state.name === "active") {
				trimmed[trimmed.length] = o;
				if (o.properties && o.properties.type)
				  if (observationTypes.indexOf(o.properties.type) === -1)
					observationTypes[observationTypes.length] = o.properties.type;
			  }
			}
			observations = trimmed;
		  } else
			observations = data;
		  loudly({observations_loaded: true, observations_count: observations.length});
		} else
		  loudly({failed: true, details: "Sorry, couldn't load observations."});
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
	isActiveOnly: function () {
	  return activeOnly;
	},
	setActiveOnly: function (arg) {
	  if (arg)
		activeOnly = true;
	  else
		activeOnly = false;
	},
	getObservations: function () {
	  return observations;
	},
	getObservationTypes: function () {
	  return observationTypes;
	},
	getCurrentEvent: function() {
	  return current_event;
	}
	// Public alias to a private function
  };
})();