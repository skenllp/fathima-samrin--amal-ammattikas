/* Central wedding configuration — edit names, times, venue and links here. */
(function () {
  var venueName = "CIAL Convention Centre";
  var venueArea = "Nedumbassery";
  var venueRegion = "Kerala";
  var q = encodeURIComponent(venueName + ", " + venueArea + ", " + venueRegion);

  window.weddingData = {
    couple: { bride: "Fathima Samrin", groom: "Amal Ammattikas" },

    // Countdown target: 24 Dec 2026, 5:00 PM India Standard Time (UTC+05:30)
    countdownTarget: "2026-12-24T17:00:00+05:30",

    venue: {
      name: venueName,
      area: venueArea,
      region: venueRegion,
      // Put the confirmed Google Maps links here when you have them:
      confirmedMapsUrl: "",
      confirmedDirectionsUrl: "",
      // Until then, properly-encoded Google Maps search / directions URLs are used:
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=" + q,
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=" + q
    },

    // Background music. It never plays until a guest taps Open Invitation or the speaker button.
    musicSrc: "assets/music.mp3"
  };
})();
