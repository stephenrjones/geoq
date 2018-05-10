'use strict';

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);

  var data = JSON.parse(event.data.text());

  var title = data.title;
  var body = data.body;
  var cell = data.cell;
  var icon = '/static/images/GeoQ-Logo.png';
  var tag = 'geoq';
  var options = { title: title, body: body, icon:icon, tag:tag, data: {id: cell}};
  let clickurl = "http://localhost:8000/geoq/workcells/work/"
  event.waitUntil(self.registration.showNotification(title, options));

//  event.waitUntil(
//    self.registration.showNotification(title, {
//      body: body,
//      icon: icon,
//      tag: tag
//    })
//  );
});


self.addEventListener('notificationclick', function(e) {

   if(e.notification.data) {
        var cell = e.notification.data.id;

        clients.openWindow('http://localhost:8000/geoq/workcells/work/' + cell);
    } else {
      clients.openWindow('http://localhost:8000/geoq');
  }
});

