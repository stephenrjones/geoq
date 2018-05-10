
function initResponders() {

    var responderIcon = L.icon({
        iconUrl: '/static/leaflet/images/user.png',
    //    shadowUrl: 'leaf-shadow.png',

        iconSize:     [20, 20], // size of the icon
    //    shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    //    shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    encodeHTML = function(s) {
        if(s instanceof String)
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        return s;
    };

    realtime = L.realtime(
        function(success, error) {
            $.getJSON("/geoq/responders/geojson", function(data) {
                if(data.features) {
                    for(var i = 0; i<data.features.length; i++) {
                        // haaaax
                        for(var ci=0; ci<data.features[i].geometry.coordinates.length; ci++) {
                            data.features[i].geometry.coordinates[ci]  = Number(data.features[i].geometry.coordinates[ci]);
                        }
                    }

                }
                success(data);

            });
        },
        {
            interval: 5 * 1000,
            pointToLayer: function(geoJsonPoint, latlng) {
                console.debug("whee", geoJsonPoint, latlng);
                props = geoJsonPoint.properties;
                var id = props.id;
                var marker =  L.marker(latlng, {icon: responderIcon});
                var fields = ["name", "contact_instructions", "in_field", "last_seen"];
                var ph = "<ul>";
                for(var i=0; i<fields.length; i++)
                    ph += "<li>" + fields[i] + ": " + encodeHTML(props[fields[i]]) +"</li>";
                ph += "</ul>";
                marker.bindPopup(ph);
                for(var i=0; i<fields.length; i++)
                    $("#" + fields[i] + id).text(props[fields[i]]);

                return marker;
            }
        }
    ).addTo(aoi_feature_edit.map);

 }

setTimeout(initResponders, 5000);


function subscribeBrowser() {


    if (!('serviceWorker' in navigator)) {
      // Service Worker isn't supported on this browser, disable or hide UI.
      console.debug("no service workers")
      return;
    }

    if (!('PushManager' in window)) {
      // Push isn't supported on this browser, disable or hide UI.
      console.debug("no push manager");
      return;
    }
    requestPermission();
}

function requestPermission() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) {
      // Handling deprecated version with callback.
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  })
  .then(function(permissionResult) {
    if (permissionResult !== 'granted') {
      throw new Error('Permission not granted.');
    } else {
        subscribeUserToPush();
    }
  });
}

function subscribeUserToPush() {
  return navigator.serviceWorker.register('/static/core/js/service-worker.js')
  .then(function(registration) {
    var pubkey = new Uint8Array(0x04,0xe1,0xfc,0x9d,0x34,0x00,0xe6,0x26,0x61,0x97,0x6d,0xfe,0x34,0x2c,0xc6,0x1b,0xda,0x6b,0xbc,0xe6,0x79,0x04,0x4d,0x0c,0x25,0x70,0x56,0xf8,0x65,0x24,0x40,0x8b,0xd1,0x55,0x35,0x41,0xdf,0x62,0x71,0x99,0x7d,0x15,0xd6,0x3e,0xb3,0xd2,0xbe,0xeb,0x9d,0x3e,0xfe,0x6e,0x08,0xba,0x7f,0x68,0x39,0x7c,0xc3,0xe9,0x02,0x1e,0x5b,0xae,0xa3);
    var subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: pubkey
    };

    return registration.pushManager.subscribe(subscribeOptions);
  })
  .then(function(pushSubscription) {
    console.log('PushSubscription: ', JSON.stringify(pushSubscription));
    $.post("/geoq/subscribe",
            {
                subscription: JSON.stringify(pushSubscription)
            }
       );
    return pushSubscription;
  });
 }

// https://stackoverflow.com/a/21797381
 function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
