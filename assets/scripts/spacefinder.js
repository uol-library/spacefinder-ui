/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!*******************************************!*\
  !*** ./_includes/javascript/utilities.js ***!
  \*******************************************/
/**
 * Checks to see if localStorage is available
 * 
 * @param {string} type (localStorage or sessionStorage)
 * @returns {boolean}
 */
function storageAvailable(type) {
  var storage;

  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && ( // everything except Firefox
    e.code === 22 || // Firefox
    e.code === 1014 || // test name field too, because code might not be present
    // everything except Firefox
    e.name === 'QuotaExceededError' || // Firefox
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && // acknowledge QuotaExceededError only if there's something already stored
    storage && storage.length !== 0;
  }
}
/**
 * Sets a value in localStorage but adds expiry date
 * 
 * @param {string} key localStorage key
 * @param {string} value to set
 * @param {int} ttl Time to live (in hours)
 */


function setWithExpiry(key, value, ttl) {
  var now = new Date();
  var item = {
    value: value,
    expiry: now.getTime() + ttl * 60 * 60 * 1000
  };
  localStorage.setItem(key, JSON.stringify(item));
}
/**
 * Gets a value in localStorage but checks expiry date
 * first. If expired, localStorage key is removed and
 * null returned.
 * 
 * @param {string} key localStorage key
 */


function getWithExpiry(key) {
  var itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return null;
  }

  var item = JSON.parse(itemStr);
  var now = new Date();

  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}
/**
 * Uses the haversine formula to calculate the distance between 2 points on a
 * sphere given their longitudes and latitudes
 * 
 * @param {{lat: float, lng: float}} mk1 point one
 * @param {{lat: float, lng: float}} mk2 point 2
 * @returns {Float} distance between mk1 and mk2 in metres
 */


function haversine_distance(mk1, mk2) {
  var R = 6371071; // Radius of the Earth in metres

  var rlat1 = mk1.lat * (Math.PI / 180); // Convert degrees to radians

  var rlat2 = mk2.lat * (Math.PI / 180); // Convert degrees to radians

  var difflat = rlat2 - rlat1; // Radian difference (latitudes)

  var difflon = (mk2.lng - mk1.lng) * (Math.PI / 180); // Radian difference (longitudes)

  var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
  return Math.round(d);
}
/**
 * Gets a JSON data file from a remote URL. Utilises localstorage
 * to cache the results.
 * @param {Object} options Information about the JSON file
 * @param {String} options.key Unique key used to store the data in localstorage (required)
 * @param {String} options.url URL of the JSON file (required)
 * @param {Integer} options.expiry How long to cache the results (in hours) default: 24
 * @param {Boolean} options.debug Whether to display debugging information in the console
 * @param {Function} options.callback callback function with one parameter (JSON parsed response)
 */


function getJSON(options) {
  if (!options.hasOwnProperty('key') || !options.hasOwnProperty('url')) {
    return;
  }

  if (!options.hasOwnProperty('expires')) {
    options.expires = 24;
  }

  if (storageAvailable('localStorage') && getWithExpiry(options.key)) {
    if (options.debug) {
      console.log("getting data '" + options.key + "'from localstorage");
    }

    if (options.hasOwnProperty('callback') && typeof options.callback == 'function') {
      options.callback(JSON.parse(getWithExpiry(options.key)));
    }
  } else {
    console.log("getting data '" + options.key + "' from " + options.url);
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function () {
      if (storageAvailable('localStorage')) {
        var expires = new Date().getTime() + options.expiry * 60 * 60 * 1000;

        if (options.debug) {
          console.log("storing data '" + options.key + "' in localstorage - expires " + expires);
        }

        setWithExpiry(options.key, this.responseText, options.expiry);
      }

      if (options.hasOwnProperty('callback') && typeof options.callback == 'function') {
        options.callback(JSON.parse(this.responseText));
      }
    });
    oReq.open("GET", options.url);
    oReq.send();
  }
}
/* Not sure whether to use these */


function uol_show_loader(parent) {
  var c = document.createElement('div');
  c.setAttribute('id', 'uol_loader');
  var loadStr = "loading";

  for (var i = 1; i <= loadStr.length; i++) {
    var circle = document.createElement('span');
    circle.classList.add('circle');
    circle.classList.add('circle-' + i);
    circle.appendChild(document.createTextNode(loadStr[i - 1]));
    c.appendChild(circle);
  }

  parent.appendChild(c);
}

function uol_hide_loader() {
  var el = document.getElementById('uol_loader');
  if (el) el.remove();
}
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!******************************************!*\
  !*** ./_includes/javascript/lazyload.js ***!
  \******************************************/
/**
 * Lazy loads images (i.e. only retrieves them from their URLs when they are
 * in the viewport). Uses IntersectionObserver API if available, and falls
 * back to listening for scroll events and testing scrollTop/offsetTop.
 * 
 * @param {String} imageBaseURL Base URL of the folder containing all images 
 */
function lazyLoadSpaceImages(imageBaseURL) {
  var photosFolder = imageBaseURL;
  var lazyloadImages;

  if ("IntersectionObserver" in window) {
    lazyloadImages = document.querySelectorAll(".lazy");
    var imageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var image = entry.target;
          image.classList.remove('lazy');
          image.setAttribute('style', 'background-image:url(' + imageBaseURL + image.getAttribute('data-imgsrc') + ')');
          imageObserver.unobserve(image);
        }
      });
    });
    lazyloadImages.forEach(function (image) {
      imageObserver.observe(image);
    });
  } else {
    var lazyload = function lazyload() {
      if (lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
      }

      lazyloadThrottleTimeout = setTimeout(function () {
        var scrollTop = window.pageYOffset;
        lazyloadImages.forEach(function (img) {
          if (img.offsetTop < window.innerHeight + scrollTop) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            image.setAttribute('style', 'background-image:url(' + imageBaseURL + image.getAttribute('data-imgsrc') + ')');
          }
        });

        if (lazyloadImages.length == 0) {
          document.removeEventListener('scroll', lazyload);
          window.removeEventListener('resize', lazyload);
          window.removeEventListener('orientationChange', lazyload);
        }
      }, 20);
    };

    var lazyloadThrottleTimeout;
    lazyloadImages = document.querySelectorAll('.lazy');
    document.addEventListener('scroll', lazyload);
    window.addEventListener('resize', lazyload);
    window.addEventListener('orientationChange', lazyload);
  }
}
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!****************************************!*\
  !*** ./_includes/javascript/layout.js ***!
  \****************************************/
/* setup */
document.addEventListener('DOMContentLoaded', function () {
  /* event listener for nav buttons */
  document.querySelectorAll('#top-bar .button').forEach(function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      var isactive = el.classList.toggle('active');

      if (isactive) {
        document.querySelectorAll('#top-bar .button').forEach(function (other) {
          if (el != other) {
            other.classList.remove('active');
          }
        });
      }
      /* Dispatch a custom event (viewchange) with the name of the active view */


      document.getElementById('top-bar').dispatchEvent(new CustomEvent('viewchange', {
        bubbles: true,
        cancelable: true,
        composed: false,
        detail: {
          view: el.getAttribute('data-view'),
          active: isactive
        }
      }));
    });
  });
  document.getElementById('ss-close').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('list').classList.remove('single');
    document.getElementById('view-single').classList.remove('active');
  });
});
document.addEventListener('viewchange', function (event) {
  var views = ['filters', 'list', 'map'];
  var changedview = document.getElementById(event.detail.view);

  if (event.detail.view == 'single') {
    views.forEach(function (view) {
      document.getElementById(view).classList.remove('active');
    });
    document.getElementById('list').classList.add('active');

    if (event.detail.active) {
      document.getElementById('list').classList.add('single');
    } else {
      document.getElementById('list').classList.remove('single');
    }
  } else {
    views.forEach(function (view) {
      document.getElementById(view).classList.remove('active');
    });

    if (event.detail.active) {
      changedview.classList.add('active');
    } else {
      changedview.classList.remove('active');
    }
  }
});
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!*****************************************!*\
  !*** ./_includes/javascript/filters.js ***!
  \*****************************************/
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Functions for the filters panel in the UI
 */

/* event to listen for when filters change */
var filterEvent = new Event('viewfilter', {
  bubbles: true,
  cancelable: true,
  composed: false
});
/* gets the current status of all filters */

function getFilterStatus() {
  var filters = document.querySelectorAll('#filters input[type=checkbox]');
  var activeFilters = [];

  var _iterator = _createForOfIteratorHelper(filters),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var cbx = _step.value;

      if (cbx.checked) {
        var us = cbx.getAttribute('value').indexOf('_');
        var filterName = cbx.getAttribute('value').substring(0, us);
        var filterValue = cbx.getAttribute('value').substring(us + 1);
        var appended = false;

        if (activeFilters.length) {
          for (var i = 0; i < activeFilters.length; i++) {
            if (activeFilters[i].name == filterName && activeFilters[i].value.indexOf(filterValue) == -1) {
              activeFilters[i].value.push(filterValue);
              appended = true;
            }
          }
        }

        if (!appended) {
          activeFilters.push({
            name: filterName,
            value: [filterValue]
          });
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return activeFilters;
}
/* setup */


document.addEventListener('DOMContentLoaded', function () {
  /* event listener for filter changes */
  document.getElementById('filters').addEventListener('viewfilter', function (event) {
    console.log('viewfilter Event triggered');
    var activeFilters = getFilterStatus();

    if (activeFilters.length) {
      document.getElementById('clear-all').removeAttribute('disabled');
      console.log(activeFilters);
    } else {
      document.getElementById('clear-all').setAttribute('disabled', true);
      console.log('no filters currently active');
    }
  });
  /* add radio button behaviour to checkboxes with exclusive attribute */

  var filters = document.querySelectorAll('#filter input[type=checkbox]');

  var _iterator2 = _createForOfIteratorHelper(filters),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var cbx = _step2.value;
      cbx.addEventListener('change', function (eventElement) {
        var item = eventElement.target;

        if (item.matches('.exclusive')) {
          var itemStatus = item.checked;
          var sibs = item.closest('ul').querySelectorAll('input[type=checkbox].exclusive');

          var _iterator4 = _createForOfIteratorHelper(sibs),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var sib = _step4.value;
              sib.checked = false;
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }

          item.checked = itemStatus;
        }
        /* trigger the viewfilter event */


        item.dispatchEvent(filterEvent);
      });
    }
    /* clear all filters button */

  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  document.getElementById('clear-all').addEventListener('click', function (event) {
    event.preventDefault();
    var filters = document.querySelectorAll('#filters input[type=checkbox]');

    var _iterator3 = _createForOfIteratorHelper(filters),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var cbx = _step3.value;
        cbx.checked = false;
      }
      /* trigger the viewfilter event */

    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    event.target.dispatchEvent(filterEvent);
  });
});
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!**************************************!*\
  !*** ./_includes/javascript/list.js ***!
  \**************************************/
var spacesurl = 'https://uol-library.github.io/spacefinder-ui/spaces.json',
    imageBaseURL = 'https://uol-library.github.io/spacefinder-ui/assets/photos/',
    spaces,
    currentLoc = {
  'lat': 52.205575,
  'lng': 0.121682
},
    spaceProperties = {
  'atmosphere_disciplined': 'Disciplined',
  'atmosphere_relaxed': 'Relaxed',
  'atmosphere_historic': 'Historic',
  'atmosphere_modern': 'Modern',
  'atmosphere_inspiring': 'Inspiring',
  'atmosphere_cosy': 'Cosy',
  'atmosphere_social': 'Social',
  'atmosphere_friendly': 'Friendly',
  'noise_strictlysilent': 'Strictly silent',
  'noise_whispers': 'Whispers',
  'noise_backgroundchatter': 'Background chatter',
  'noise_animateddiscussion': 'Animated discussion',
  'noise_musicplaying': 'Music playing',
  'facility_food_drink': 'Food &amp; drink allowed',
  'facility_daylight': 'Natural daylight',
  'facility_views': 'Attractive views out of the window',
  'facility_large_desks': 'Large desks',
  'facility_free_wifi': 'Free Wifi',
  'facility_no_wifi': 'No WiFi',
  'facility_computers': 'Computers',
  'facility_laptops_allowed': 'Laptops allowed',
  'facility_sockets': 'Plug Sockets',
  'facility_signal': 'Phone signal',
  'facility_printers_copiers': 'Printers and copiers',
  'facility_whiteboards': 'Whiteboards',
  'facility_projector': 'Projector',
  'facility_outdoor_seating': 'Outdoor seating',
  'facility_bookable': 'Bookable',
  'facility_toilets': 'Toilets nearby',
  'facility_refreshments': 'Close to refreshments',
  'facility_break': 'Close to a place to take a break',
  'facility_wheelchair_accessible': 'Wheelchair accessible',
  'facility_blue_badge_parking': 'Parking for blue badge holders',
  'facility_accessible_toilets': 'Toilets accessible to disabled people',
  'acility_induction_loops': 'Induction loops',
  'facility_adjustable_furniture': 'Adjustable furniture',
  'facility_individual_study_space': 'Individual study spaces available',
  'facility_gender_neutral_toilets': 'Gender neutral toilets',
  'facility_bike_racks': 'Bike racks',
  'facility_smoking_area': 'Designated smoking area',
  'facility_baby_changing': 'Baby changing facilities',
  'facility_prayer_room': 'Prayer room'
};
/* setup */

document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('spacesloaded', function () {
    renderList();
    lazyLoadSpaceImages(imageBaseURL);
    updateDistances();
  });
  loadSpaces();
});
/**
 * Loads all space data from a single JSON file
 */

function loadSpaces() {
  getJSON({
    key: 'spaces',
    url: spacesurl,
    callback: function callback(data) {
      if (data.length) {
        spaces = data;
        console.log(spaces);
        spaces.forEach(function (space, index) {
          spaces[index].link = '#/space/' + space.id;
          spaces[index].classes = getClassList(space);
        });
        /* fire the spacesloaded event */

        document.getElementById('list').dispatchEvent(new Event('spacesloaded', {
          bubbles: true,
          cancelable: true,
          composed: false
        }));
      }
    }
  });
}
/**
 * Renders list view for spaces
 */


function renderList() {
  var listContainer = document.getElementById('listcontent');
  spaces.forEach(function (space) {
    spaceContainer = document.createElement('div');
    spaceContainer.setAttribute('data-id', space.id);
    spaceContainer.setAttribute('data-sortkey', space.name.replace(/[^0-9a-zA-Z]/g, '').toLowerCase());
    spaceContainer.setAttribute('class', 'list-space ' + space.classes);
    var spaceHTML = '<h2><a href="' + space.link + '">' + space.name + '</a></h2>';
    spaceHTML += '<h3><span class="space-type space-type-' + space.space_type.toLowerCase() + '">' + space.space_type + '</span>';
    spaceHTML += space.library ? '<span class="library">' + space.library + '</span>' : '';
    spaceHTML += '<span class="address">' + space.address + '</span></h3>';
    spaceHTML += '<div class="space-details">';

    if (space.images.length) {
      spaceHTML += '<div data-imgsrc="' + space.images[0] + '" class="space-image lazy"></div>';
    }

    spaceHTML += '<div><p class="description">' + space.description + '</p>';

    if (space.facilities.length) {
      space.facilities.forEach(function (f) {
        spaceHTML += '<span class="facility facility_' + f + '" title="' + spaceProperties['facility_' + f] + '>' + spaceProperties['facility_' + f] + '</span>';
      });
    }

    spaceHTML += '</div></div>';
    spaceContainer.innerHTML = spaceHTML;
    listContainer.append(spaceContainer);
  });
}
/**
 * Gets a list of classes for a space container to facilitate filtering
 * @param {Object} space Space data
 * @return {String} classList Space separated list of classnames
 */


function getClassList(space) {
  var classList = '';

  if (space.work.length) {
    classList += 'work_' + space.work.join(' work_') + ' ';
  }

  if (space.facilities.length) {
    classList += 'facility_' + space.facilities.join(' facility_') + ' ';
  }

  if (space.atmosphere.length) {
    classList += 'atmosphere_' + space.atmosphere.join(' atmosphere_') + ' ';
  }

  if (space.noise) {
    classList += 'noise_' + space.noise.replace(/\W/g, '').toLowerCase();
  }

  if (space.type) {
    classList += 'type_' + space.space - type.replace(/\W/g, '').toLowerCase();
  }

  return classList;
}

function updateDistances() {
  spaces.forEach(function (space, index) {
    spaces[index].distancefromcentre = haversine_distance(currentLoc, {
      lat: space.lat,
      lng: space.lng
    });
    document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-distance', spaces[index].distancefromcentre);
  });
}
/**
 * Lazy loads images (i.e. only retrieves them from their URLs when they are
 * in the viewport). Uses IntersectionObserver API if available, and falls
 * back to listening for scroll events and testing scrollTop/offsetTop.
 * 
 * @param {String} imageBaseURL Base URL of the folder containing all images 
 */


function lazyLoadSpaceImages(imageBaseURL) {
  var photosFolder = imageBaseURL;
  var lazyloadImages;

  if ("IntersectionObserver" in window) {
    lazyloadImages = document.querySelectorAll(".lazy");
    var imageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var image = entry.target;
          image.classList.remove('lazy');
          image.setAttribute('style', 'background-image:url(' + imageBaseURL + image.getAttribute('data-imgsrc') + ')');
          imageObserver.unobserve(image);
        }
      });
    });
    lazyloadImages.forEach(function (image) {
      imageObserver.observe(image);
    });
  } else {
    var lazyload = function lazyload() {
      if (lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
      }

      lazyloadThrottleTimeout = setTimeout(function () {
        var scrollTop = window.pageYOffset;
        lazyloadImages.forEach(function (img) {
          if (img.offsetTop < window.innerHeight + scrollTop) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            image.setAttribute('style', 'background-image:url(' + imageBaseURL + image.getAttribute('data-imgsrc') + ')');
          }
        });

        if (lazyloadImages.length == 0) {
          document.removeEventListener('scroll', lazyload);
          window.removeEventListener('resize', lazyload);
          window.removeEventListener('orientationChange', lazyload);
        }
      }, 20);
    };

    var lazyloadThrottleTimeout;
    lazyloadImages = document.querySelectorAll('.lazy');
    document.addEventListener('scroll', lazyload);
    window.addEventListener('resize', lazyload);
    window.addEventListener('orientationChange', lazyload);
  }
}
})();

// This entry need to be wrapped in an IIFE because it need to be isolated against other entry modules.
(() => {
/*!*************************************!*\
  !*** ./_includes/javascript/map.js ***!
  \*************************************/

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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eUIsbUJBQXpCLEVBQThDc0MsUUFBOUM7QUFDSDtBQUNKLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zcGFjZWZpbmRlci11aS8uL19pbmNsdWRlcy9qYXZhc2NyaXB0L3V0aWxpdGllcy5qcyIsIndlYnBhY2s6Ly9zcGFjZWZpbmRlci11aS8uL19pbmNsdWRlcy9qYXZhc2NyaXB0L2xhenlsb2FkLmpzIiwid2VicGFjazovL3NwYWNlZmluZGVyLXVpLy4vX2luY2x1ZGVzL2phdmFzY3JpcHQvbGF5b3V0LmpzIiwid2VicGFjazovL3NwYWNlZmluZGVyLXVpLy4vX2luY2x1ZGVzL2phdmFzY3JpcHQvZmlsdGVycy5qcyIsIndlYnBhY2s6Ly9zcGFjZWZpbmRlci11aS8uL19pbmNsdWRlcy9qYXZhc2NyaXB0L2xpc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGxvY2FsU3RvcmFnZSBpcyBhdmFpbGFibGVcbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgKGxvY2FsU3RvcmFnZSBvciBzZXNzaW9uU3RvcmFnZSlcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBzdG9yYWdlQXZhaWxhYmxlKHR5cGUpIHtcbiAgICB2YXIgc3RvcmFnZTtcbiAgICB0cnkge1xuICAgICAgICBzdG9yYWdlID0gd2luZG93W3R5cGVdO1xuICAgICAgICB2YXIgeCA9ICdfX3N0b3JhZ2VfdGVzdF9fJztcbiAgICAgICAgc3RvcmFnZS5zZXRJdGVtKHgsIHgpO1xuICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oeCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlIGluc3RhbmNlb2YgRE9NRXhjZXB0aW9uICYmIChcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZXhjZXB0IEZpcmVmb3hcbiAgICAgICAgICAgIGUuY29kZSA9PT0gMjIgfHxcbiAgICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgICAgIGUuY29kZSA9PT0gMTAxNCB8fFxuICAgICAgICAgICAgLy8gdGVzdCBuYW1lIGZpZWxkIHRvbywgYmVjYXVzZSBjb2RlIG1pZ2h0IG5vdCBiZSBwcmVzZW50XG4gICAgICAgICAgICAvLyBldmVyeXRoaW5nIGV4Y2VwdCBGaXJlZm94XG4gICAgICAgICAgICBlLm5hbWUgPT09ICdRdW90YUV4Y2VlZGVkRXJyb3InIHx8XG4gICAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgICBlLm5hbWUgPT09ICdOU19FUlJPUl9ET01fUVVPVEFfUkVBQ0hFRCcpICYmXG4gICAgICAgICAgICAvLyBhY2tub3dsZWRnZSBRdW90YUV4Y2VlZGVkRXJyb3Igb25seSBpZiB0aGVyZSdzIHNvbWV0aGluZyBhbHJlYWR5IHN0b3JlZFxuICAgICAgICAgICAgKHN0b3JhZ2UgJiYgc3RvcmFnZS5sZW5ndGggIT09IDApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBTZXRzIGEgdmFsdWUgaW4gbG9jYWxTdG9yYWdlIGJ1dCBhZGRzIGV4cGlyeSBkYXRlXG4gKiBcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgbG9jYWxTdG9yYWdlIGtleVxuICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIHRvIHNldFxuICogQHBhcmFtIHtpbnR9IHR0bCBUaW1lIHRvIGxpdmUgKGluIGhvdXJzKVxuICovXG5mdW5jdGlvbiBzZXRXaXRoRXhwaXJ5KGtleSwgdmFsdWUsIHR0bCkge1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICBjb25zdCBpdGVtID0ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGV4cGlyeTogbm93LmdldFRpbWUoKSArICh0dGwqNjAqNjAqMTAwMCksXG4gICAgfVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkoaXRlbSkpXG59XG5cbi8qKlxuICogR2V0cyBhIHZhbHVlIGluIGxvY2FsU3RvcmFnZSBidXQgY2hlY2tzIGV4cGlyeSBkYXRlXG4gKiBmaXJzdC4gSWYgZXhwaXJlZCwgbG9jYWxTdG9yYWdlIGtleSBpcyByZW1vdmVkIGFuZFxuICogbnVsbCByZXR1cm5lZC5cbiAqIFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBsb2NhbFN0b3JhZ2Uga2V5XG4gKi9cbmZ1bmN0aW9uIGdldFdpdGhFeHBpcnkoa2V5KSB7XG4gICAgY29uc3QgaXRlbVN0ciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSlcbiAgICBpZiAoIWl0ZW1TdHIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGl0ZW0gPSBKU09OLnBhcnNlKGl0ZW1TdHIpXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKVxuICAgIGlmIChub3cuZ2V0VGltZSgpID4gaXRlbS5leHBpcnkpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gaXRlbS52YWx1ZTtcbn1cblxuLyoqXG4gKiBVc2VzIHRoZSBoYXZlcnNpbmUgZm9ybXVsYSB0byBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGJldHdlZW4gMiBwb2ludHMgb24gYVxuICogc3BoZXJlIGdpdmVuIHRoZWlyIGxvbmdpdHVkZXMgYW5kIGxhdGl0dWRlc1xuICogXG4gKiBAcGFyYW0ge3tsYXQ6IGZsb2F0LCBsbmc6IGZsb2F0fX0gbWsxIHBvaW50IG9uZVxuICogQHBhcmFtIHt7bGF0OiBmbG9hdCwgbG5nOiBmbG9hdH19IG1rMiBwb2ludCAyXG4gKiBAcmV0dXJucyB7RmxvYXR9IGRpc3RhbmNlIGJldHdlZW4gbWsxIGFuZCBtazIgaW4gbWV0cmVzXG4gKi9cbmZ1bmN0aW9uIGhhdmVyc2luZV9kaXN0YW5jZShtazEsIG1rMikge1xuICAgIHZhciBSID0gNjM3MTA3MTsgLy8gUmFkaXVzIG9mIHRoZSBFYXJ0aCBpbiBtZXRyZXNcbiAgICB2YXIgcmxhdDEgPSBtazEubGF0ICogKE1hdGguUEkvMTgwKTsgLy8gQ29udmVydCBkZWdyZWVzIHRvIHJhZGlhbnNcbiAgICB2YXIgcmxhdDIgPSBtazIubGF0ICogKE1hdGguUEkvMTgwKTsgLy8gQ29udmVydCBkZWdyZWVzIHRvIHJhZGlhbnNcbiAgICB2YXIgZGlmZmxhdCA9IHJsYXQyLXJsYXQxOyAvLyBSYWRpYW4gZGlmZmVyZW5jZSAobGF0aXR1ZGVzKVxuICAgIHZhciBkaWZmbG9uID0gKG1rMi5sbmctbWsxLmxuZykgKiAoTWF0aC5QSS8xODApOyAvLyBSYWRpYW4gZGlmZmVyZW5jZSAobG9uZ2l0dWRlcylcbiAgICB2YXIgZCA9IDIgKiBSICogTWF0aC5hc2luKE1hdGguc3FydChNYXRoLnNpbihkaWZmbGF0LzIpKk1hdGguc2luKGRpZmZsYXQvMikrTWF0aC5jb3MocmxhdDEpKk1hdGguY29zKHJsYXQyKSpNYXRoLnNpbihkaWZmbG9uLzIpKk1hdGguc2luKGRpZmZsb24vMikpKTtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChkKTtcbn1cblxuLyoqXG4gKiBHZXRzIGEgSlNPTiBkYXRhIGZpbGUgZnJvbSBhIHJlbW90ZSBVUkwuIFV0aWxpc2VzIGxvY2Fsc3RvcmFnZVxuICogdG8gY2FjaGUgdGhlIHJlc3VsdHMuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBJbmZvcm1hdGlvbiBhYm91dCB0aGUgSlNPTiBmaWxlXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5rZXkgVW5pcXVlIGtleSB1c2VkIHRvIHN0b3JlIHRoZSBkYXRhIGluIGxvY2Fsc3RvcmFnZSAocmVxdWlyZWQpXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy51cmwgVVJMIG9mIHRoZSBKU09OIGZpbGUgKHJlcXVpcmVkKVxuICogQHBhcmFtIHtJbnRlZ2VyfSBvcHRpb25zLmV4cGlyeSBIb3cgbG9uZyB0byBjYWNoZSB0aGUgcmVzdWx0cyAoaW4gaG91cnMpIGRlZmF1bHQ6IDI0XG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuZGVidWcgV2hldGhlciB0byBkaXNwbGF5IGRlYnVnZ2luZyBpbmZvcm1hdGlvbiBpbiB0aGUgY29uc29sZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5jYWxsYmFjayBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIG9uZSBwYXJhbWV0ZXIgKEpTT04gcGFyc2VkIHJlc3BvbnNlKVxuICovXG5mdW5jdGlvbiBnZXRKU09OKG9wdGlvbnMpIHtcbiAgICBpZiAoICEgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2tleScgKSB8fCAhIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICd1cmwnICkgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCAhIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdleHBpcmVzJyApICkge1xuICAgICAgICBvcHRpb25zLmV4cGlyZXMgPSAyNDtcbiAgICB9XG4gICAgaWYgKCBzdG9yYWdlQXZhaWxhYmxlKCdsb2NhbFN0b3JhZ2UnKSAmJiBnZXRXaXRoRXhwaXJ5KG9wdGlvbnMua2V5KSApIHtcbiAgICAgICAgaWYgKCBvcHRpb25zLmRlYnVnICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJnZXR0aW5nIGRhdGEgJ1wiK29wdGlvbnMua2V5K1wiJ2Zyb20gbG9jYWxzdG9yYWdlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICggb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2NhbGxiYWNrJyApICYmIHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrKCBKU09OLnBhcnNlKCBnZXRXaXRoRXhwaXJ5KCBvcHRpb25zLmtleSApICkgKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0dGluZyBkYXRhICdcIitvcHRpb25zLmtleStcIicgZnJvbSBcIitvcHRpb25zLnVybCk7XG4gICAgICAgIHZhciBvUmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIG9SZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmICggc3RvcmFnZUF2YWlsYWJsZSgnbG9jYWxTdG9yYWdlJykgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIChvcHRpb25zLmV4cGlyeSo2MCo2MCoxMDAwKTtcbiAgICAgICAgICAgICAgICBpZiAoIG9wdGlvbnMuZGVidWcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3RvcmluZyBkYXRhICdcIitvcHRpb25zLmtleStcIicgaW4gbG9jYWxzdG9yYWdlIC0gZXhwaXJlcyBcIitleHBpcmVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0V2l0aEV4cGlyeShvcHRpb25zLmtleSwgdGhpcy5yZXNwb25zZVRleHQsIG9wdGlvbnMuZXhwaXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2NhbGxiYWNrJyApICYmIHR5cGVvZiBvcHRpb25zLmNhbGxiYWNrID09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jYWxsYmFjayggSlNPTi5wYXJzZSggdGhpcy5yZXNwb25zZVRleHQgKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb1JlcS5vcGVuKFwiR0VUXCIsIG9wdGlvbnMudXJsKTtcbiAgICAgICAgb1JlcS5zZW5kKCk7XG4gICAgfVxufVxuXG4vKiBOb3Qgc3VyZSB3aGV0aGVyIHRvIHVzZSB0aGVzZSAqL1xuZnVuY3Rpb24gdW9sX3Nob3dfbG9hZGVyKCBwYXJlbnQgKSB7XG4gICAgdmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgIGMuc2V0QXR0cmlidXRlKCAnaWQnLCAndW9sX2xvYWRlcicgKTtcbiAgICB2YXIgbG9hZFN0ciA9IFwibG9hZGluZ1wiXG4gICAgZm9yICggdmFyIGkgPSAxOyBpIDw9IGxvYWRTdHIubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHZhciBjaXJjbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3BhbicgKTtcbiAgICAgICAgY2lyY2xlLmNsYXNzTGlzdC5hZGQoICdjaXJjbGUnICk7XG4gICAgICAgIGNpcmNsZS5jbGFzc0xpc3QuYWRkKCAnY2lyY2xlLScraSApO1xuICAgICAgICBjaXJjbGUuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxvYWRTdHJbKGktMSldKSApO1xuICAgICAgICBjLmFwcGVuZENoaWxkKGNpcmNsZSk7XG4gICAgfVxuICAgIHBhcmVudC5hcHBlbmRDaGlsZCggYyApO1xufVxuZnVuY3Rpb24gdW9sX2hpZGVfbG9hZGVyKCkge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAndW9sX2xvYWRlcicgKTtcbiAgICBpZiAoIGVsICkgZWwucmVtb3ZlKCk7XG59XG4iLCIvKipcbiAqIExhenkgbG9hZHMgaW1hZ2VzIChpLmUuIG9ubHkgcmV0cmlldmVzIHRoZW0gZnJvbSB0aGVpciBVUkxzIHdoZW4gdGhleSBhcmVcbiAqIGluIHRoZSB2aWV3cG9ydCkuIFVzZXMgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgQVBJIGlmIGF2YWlsYWJsZSwgYW5kIGZhbGxzXG4gKiBiYWNrIHRvIGxpc3RlbmluZyBmb3Igc2Nyb2xsIGV2ZW50cyBhbmQgdGVzdGluZyBzY3JvbGxUb3Avb2Zmc2V0VG9wLlxuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gaW1hZ2VCYXNlVVJMIEJhc2UgVVJMIG9mIHRoZSBmb2xkZXIgY29udGFpbmluZyBhbGwgaW1hZ2VzIFxuICovXG5mdW5jdGlvbiBsYXp5TG9hZFNwYWNlSW1hZ2VzKCBpbWFnZUJhc2VVUkwgKSB7XG4gICAgdmFyIHBob3Rvc0ZvbGRlciA9IGltYWdlQmFzZVVSTDtcbiAgICB2YXIgbGF6eWxvYWRJbWFnZXM7XG5cbiAgICBpZiAoIFwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXJcIiBpbiB3aW5kb3cgKSB7XG4gICAgICAgIGxhenlsb2FkSW1hZ2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggXCIubGF6eVwiICk7XG4gICAgICAgIHZhciBpbWFnZU9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKCBmdW5jdGlvbiggZW50cmllcywgb2JzZXJ2ZXIgKSB7XG4gICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goIGZ1bmN0aW9uKCBlbnRyeSApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGVudHJ5LmlzSW50ZXJzZWN0aW5nICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBlbnRyeS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlLmNsYXNzTGlzdC5yZW1vdmUoICdsYXp5JyApO1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2JhY2tncm91bmQtaW1hZ2U6dXJsKCcgKyBpbWFnZUJhc2VVUkwgKyBpbWFnZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1nc3JjJykgKyAnKScpO1xuICAgICAgICAgICAgICAgICAgICBpbWFnZU9ic2VydmVyLnVub2JzZXJ2ZSggaW1hZ2UgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF6eWxvYWRJbWFnZXMuZm9yRWFjaCggZnVuY3Rpb24oIGltYWdlICkge1xuICAgICAgICAgICAgaW1hZ2VPYnNlcnZlci5vYnNlcnZlKCBpbWFnZSApO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgeyAgXG4gICAgICAgIHZhciBsYXp5bG9hZFRocm90dGxlVGltZW91dDtcbiAgICAgICAgbGF6eWxvYWRJbWFnZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnLmxhenknICk7XG5cbiAgICAgICAgZnVuY3Rpb24gbGF6eWxvYWQoKSB7XG4gICAgICAgICAgICBpZiAoIGxhenlsb2FkVGhyb3R0bGVUaW1lb3V0ICkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggbGF6eWxvYWRUaHJvdHRsZVRpbWVvdXQpIDtcbiAgICAgICAgICAgIH0gICAgXG5cbiAgICAgICAgICAgIGxhenlsb2FkVGhyb3R0bGVUaW1lb3V0ID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICAgICAgICAgICAgICBsYXp5bG9hZEltYWdlcy5mb3JFYWNoKCBmdW5jdGlvbiggaW1nICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIGltZy5vZmZzZXRUb3AgPCAoIHdpbmRvdy5pbm5lckhlaWdodCArIHNjcm9sbFRvcCApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9IGltZy5kYXRhc2V0LnNyYztcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZy5jbGFzc0xpc3QucmVtb3ZlKCAnbGF6eScgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSggJ3N0eWxlJywgJ2JhY2tncm91bmQtaW1hZ2U6dXJsKCcgKyBpbWFnZUJhc2VVUkwgKyBpbWFnZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW1nc3JjJykgKyAnKScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCBsYXp5bG9hZEltYWdlcy5sZW5ndGggPT0gMCApIHsgXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdzY3JvbGwnLCBsYXp5bG9hZCApO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIGxhenlsb2FkICk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnb3JpZW50YXRpb25DaGFuZ2UnLCBsYXp5bG9hZCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDIwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdzY3JvbGwnLCBsYXp5bG9hZCApO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIGxhenlsb2FkICk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnb3JpZW50YXRpb25DaGFuZ2UnLCBsYXp5bG9hZCApO1xuICAgIH1cbn1cbiIsIi8qIHNldHVwICovXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAgIC8qIGV2ZW50IGxpc3RlbmVyIGZvciBuYXYgYnV0dG9ucyAqL1xuXHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjdG9wLWJhciAuYnV0dG9uJykuZm9yRWFjaCggZWwgPT4ge1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGV0IGlzYWN0aXZlID0gZWwuY2xhc3NMaXN0LnRvZ2dsZSggJ2FjdGl2ZScgKTtcbiAgICAgICAgICAgIGlmICggaXNhY3RpdmUgKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI3RvcC1iYXIgLmJ1dHRvbicpLmZvckVhY2goIG90aGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlbCAhPSBvdGhlciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBEaXNwYXRjaCBhIGN1c3RvbSBldmVudCAodmlld2NoYW5nZSkgd2l0aCB0aGUgbmFtZSBvZiB0aGUgYWN0aXZlIHZpZXcgKi9cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b3AtYmFyJykuZGlzcGF0Y2hFdmVudCggbmV3IEN1c3RvbUV2ZW50KCAndmlld2NoYW5nZScsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29tcG9zZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgICAgICB2aWV3OiBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdmlldycpLFxuICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IGlzYWN0aXZlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApICk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3MtY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuY2xhc3NMaXN0LnJlbW92ZSgnc2luZ2xlJyk7XG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZpZXctc2luZ2xlJykuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdH0pO1xufSk7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAndmlld2NoYW5nZScsIGV2ZW50ID0+IHtcblx0bGV0IHZpZXdzID0gWydmaWx0ZXJzJywnbGlzdCcsJ21hcCddO1xuXHRsZXQgY2hhbmdlZHZpZXcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggZXZlbnQuZGV0YWlsLnZpZXcgKTtcblx0aWYgKCBldmVudC5kZXRhaWwudmlldyA9PSAnc2luZ2xlJyApIHtcblx0XHR2aWV3cy5mb3JFYWNoKHZpZXcgPT4ge1xuXHRcdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIHZpZXcgKS5jbGFzc0xpc3QucmVtb3ZlKCAnYWN0aXZlJyApO1xuXHRcdH0pO1xuXHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuY2xhc3NMaXN0LmFkZCggJ2FjdGl2ZScgKTtcblx0XHRpZiAoIGV2ZW50LmRldGFpbC5hY3RpdmUgKSB7XG5cdFx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGlzdCcpLmNsYXNzTGlzdC5hZGQoICdzaW5nbGUnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaXN0JykuY2xhc3NMaXN0LnJlbW92ZSggJ3NpbmdsZScgKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dmlld3MuZm9yRWFjaCh2aWV3ID0+IHtcblx0XHRcdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCB2aWV3ICkuY2xhc3NMaXN0LnJlbW92ZSggJ2FjdGl2ZScgKTtcblx0XHR9KTtcblx0XHRpZiAoIGV2ZW50LmRldGFpbC5hY3RpdmUgKSB7XG5cdFx0XHRjaGFuZ2Vkdmlldy5jbGFzc0xpc3QuYWRkKCAnYWN0aXZlJyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjaGFuZ2Vkdmlldy5jbGFzc0xpc3QucmVtb3ZlKCAnYWN0aXZlJyApO1xuXHRcdH1cblx0fVxufSk7XG4iLCIvKipcbiAqIEZ1bmN0aW9ucyBmb3IgdGhlIGZpbHRlcnMgcGFuZWwgaW4gdGhlIFVJXG4gKi9cblxuLyogZXZlbnQgdG8gbGlzdGVuIGZvciB3aGVuIGZpbHRlcnMgY2hhbmdlICovXG5jb25zdCBmaWx0ZXJFdmVudCA9IG5ldyBFdmVudCgndmlld2ZpbHRlcicsIHtcbiAgICBidWJibGVzOiB0cnVlLFxuICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgY29tcG9zZWQ6IGZhbHNlLFxufSk7XG5cbi8qIGdldHMgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIGFsbCBmaWx0ZXJzICovXG5mdW5jdGlvbiBnZXRGaWx0ZXJTdGF0dXMoKSB7XG4gICAgY29uc3QgZmlsdGVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNmaWx0ZXJzIGlucHV0W3R5cGU9Y2hlY2tib3hdJyk7XG4gICAgY29uc3QgYWN0aXZlRmlsdGVycyA9IFtdO1xuICAgIGZvciAoY29uc3QgY2J4IG9mIGZpbHRlcnMpIHtcbiAgICAgICAgaWYgKGNieC5jaGVja2VkKSB7XG4gICAgICAgICAgICBsZXQgdXMgPSBjYnguZ2V0QXR0cmlidXRlKCd2YWx1ZScpLmluZGV4T2YoJ18nKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlck5hbWUgPSBjYnguZ2V0QXR0cmlidXRlKCd2YWx1ZScpLnN1YnN0cmluZyggMCwgdXMgKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlclZhbHVlID0gY2J4LmdldEF0dHJpYnV0ZSgndmFsdWUnKS5zdWJzdHJpbmcoIHVzICsgMSApO1xuICAgICAgICAgICAgbGV0IGFwcGVuZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIGFjdGl2ZUZpbHRlcnMubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFjdGl2ZUZpbHRlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggYWN0aXZlRmlsdGVyc1tpXS5uYW1lID09IGZpbHRlck5hbWUgJiYgYWN0aXZlRmlsdGVyc1tpXS52YWx1ZS5pbmRleE9mKGZpbHRlclZhbHVlKSA9PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZUZpbHRlcnNbaV0udmFsdWUucHVzaChmaWx0ZXJWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBlbmRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoICEgYXBwZW5kZWQgKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlRmlsdGVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZmlsdGVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFtmaWx0ZXJWYWx1ZV1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWN0aXZlRmlsdGVycztcbn1cblxuLyogc2V0dXAgKi9cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gICAgLyogZXZlbnQgbGlzdGVuZXIgZm9yIGZpbHRlciBjaGFuZ2VzICovXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpbHRlcnMnKS5hZGRFdmVudExpc3RlbmVyKCd2aWV3ZmlsdGVyJywgZXZlbnQgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygndmlld2ZpbHRlciBFdmVudCB0cmlnZ2VyZWQnKTtcbiAgICAgICAgY29uc3QgYWN0aXZlRmlsdGVycyA9IGdldEZpbHRlclN0YXR1cygpO1xuICAgICAgICBpZiAoIGFjdGl2ZUZpbHRlcnMubGVuZ3RoICkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsZWFyLWFsbCcpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGFjdGl2ZUZpbHRlcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NsZWFyLWFsbCcpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBmaWx0ZXJzIGN1cnJlbnRseSBhY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyogYWRkIHJhZGlvIGJ1dHRvbiBiZWhhdmlvdXIgdG8gY2hlY2tib3hlcyB3aXRoIGV4Y2x1c2l2ZSBhdHRyaWJ1dGUgKi9cbiAgICBjb25zdCBmaWx0ZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2ZpbHRlciBpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xuICAgIGZvciAoY29uc3QgY2J4IG9mIGZpbHRlcnMpIHtcbiAgICAgICAgY2J4LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGV2ZW50RWxlbWVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gZXZlbnRFbGVtZW50LnRhcmdldDtcbiAgICAgICAgICAgIGlmIChpdGVtLm1hdGNoZXMoJy5leGNsdXNpdmUnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1TdGF0dXMgPSBpdGVtLmNoZWNrZWQ7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2licyA9IGl0ZW0uY2xvc2VzdCgndWwnKS5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPWNoZWNrYm94XS5leGNsdXNpdmUnKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHNpYiBvZiBzaWJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpYi5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGl0ZW0uY2hlY2tlZCA9IGl0ZW1TdGF0dXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiB0cmlnZ2VyIHRoZSB2aWV3ZmlsdGVyIGV2ZW50ICovXG4gICAgICAgICAgICBpdGVtLmRpc3BhdGNoRXZlbnQoZmlsdGVyRXZlbnQpO1xuICAgICAgICB9KVxuICAgIH1cbiAgICAvKiBjbGVhciBhbGwgZmlsdGVycyBidXR0b24gKi9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXItYWxsJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGZpbHRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZmlsdGVycyBpbnB1dFt0eXBlPWNoZWNrYm94XScpO1xuICAgICAgICBmb3IgKGNvbnN0IGNieCBvZiBmaWx0ZXJzKSB7XG4gICAgICAgICAgICBjYnguY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8qIHRyaWdnZXIgdGhlIHZpZXdmaWx0ZXIgZXZlbnQgKi9cbiAgICAgICAgZXZlbnQudGFyZ2V0LmRpc3BhdGNoRXZlbnQoZmlsdGVyRXZlbnQpO1xuICAgIH0pO1xufSk7XG5cbiIsInZhciBzcGFjZXN1cmwgPSAnaHR0cHM6Ly91b2wtbGlicmFyeS5naXRodWIuaW8vc3BhY2VmaW5kZXItdWkvc3BhY2VzLmpzb24nLFxuICAgIGltYWdlQmFzZVVSTCA9ICdodHRwczovL3VvbC1saWJyYXJ5LmdpdGh1Yi5pby9zcGFjZWZpbmRlci11aS9hc3NldHMvcGhvdG9zLycsXG4gICAgc3BhY2VzLFxuICAgIGN1cnJlbnRMb2MgPSB7J2xhdCc6IDUyLjIwNTU3NSwgJ2xuZyc6IDAuMTIxNjgyfSxcbiAgICBzcGFjZVByb3BlcnRpZXMgPSB7XG4gICAgICAgICdhdG1vc3BoZXJlX2Rpc2NpcGxpbmVkJzogJ0Rpc2NpcGxpbmVkJyxcbiAgICAgICAgJ2F0bW9zcGhlcmVfcmVsYXhlZCc6ICdSZWxheGVkJyxcbiAgICAgICAgJ2F0bW9zcGhlcmVfaGlzdG9yaWMnOiAnSGlzdG9yaWMnLFxuICAgICAgICAnYXRtb3NwaGVyZV9tb2Rlcm4nOiAnTW9kZXJuJyxcbiAgICAgICAgJ2F0bW9zcGhlcmVfaW5zcGlyaW5nJzogJ0luc3BpcmluZycsXG4gICAgICAgICdhdG1vc3BoZXJlX2Nvc3knOiAnQ29zeScsXG4gICAgICAgICdhdG1vc3BoZXJlX3NvY2lhbCc6ICdTb2NpYWwnLFxuICAgICAgICAnYXRtb3NwaGVyZV9mcmllbmRseSc6ICdGcmllbmRseScsXG4gICAgICAgICdub2lzZV9zdHJpY3RseXNpbGVudCc6ICdTdHJpY3RseSBzaWxlbnQnLFxuICAgICAgICAnbm9pc2Vfd2hpc3BlcnMnOiAnV2hpc3BlcnMnLFxuICAgICAgICAnbm9pc2VfYmFja2dyb3VuZGNoYXR0ZXInOiAnQmFja2dyb3VuZCBjaGF0dGVyJyxcbiAgICAgICAgJ25vaXNlX2FuaW1hdGVkZGlzY3Vzc2lvbic6ICdBbmltYXRlZCBkaXNjdXNzaW9uJyxcbiAgICAgICAgJ25vaXNlX211c2ljcGxheWluZyc6ICdNdXNpYyBwbGF5aW5nJyxcbiAgICAgICAgJ2ZhY2lsaXR5X2Zvb2RfZHJpbmsnOiAnRm9vZCAmYW1wOyBkcmluayBhbGxvd2VkJyxcbiAgICAgICAgJ2ZhY2lsaXR5X2RheWxpZ2h0JzogJ05hdHVyYWwgZGF5bGlnaHQnLFxuICAgICAgICAnZmFjaWxpdHlfdmlld3MnOiAnQXR0cmFjdGl2ZSB2aWV3cyBvdXQgb2YgdGhlIHdpbmRvdycsXG4gICAgICAgICdmYWNpbGl0eV9sYXJnZV9kZXNrcyc6ICdMYXJnZSBkZXNrcycsXG4gICAgICAgICdmYWNpbGl0eV9mcmVlX3dpZmknOiAnRnJlZSBXaWZpJyxcbiAgICAgICAgJ2ZhY2lsaXR5X25vX3dpZmknOiAnTm8gV2lGaScsXG4gICAgICAgICdmYWNpbGl0eV9jb21wdXRlcnMnOiAnQ29tcHV0ZXJzJyxcbiAgICAgICAgJ2ZhY2lsaXR5X2xhcHRvcHNfYWxsb3dlZCc6ICdMYXB0b3BzIGFsbG93ZWQnLFxuICAgICAgICAnZmFjaWxpdHlfc29ja2V0cyc6ICdQbHVnIFNvY2tldHMnLFxuICAgICAgICAnZmFjaWxpdHlfc2lnbmFsJzogJ1Bob25lIHNpZ25hbCcsXG4gICAgICAgICdmYWNpbGl0eV9wcmludGVyc19jb3BpZXJzJzogJ1ByaW50ZXJzIGFuZCBjb3BpZXJzJyxcbiAgICAgICAgJ2ZhY2lsaXR5X3doaXRlYm9hcmRzJzogJ1doaXRlYm9hcmRzJyxcbiAgICAgICAgJ2ZhY2lsaXR5X3Byb2plY3Rvcic6ICdQcm9qZWN0b3InLFxuICAgICAgICAnZmFjaWxpdHlfb3V0ZG9vcl9zZWF0aW5nJzogJ091dGRvb3Igc2VhdGluZycsXG4gICAgICAgICdmYWNpbGl0eV9ib29rYWJsZSc6ICdCb29rYWJsZScsXG4gICAgICAgICdmYWNpbGl0eV90b2lsZXRzJzogJ1RvaWxldHMgbmVhcmJ5JyxcbiAgICAgICAgJ2ZhY2lsaXR5X3JlZnJlc2htZW50cyc6ICdDbG9zZSB0byByZWZyZXNobWVudHMnLFxuICAgICAgICAnZmFjaWxpdHlfYnJlYWsnOiAnQ2xvc2UgdG8gYSBwbGFjZSB0byB0YWtlIGEgYnJlYWsnLFxuICAgICAgICAnZmFjaWxpdHlfd2hlZWxjaGFpcl9hY2Nlc3NpYmxlJzogJ1doZWVsY2hhaXIgYWNjZXNzaWJsZScsXG4gICAgICAgICdmYWNpbGl0eV9ibHVlX2JhZGdlX3BhcmtpbmcnOiAnUGFya2luZyBmb3IgYmx1ZSBiYWRnZSBob2xkZXJzJyxcbiAgICAgICAgJ2ZhY2lsaXR5X2FjY2Vzc2libGVfdG9pbGV0cyc6ICdUb2lsZXRzIGFjY2Vzc2libGUgdG8gZGlzYWJsZWQgcGVvcGxlJyxcbiAgICAgICAgJ2FjaWxpdHlfaW5kdWN0aW9uX2xvb3BzJzogJ0luZHVjdGlvbiBsb29wcycsXG4gICAgICAgICdmYWNpbGl0eV9hZGp1c3RhYmxlX2Z1cm5pdHVyZSc6ICdBZGp1c3RhYmxlIGZ1cm5pdHVyZScsXG4gICAgICAgICdmYWNpbGl0eV9pbmRpdmlkdWFsX3N0dWR5X3NwYWNlJzogJ0luZGl2aWR1YWwgc3R1ZHkgc3BhY2VzIGF2YWlsYWJsZScsXG4gICAgICAgICdmYWNpbGl0eV9nZW5kZXJfbmV1dHJhbF90b2lsZXRzJzogJ0dlbmRlciBuZXV0cmFsIHRvaWxldHMnLFxuICAgICAgICAnZmFjaWxpdHlfYmlrZV9yYWNrcyc6ICdCaWtlIHJhY2tzJyxcbiAgICAgICAgJ2ZhY2lsaXR5X3Ntb2tpbmdfYXJlYSc6ICdEZXNpZ25hdGVkIHNtb2tpbmcgYXJlYScsXG4gICAgICAgICdmYWNpbGl0eV9iYWJ5X2NoYW5naW5nJzogJ0JhYnkgY2hhbmdpbmcgZmFjaWxpdGllcycsXG4gICAgICAgICdmYWNpbGl0eV9wcmF5ZXJfcm9vbSc6ICdQcmF5ZXIgcm9vbSdcbiAgICB9O1xuXG4vKiBzZXR1cCAqL1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzcGFjZXNsb2FkZWQnLCAoKSA9PiB7XG4gICAgICAgIHJlbmRlckxpc3QoKTtcbiAgICAgICAgbGF6eUxvYWRTcGFjZUltYWdlcyggaW1hZ2VCYXNlVVJMICk7XG4gICAgICAgIHVwZGF0ZURpc3RhbmNlcygpO1xuICAgIH0pO1xuICAgIGxvYWRTcGFjZXMoKTtcbn0pO1xuXG4vKipcbiAqIExvYWRzIGFsbCBzcGFjZSBkYXRhIGZyb20gYSBzaW5nbGUgSlNPTiBmaWxlXG4gKi9cbmZ1bmN0aW9uIGxvYWRTcGFjZXMoKSB7XG4gICAgZ2V0SlNPTiggeyBrZXk6ICdzcGFjZXMnLCB1cmw6IHNwYWNlc3VybCwgY2FsbGJhY2s6IGRhdGEgPT4ge1xuICAgICAgICBpZiAoIGRhdGEubGVuZ3RoICkge1xuICAgICAgICAgICAgc3BhY2VzID0gZGF0YTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNwYWNlcyk7XG4gICAgICAgICAgICBzcGFjZXMuZm9yRWFjaCggKHNwYWNlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIHNwYWNlc1tpbmRleF0ubGluayA9ICcjL3NwYWNlLycgKyBzcGFjZS5pZDtcbiAgICAgICAgICAgICAgICBzcGFjZXNbaW5kZXhdLmNsYXNzZXMgPSBnZXRDbGFzc0xpc3QoIHNwYWNlICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGZpcmUgdGhlIHNwYWNlc2xvYWRlZCBldmVudCAqL1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3QnKS5kaXNwYXRjaEV2ZW50KCBuZXcgRXZlbnQoICdzcGFjZXNsb2FkZWQnLCB7XG4gICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbXBvc2VkOiBmYWxzZSxcbiAgICAgICAgICAgIH0gKSApO1xuICAgICAgICB9XG4gICAgfSB9ICk7XG59XG5cbi8qKlxuICogUmVuZGVycyBsaXN0IHZpZXcgZm9yIHNwYWNlc1xuICovXG5mdW5jdGlvbiByZW5kZXJMaXN0KCkge1xuICAgIGxldCBsaXN0Q29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xpc3Rjb250ZW50Jyk7XG4gICAgc3BhY2VzLmZvckVhY2goIHNwYWNlID0+IHtcbiAgICAgICAgc3BhY2VDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgc3BhY2VDb250YWluZXIuc2V0QXR0cmlidXRlKCdkYXRhLWlkJywgc3BhY2UuaWQgKTtcbiAgICAgICAgc3BhY2VDb250YWluZXIuc2V0QXR0cmlidXRlKCdkYXRhLXNvcnRrZXknLCBzcGFjZS5uYW1lLnJlcGxhY2UoIC9bXjAtOWEtekEtWl0vZywgJycpLnRvTG93ZXJDYXNlKCkgKTtcbiAgICAgICAgc3BhY2VDb250YWluZXIuc2V0QXR0cmlidXRlKCdjbGFzcycsICdsaXN0LXNwYWNlICcgKyBzcGFjZS5jbGFzc2VzICk7XG4gICAgICAgIGxldCBzcGFjZUhUTUwgPSAnPGgyPjxhIGhyZWY9XCInICsgc3BhY2UubGluayArICdcIj4nICsgc3BhY2UubmFtZSArICc8L2E+PC9oMj4nO1xuICAgICAgICBzcGFjZUhUTUwgKz0gJzxoMz48c3BhbiBjbGFzcz1cInNwYWNlLXR5cGUgc3BhY2UtdHlwZS0nICsgc3BhY2Uuc3BhY2VfdHlwZS50b0xvd2VyQ2FzZSgpICsgJ1wiPicgKyBzcGFjZS5zcGFjZV90eXBlICsgJzwvc3Bhbj4nO1xuICAgICAgICBzcGFjZUhUTUwgKz0gc3BhY2UubGlicmFyeT8gJzxzcGFuIGNsYXNzPVwibGlicmFyeVwiPicgKyBzcGFjZS5saWJyYXJ5ICsgJzwvc3Bhbj4nOiAnJztcbiAgICAgICAgc3BhY2VIVE1MICs9ICc8c3BhbiBjbGFzcz1cImFkZHJlc3NcIj4nICsgc3BhY2UuYWRkcmVzcyArICc8L3NwYW4+PC9oMz4nO1xuICAgICAgICBzcGFjZUhUTUwgKz0gJzxkaXYgY2xhc3M9XCJzcGFjZS1kZXRhaWxzXCI+JztcbiAgICAgICAgaWYgKCBzcGFjZS5pbWFnZXMubGVuZ3RoICkge1xuICAgICAgICAgICAgc3BhY2VIVE1MICs9ICc8ZGl2IGRhdGEtaW1nc3JjPVwiJyArIHNwYWNlLmltYWdlc1swXSArICdcIiBjbGFzcz1cInNwYWNlLWltYWdlIGxhenlcIj48L2Rpdj4nO1xuICAgICAgICB9XG4gICAgICAgIHNwYWNlSFRNTCArPSAnPGRpdj48cCBjbGFzcz1cImRlc2NyaXB0aW9uXCI+JyArIHNwYWNlLmRlc2NyaXB0aW9uICsgJzwvcD4nO1xuICAgICAgICBpZiAoIHNwYWNlLmZhY2lsaXRpZXMubGVuZ3RoICkge1xuICAgICAgICAgICAgc3BhY2UuZmFjaWxpdGllcy5mb3JFYWNoKCBmID0+IHtcbiAgICAgICAgICAgICAgICBzcGFjZUhUTUwgKz0gJzxzcGFuIGNsYXNzPVwiZmFjaWxpdHkgZmFjaWxpdHlfJyArIGYgKyAnXCIgdGl0bGU9XCInICsgc3BhY2VQcm9wZXJ0aWVzWyAnZmFjaWxpdHlfJyArIGYgXSArICc+JyArIHNwYWNlUHJvcGVydGllc1sgJ2ZhY2lsaXR5XycgKyBmIF0gKyAnPC9zcGFuPic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzcGFjZUhUTUwgKz0gJzwvZGl2PjwvZGl2Pic7XG4gICAgICAgIHNwYWNlQ29udGFpbmVyLmlubmVySFRNTCA9IHNwYWNlSFRNTDtcbiAgICAgICAgbGlzdENvbnRhaW5lci5hcHBlbmQoIHNwYWNlQ29udGFpbmVyICk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogR2V0cyBhIGxpc3Qgb2YgY2xhc3NlcyBmb3IgYSBzcGFjZSBjb250YWluZXIgdG8gZmFjaWxpdGF0ZSBmaWx0ZXJpbmdcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcGFjZSBTcGFjZSBkYXRhXG4gKiBAcmV0dXJuIHtTdHJpbmd9IGNsYXNzTGlzdCBTcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzc25hbWVzXG4gKi9cbmZ1bmN0aW9uIGdldENsYXNzTGlzdCggc3BhY2UgKSB7XG4gICAgdmFyIGNsYXNzTGlzdCA9ICcnO1xuICAgIGlmIChzcGFjZS53b3JrLmxlbmd0aCl7XG4gICAgICAgIGNsYXNzTGlzdCArPSAnd29ya18nK3NwYWNlLndvcmsuam9pbignIHdvcmtfJykrJyAnO1xuICAgIH1cbiAgICBpZiAoc3BhY2UuZmFjaWxpdGllcy5sZW5ndGgpe1xuICAgICAgICBjbGFzc0xpc3QgKz0gJ2ZhY2lsaXR5Xycrc3BhY2UuZmFjaWxpdGllcy5qb2luKCcgZmFjaWxpdHlfJykrJyAnO1xuICAgIH1cbiAgICBpZiAoc3BhY2UuYXRtb3NwaGVyZS5sZW5ndGgpe1xuICAgICAgICBjbGFzc0xpc3QgKz0gJ2F0bW9zcGhlcmVfJytzcGFjZS5hdG1vc3BoZXJlLmpvaW4oJyBhdG1vc3BoZXJlXycpKycgJztcbiAgICB9XG4gICAgaWYgKHNwYWNlLm5vaXNlKSB7XG4gICAgICAgIGNsYXNzTGlzdCArPSAnbm9pc2VfJytzcGFjZS5ub2lzZS5yZXBsYWNlKC9cXFcvZywgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIGlmIChzcGFjZS50eXBlKSB7XG4gICAgICAgIGNsYXNzTGlzdCArPSAndHlwZV8nK3NwYWNlLnNwYWNlLXR5cGUucmVwbGFjZSgvXFxXL2csICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gY2xhc3NMaXN0O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVEaXN0YW5jZXMoKSB7XG4gICAgc3BhY2VzLmZvckVhY2goIChzcGFjZSwgaW5kZXgpID0+IHtcbiAgICAgICAgc3BhY2VzW2luZGV4XS5kaXN0YW5jZWZyb21jZW50cmUgPSBoYXZlcnNpbmVfZGlzdGFuY2UoIGN1cnJlbnRMb2MsIHsgbGF0OiBzcGFjZS5sYXQsIGxuZzogc3BhY2UubG5nIH0gKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtaWQ9XCInICsgc3BhY2UuaWQgKyAnXCJdJykuc2V0QXR0cmlidXRlKCdkYXRhLWRpc3RhbmNlJywgc3BhY2VzW2luZGV4XS5kaXN0YW5jZWZyb21jZW50cmUgKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBMYXp5IGxvYWRzIGltYWdlcyAoaS5lLiBvbmx5IHJldHJpZXZlcyB0aGVtIGZyb20gdGhlaXIgVVJMcyB3aGVuIHRoZXkgYXJlXG4gKiBpbiB0aGUgdmlld3BvcnQpLiBVc2VzIEludGVyc2VjdGlvbk9ic2VydmVyIEFQSSBpZiBhdmFpbGFibGUsIGFuZCBmYWxsc1xuICogYmFjayB0byBsaXN0ZW5pbmcgZm9yIHNjcm9sbCBldmVudHMgYW5kIHRlc3Rpbmcgc2Nyb2xsVG9wL29mZnNldFRvcC5cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IGltYWdlQmFzZVVSTCBCYXNlIFVSTCBvZiB0aGUgZm9sZGVyIGNvbnRhaW5pbmcgYWxsIGltYWdlcyBcbiAqL1xuIGZ1bmN0aW9uIGxhenlMb2FkU3BhY2VJbWFnZXMoIGltYWdlQmFzZVVSTCApIHtcbiAgICB2YXIgcGhvdG9zRm9sZGVyID0gaW1hZ2VCYXNlVVJMO1xuICAgIHZhciBsYXp5bG9hZEltYWdlcztcblxuICAgIGlmICggXCJJbnRlcnNlY3Rpb25PYnNlcnZlclwiIGluIHdpbmRvdyApIHtcbiAgICAgICAgbGF6eWxvYWRJbWFnZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBcIi5sYXp5XCIgKTtcbiAgICAgICAgdmFyIGltYWdlT2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoIGZ1bmN0aW9uKCBlbnRyaWVzLCBvYnNlcnZlciApIHtcbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaCggZnVuY3Rpb24oIGVudHJ5ICkge1xuICAgICAgICAgICAgICAgIGlmICggZW50cnkuaXNJbnRlcnNlY3RpbmcgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IGVudHJ5LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSggJ2xhenknICk7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIGltYWdlQmFzZVVSTCArIGltYWdlLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWdzcmMnKSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlT2JzZXJ2ZXIudW5vYnNlcnZlKCBpbWFnZSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXp5bG9hZEltYWdlcy5mb3JFYWNoKCBmdW5jdGlvbiggaW1hZ2UgKSB7XG4gICAgICAgICAgICBpbWFnZU9ic2VydmVyLm9ic2VydmUoIGltYWdlICk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7ICBcbiAgICAgICAgdmFyIGxhenlsb2FkVGhyb3R0bGVUaW1lb3V0O1xuICAgICAgICBsYXp5bG9hZEltYWdlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoICcubGF6eScgKTtcblxuICAgICAgICBmdW5jdGlvbiBsYXp5bG9hZCgpIHtcbiAgICAgICAgICAgIGlmICggbGF6eWxvYWRUaHJvdHRsZVRpbWVvdXQgKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCBsYXp5bG9hZFRocm90dGxlVGltZW91dCkgO1xuICAgICAgICAgICAgfSAgICBcblxuICAgICAgICAgICAgbGF6eWxvYWRUaHJvdHRsZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgICAgICAgICAgICAgIGxhenlsb2FkSW1hZ2VzLmZvckVhY2goIGZ1bmN0aW9uKCBpbWcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggaW1nLm9mZnNldFRvcCA8ICggd2luZG93LmlubmVySGVpZ2h0ICsgc2Nyb2xsVG9wICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gaW1nLmRhdGFzZXQuc3JjO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nLmNsYXNzTGlzdC5yZW1vdmUoICdsYXp5JyApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlKCAnc3R5bGUnLCAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIGltYWdlQmFzZVVSTCArIGltYWdlLmdldEF0dHJpYnV0ZSgnZGF0YS1pbWdzcmMnKSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIGxhenlsb2FkSW1hZ2VzLmxlbmd0aCA9PSAwICkgeyBcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIGxhenlsb2FkICk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgbGF6eWxvYWQgKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdvcmllbnRhdGlvbkNoYW5nZScsIGxhenlsb2FkICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMjApO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIGxhenlsb2FkICk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgbGF6eWxvYWQgKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdvcmllbnRhdGlvbkNoYW5nZScsIGxhenlsb2FkICk7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbInN0b3JhZ2VBdmFpbGFibGUiLCJ0eXBlIiwic3RvcmFnZSIsIndpbmRvdyIsIngiLCJzZXRJdGVtIiwicmVtb3ZlSXRlbSIsImUiLCJET01FeGNlcHRpb24iLCJjb2RlIiwibmFtZSIsImxlbmd0aCIsInNldFdpdGhFeHBpcnkiLCJrZXkiLCJ2YWx1ZSIsInR0bCIsIm5vdyIsIkRhdGUiLCJpdGVtIiwiZXhwaXJ5IiwiZ2V0VGltZSIsImxvY2FsU3RvcmFnZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZXRXaXRoRXhwaXJ5IiwiaXRlbVN0ciIsImdldEl0ZW0iLCJwYXJzZSIsImhhdmVyc2luZV9kaXN0YW5jZSIsIm1rMSIsIm1rMiIsIlIiLCJybGF0MSIsImxhdCIsIk1hdGgiLCJQSSIsInJsYXQyIiwiZGlmZmxhdCIsImRpZmZsb24iLCJsbmciLCJkIiwiYXNpbiIsInNxcnQiLCJzaW4iLCJjb3MiLCJyb3VuZCIsImdldEpTT04iLCJvcHRpb25zIiwiaGFzT3duUHJvcGVydHkiLCJleHBpcmVzIiwiZGVidWciLCJjb25zb2xlIiwibG9nIiwiY2FsbGJhY2siLCJ1cmwiLCJvUmVxIiwiWE1MSHR0cFJlcXVlc3QiLCJhZGRFdmVudExpc3RlbmVyIiwicmVzcG9uc2VUZXh0Iiwib3BlbiIsInNlbmQiLCJ1b2xfc2hvd19sb2FkZXIiLCJwYXJlbnQiLCJjIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwibG9hZFN0ciIsImkiLCJjaXJjbGUiLCJjbGFzc0xpc3QiLCJhZGQiLCJhcHBlbmRDaGlsZCIsImNyZWF0ZVRleHROb2RlIiwidW9sX2hpZGVfbG9hZGVyIiwiZWwiLCJnZXRFbGVtZW50QnlJZCIsInJlbW92ZSIsImxhenlMb2FkU3BhY2VJbWFnZXMiLCJpbWFnZUJhc2VVUkwiLCJwaG90b3NGb2xkZXIiLCJsYXp5bG9hZEltYWdlcyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJpbWFnZU9ic2VydmVyIiwiSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCJlbnRyaWVzIiwib2JzZXJ2ZXIiLCJmb3JFYWNoIiwiZW50cnkiLCJpc0ludGVyc2VjdGluZyIsImltYWdlIiwidGFyZ2V0IiwiZ2V0QXR0cmlidXRlIiwidW5vYnNlcnZlIiwib2JzZXJ2ZSIsImxhenlsb2FkIiwibGF6eWxvYWRUaHJvdHRsZVRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwic2Nyb2xsVG9wIiwicGFnZVlPZmZzZXQiLCJpbWciLCJvZmZzZXRUb3AiLCJpbm5lckhlaWdodCIsInNyYyIsImRhdGFzZXQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImlzYWN0aXZlIiwidG9nZ2xlIiwib3RoZXIiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImNvbXBvc2VkIiwiZGV0YWlsIiwidmlldyIsImFjdGl2ZSIsInZpZXdzIiwiY2hhbmdlZHZpZXciLCJmaWx0ZXJFdmVudCIsIkV2ZW50IiwiZ2V0RmlsdGVyU3RhdHVzIiwiZmlsdGVycyIsImFjdGl2ZUZpbHRlcnMiLCJjYngiLCJjaGVja2VkIiwidXMiLCJpbmRleE9mIiwiZmlsdGVyTmFtZSIsInN1YnN0cmluZyIsImZpbHRlclZhbHVlIiwiYXBwZW5kZWQiLCJwdXNoIiwicmVtb3ZlQXR0cmlidXRlIiwiZXZlbnRFbGVtZW50IiwibWF0Y2hlcyIsIml0ZW1TdGF0dXMiLCJzaWJzIiwiY2xvc2VzdCIsInNpYiIsInNwYWNlc3VybCIsInNwYWNlcyIsImN1cnJlbnRMb2MiLCJzcGFjZVByb3BlcnRpZXMiLCJyZW5kZXJMaXN0IiwidXBkYXRlRGlzdGFuY2VzIiwibG9hZFNwYWNlcyIsImRhdGEiLCJzcGFjZSIsImluZGV4IiwibGluayIsImlkIiwiY2xhc3NlcyIsImdldENsYXNzTGlzdCIsImxpc3RDb250YWluZXIiLCJzcGFjZUNvbnRhaW5lciIsInJlcGxhY2UiLCJ0b0xvd2VyQ2FzZSIsInNwYWNlSFRNTCIsInNwYWNlX3R5cGUiLCJsaWJyYXJ5IiwiYWRkcmVzcyIsImltYWdlcyIsImRlc2NyaXB0aW9uIiwiZmFjaWxpdGllcyIsImYiLCJpbm5lckhUTUwiLCJhcHBlbmQiLCJ3b3JrIiwiam9pbiIsImF0bW9zcGhlcmUiLCJub2lzZSIsImRpc3RhbmNlZnJvbWNlbnRyZSIsInF1ZXJ5U2VsZWN0b3IiXSwic291cmNlUm9vdCI6IiJ9