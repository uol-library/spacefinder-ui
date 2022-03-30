var map,
    jquery = jQuery,
    $list = $('#list'),
    $map = $('#map'),
    openPoints = [],
    loc = {'lat': 52.205575, 'lng': 0.121682},
    userLoc = {'lat': 0, 'lng': 0}, //52.2050683,0.1077597
    getLocation = false,
    centerOnLocation = false,
    points = [],
    listScroll = 0,
    currView = 'small',
    currWidth = 0,
    loginWindow,
    currentZoom = 16,
    currentLoc = loc,
    systemEvent = false,
    loadSpacesInProgress = false,
    spacesRequest = null,
    totalSpaceCount = 0,
    queryLimit = 35,
    lastQuery = '',
    exclude = {
        'exclusions': [],
        'total': 0
    },
    mapOptions = {
        center: loc,
        zoom: 20,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    },
    oldView = undefined,
    currViewHash = undefined,
    inactiveColor = 'rgba(0,0,0,1)',
    activeColor = '#D6083B',
    initialView = 'map',
    cancelGeoLocation = false,
    view = '',
    mapViewed = false;
    
var markerSymbol = {
    path: 'M0-30.5c-5.7,0-10.2,4.6-10.2,10.2C-10.2-14.6,0,0,0,0s10.2-14.6,10.2-20.2C10.2-25.9,5.7-30.5,0-30.5z M0-17.7c-1.6,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S1.6-17.7,0-17.7z',
    fillColor: inactiveColor,
    fillOpacity: 1,
    scale: 1,
    strokeWeight: 0
};

var multiMarkerSymbol = {
    path: 'M0-28.5c-5.7,0-10.2,4.6-10.2,10.2C-10.2-12.6,0,0,0,0s10.2-12.6,10.2-18.2C10.2-23.9,5.7-28.5,0-28.5z M5.2-17.8h-4v4h-2.4v-4h-4v-2.4h4v-4h2.4v4h4V-17.8z',
    fillColor: inactiveColor,
    fillOpacity: 1,
    scale: 1,
    strokeWeight: 0
};
$().ready(function () {
    resetViews();

    $(window).on('initialLoadComplete', function (event) {
        event.preventDefault();
        $('.loading-cover .message').html('finalising');
        if ($('.loading-cover').length > 0 && !!$('html').hasClass('flexbox')) {
            $('.loading-cover').addClass('loaded');
            window.setTimeout(function () {
                $('.loading-cover').remove();
            }, 500);
        } else {
            $('.loading-cover').html("<p>It appears you are using an outdated browser. If possible switch to a newer one as some things may not look as they should or are missing. To continue into the app please click below</p><p><a href=\"#\" id=\"old-continue\">Continue</a></p>")
            $('#old-continue').on('click', function (event) {
                event.preventDefault();
                $('.loading-cover').addClass('loaded').fadeOut(300, function () {
                    $(this).remove();
                });
            });
        }
    });

    $('#search-btn').on('click touchstart', function (event) {
        if (currView == 'large') {
            event.preventDefault();
            console.log('search clicked');
            if ($(this).hasClass('active')) {
                $('#search').hide(0);
                $(this).removeClass('active')
            } else {
                $('#search').show(0);
                $(this).addClass('active')
            }
            $(window).resize();
            $('div[id^=space-]').css({
                'left': $list.offset().left,
                'width': $list.width()
            });
            systemEvent = true;
            google.maps.event.trigger(map, 'resize')
        }
    });

    var startView = initialView;

    $('.current-status').html('templates');
    loadTemplates({
        data: templates,
        callback: function () {
            $('.current-status').html('spaces');
            loadSpaces({
                //location:loc,
                callback: function () {
                    //$('.current-status').html('switch view');
                    switchView(startView);
                }
            });
        }
    })
    moment.locale('en', {
        relativeTime: {
            future: "in %s",
            past: "%s",
            s: "seconds",
            m: "a minute",
            mm: "%d m",
            h: "an hour",
            hh: "%d h",
            d: "a day",
            dd: "%d d",
            M: "a month",
            MM: "%d m",
            y: "a year",
            yy: "%d y"
        }
    });

    $(window).on('resize orientationchange', resize);

    $(window).trigger('resize');


});
function resize(event) {
    systemEvent = true;
    event.preventDefault();
    currWidth = $(window).width();
    $('div[id^=space-]').width($list.width()).css('left', $list.offset().left);
    if (currWidth < 1000 && currView !== 'small') {
        resizeForMobile();
        $(window).trigger('layout');
    } else if (currWidth > 1000 && currView !== 'large') {
        resizeForDesktop();
        $(window).trigger('layout');
    }
    if (map !== undefined && openPoints.length == 0) {

        if (!!centerOnLocation) {
            map.setCenter(userLoc);
        } else {
            map.setCenter(loc);
        }

    }
    $list.find('.list-meta').width($list.width());
}
function resizeForMobile() {
    currView = 'small';
    $('body').removeClass('large_view')
    $('#top-bar').find('a[href!="#/search"]').show(0);
    $('#search-btn').removeClass('active');
    $('div[id^=space-]').css({
        'left': 0,
        'top': 0,
        'width': '100%'
    });
}
function resizeForDesktop() {
    currView = 'large';
    $('body').addClass('large_view')
    $('#top-bar').find('> a[href!="#/search"]').hide(0);
    $('#map').show(0);
    $('#search-btn').addClass('active');
    $('#search').show();
    $('div[id^=space-]').css({
        'left': $list.offset().left,
        'top': 0,
        'width': $list.width()
    });
}

function switchView(newView, modal) {

    if (oldView == '/list') {
        listScroll = Number($(window).scrollTop());
    }
    if (newView == undefined) newView = initialView;
    closeSpaces();
    if (currView == 'small') $('.view-container').css('position', '');
    if (newView.indexOf('/') == -1 && $('#' + newView).length > 0) {
        if (currView == 'small') {

            $('.view-container').css({'z-index': '0', 'max-height': '90%', 'overflow': 'hidden'});
            $('a:not(#near-me-btn)').removeClass('active');
            $('a[href="#/' + newView + '"]').addClass('active');
            $('.current-status').html('initial view');
            $('#' + newView).css({'z-index': '1', 'max-height': '', 'overflow': 'auto'}).fadeIn({
                duration: 300,
                start: function () {

                    if (newView == 'map') {
                        systemEvent = true;
                        google.maps.event.trigger(map, 'resize');
                        $(window).scrollTop(0);

                    }
                    if (!mapViewed) {
                        mapViewed == true;
                        systemEvent = true;
                        if (!!centerOnLocation) {
                            map.setCenter(userLoc);
                        } else {
                            map.setCenter(loc);
                        }

                    }
                },
                progress: function () {
                    if (newView == 'list') {
                        systemEvent = true;
                        $(window).scrollTop(listScroll);
                    }
                    if (newView == 'map') {
                        if (openPoints.length > 0) {
                            systemEvent = true;
                            new google.maps.event.trigger(points[openPoints[0]].marker, 'click');
                            systemEvent = true;
                        }
                    }
                }
            });
        }
    } else {

        if (newView.indexOf('space') !== -1) {
            if (currView == 'small') $('.view-container').css('position', 'fixed');
            var parts = newView.split('/');
            loadSpace({
                'id': parts[1],
                'name': parts[2].replace('-', ' ')
            })
        }
    }
}


function loadSpace(options) {
    var defaults = {},
        space;
    $.extend(defaults, options);
    //see if we've already have it loaded
    space = findMarkers(points, {'id': defaults.id}).spaces;


    if (space.length == 1) {
        //we've got the space so show it
        showSpace(space[0]);
    }

}

function showSpace(data) {
    var space = $('<div />')
        .css({'margin-top': $(window).height()})
        .attr('id', 'space-' + data.id)
        .addClass('space-container')
        .append(parseTemplate('spaceDetail', data))
        .insertAfter('#list')

    if (currView == 'large') {
        space.width($list.width()).css('left', $list.offset().left);
        space.animate({'margin-top': $('#top-bar').outerHeight(true)}, 300);
    } else {
        space.animate({'margin-top': 0}, 300, function () {
            space.find('.title').css('position', 'fixed');
            space.css('overflow', 'auto');
        });
    }
}

function closeSpaces() {
    var spaces = $('div[id^=space-]');
    spaces.css('overflow', 'hidden').find('.title').removeAttr('style');
    $('div[id^=space-]').animate({'margin-top': $(window).height()}, 300, function () {
        $(this).remove();
        if (currView == 'large') $('#list').css('display', 'block');
    });

    if (openPoints.length > 0) {
        for (var i = 0; i < openPoints.length; i++) {
            if (points[openPoints[i]].mapSummary !== undefined) points[openPoints[i]].mapSummary.close();
            //points[openPoints[i]].marker.icon.fillColor = markerColor(points[openPoints[i]].space_type);
            points[openPoints[i]].marker.setZIndex(0);
            points[openPoints[i]].marker.setMap(map);
            openPoints.splice(i, 1);
        }
        for (var i = 0; i < points.length; i++) {
            points[i].marker.setOptions({'opacity': 1});
            points[i].marker.icon.fillColor = markerColor(points[i].space_type);
            points[i].marker.setMap(map);
        }
    }
    if (currView == 'large') {
        systemEvent = true;
        map.setZoom(currentZoom);
        systemEvent = true;
        map.setCenter(currentLoc);
    }

}

function resetViews() {
    systemEvent = true;
    mapOptions.center = currentLoc;
    mapOptions.zoom = currentZoom;
    $map.empty();
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    for (var i = 0; i < points.length; i++) {
        points[i].marker.setMap(null);
    }

    $('#list').html('');

    google.maps.event.addListener(map, 'center_changed', function (e) {
        if (!systemEvent && $('div[id^=space-]').length == 0) {
            console.log('non system event fired - center');
            var newCenter = map.getCenter();
            currentLoc.lat = newCenter.lat();
            currentLoc.lng = newCenter.lng();
        }

        setTimeout(function () {
            systemEvent = false;
        }, 300);
    });
    google.maps.event.addListener(map, 'bounds_changed', function () {

        if (!systemEvent && $('div[id^=space-]').length == 0 && $('.infoBubble:visible').length == 0) {
            console.log('non system event fired - bounds');
        }
        setTimeout(function () {
            systemEvent = false;
        }, 300);

    });
}


function loadSpaces() {
    loadSpacesInProgress = true;
    getJSON({key:'spaces',url:baseurl+'/spaces.json'}, function(data){
        points = data;
        $.each(points, function (key, value) {
            points[key].link = '#/space/' + points[key].id;
            points[key].distanceFromCentre = haversine_distance(currentLoc, {lat:points[key].lat,lng:points[key].lng});
            points[key].classes = get_class_list(points[key]);
        });
        loadSearch();
        loadMap();
        loadList({callback: lazyLoadSpaceImages});
    });
    loadSpacesInProgress = false;
}
function get_class_list(space) {
    var classList = '';
    if (space.work.length){
        classList += 'work_'+space.work.join(' work_')+' ';
    }
    if (space.facilities.length){
        classList += 'facility_'+space.facilities.join(' facility_')+' ';
    }
    if (space.atmosphere.length){
        classList += 'atmosphere_'+space.atmosphere.join(' atmosphere_')+' ';
    }
    if (space.noise) {
        classList += 'noise_'+space.noise.replace(/\W/g, '').toLowerCase();
    }
    if (space.type) {
        classList += 'type_'+space.space-type.replace(/\W/g, '').toLowerCase();
    }
    return classList;
}
function loadSearch() {
    getJSON({key:'filters',path:'/filters.json'}, function(data) {
        $('#search').append(parseTemplate('search', data));
    });
}
function cleanData(data) {
    var foundIds = [],
        ret = [],
        allIds = [];
    console.log('clean data', data.sort(sortNumber), data.length);
    for (var i = 0; i < data.length; i++) {
        allIds.push(data[i].id);
        if (foundIds.indexOf(data[i].id) == -1) {
            ret.push(data[i]);
            foundIds.push(data[i].id);
        }
    }
    console.log('all ids', allIds.sort(sortNumber), allIds.length);
    console.log('cleaned data', ret.length);
    return ret;
}

function sortNumber(a, b) {
    return a - b;
}

function checkMarker(data, checks) {
    var match = true;
    $.each(checks, function (key, val) {
        if (data[key] != val) {
            match = false;
            return false;
        }
    });
    return match;
}
function findMarkers(data, checks) {
    var ret = {spaces: []};
    $.each(data, function (key) {
        if (checkMarker(data[key], checks)) {
            data[key]._jsid = key;
            ret.spaces.push(data[key]);
        }
    });
    if (ret.spaces.length > 1) {
        ret.lat = ret.spaces[0].lat;
        ret.lng = ret.spaces[0].lng;

        for (var i = 0; i < ret.spaces.length; i++) {
            if (ret.spaces[i].library !== "") {
                ret['group_name'] = ret.spaces[i].library;
                break;
            }
        }

        if (ret['group_name'] == null) {
            ret['group_name'] = String(ret.spaces[0].address).substring(0, String(ret.spaces[0].address).indexOf(','));
        }

        ret.spaces[0].group_name = ret['group_name'];

    }

    return ret
}
/*---------- map --------------*/
function loadMap(options) {
    $('.current-status').html('map');
    var defaults = {
        inactiveColor: inactiveColor,
        activeColor: activeColor
    };
    $.extend(defaults, options);


    $.each(points, function (key) {
        if (points[key].marker !== undefined) return true;
        //console.log('add new point', points[key]);
        if (points[key].lat == null || points[key].lng == null) {
            return true;
        }

        if ($.type(points[key].lat) == 'string') {
            points[key].lat = Number(points[key].lat);
        }
        if ($.type(points[key].lng) == 'string') {
            points[key].lng = Number(points[key].lng);
        }
        var markers = findMarkers(points, {'lat': points[key].lat, 'lng': points[key].lng}),
            isMultiMarker = markers.spaces.length > 1 ? true : false;

        var marker = new google.maps.Marker({
            position: {'lat': Number(points[key].lat), 'lng': Number(points[key].lng)},
            icon: (isMultiMarker ? multiMarkerSymbol : markerSymbol),
            //animation: google.maps.Animation.DROP
        });

        marker.icon.fillColor = markerColor(points[key].space_type);

        for (var i = 0; i < markers.spaces.length; i++) {
            points[markers.spaces[i]._jsid].marker = marker;
        }
        points[key].marker = marker;
        var contentString;

        if (isMultiMarker) {
            points[key].spaces = markers.spaces;
            points[key].template = 'mapMulti';
            contentString = parseTemplate('mapMulti', points[key]);
        } else {
            points[key].template = 'mapSingle';
            contentString = parseTemplate('mapSingle', points[key]);
        }

        var infowindow = new InfoBubble({
            content: contentString,
            shadowStyle: 0,
            padding: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: 0,
            arrowSize: 10,
            borderWidth: 0,
            padding: 12,
            disableAutoPan: false,
            hideCloseButton: false,
            backgroundClassName: 'map-info-bubble',
            disableAnimation: true,
            arrowStyle: 0
        });
        points[key].mapSummary = infowindow;

        marker.setMap(map);

        google.maps.event.addListener(marker, 'click', function () {
            systemEvent = true;
            if (openPoints.length > 0) {
                for (var i = 0; i < openPoints.length; i++) {
                    points[openPoints[i]].mapSummary.close();
                    points[openPoints[i]].marker.icon.fillColor = markerColor(points[openPoints[i]].space_type);
                    points[openPoints[i]].marker.setZIndex(0);
                    points[openPoints[i]].marker.setMap(map);
                    openPoints.splice(i, 1);
                }
            }
            if ($('#bubble-' + points[key].id).length == 0) {
                setTimeout(function () {
                    systemEvent = true;
                    var parent = $('#bubble-' + points[key].id).parent();
                    $('#bubble-' + points[key].id).remove();
                    parent.parents('.infoBubble').css('width', $('#map').width() * 0.8);
                    points[key].mapSummary.open();
                    $(parent).append(parseTemplate(points[key].template, points[key]));
                    parent.parents('.infoBubble').css('width', $('#map').width() * 0.8);
                }, 100);
            } else {
                var parent = $('#bubble-' + points[key].id).parent();
                parent.parents('.infoBubble').css('width', $('#map').width() * 0.8);
            }
            infowindow.open(map, marker);
            this.setZIndex(100);
            this.setMap(map);
            openPoints.push(key);
        });
        google.maps.event.addListener(infowindow, 'closeclick', function () {
            marker.icon.fillColor = markerColor(points[key].space_type);
            marker.setZIndex(0);
            marker.setMap(map);
            openPoints = [];
        });
    });
    if (typeof (defaults.callback) == 'function') {
        defaults.callback();
    }
}

function markerColor(space_type) {
    switch (String(space_type).toLowerCase()) {
        case 'bar':
        case 'café':
        case 'restaurant':
            return '#EA7125';
            break;
        case 'lab':
        case 'lecture room':
        case 'library space':
        case 'meeting room':
        case 'seminar room':
            return '#00B1C1';
            break;
        default:
            return '#666666';
    }
}

function loadList(options) {
    var defaults = {
        inactiveColor: 'rgba(0,0,0,0.6)',
        activeColor: '#e2637c'
    };
    $.extend(defaults, options);
    $list.removeClass('no-spaces');
    $list.find('.empty-list').remove();

    $.each(points, function (key) {
        var space = parseTemplate('list', points[key]);
        $list.append(space);
    });
    $('.more-spaces-link').remove();

    $('.list-footer').remove();

    $('.list-space>h2>.library').each(function (index, el) {
        var $address = $(this).next('.address');
        if ($(this).html() == "") {
            if ($address.length > 0 && $address.html() !== '') {
                $address.removeClass('hidden').html($address.html().split(/\r\n|\r|\n|,/g)[0]);
                $(this).remove();
            }
        } else {
            $address.remove();
        }
    });
    $('.list-space').each(function () {
        var desc = $(this).find('.description').html();
        if ($(this).find('.exclude-array').html() == '') {
            $(this).find('.excluded-search').remove();
        } else if ($(this).find('.exclude-array').length > 0 && $(this).attr('data-expanded') == undefined) {
            var str = '' + $(this).find('.excluded-value:last').html();
            if (str !== '') {
                str = str.substring(0, str.length - 1);
                $(this).find('.excluded-value:last').html(str);
            }
            $(this).attr('data-expanded', $(this).find('.excluded-value').length);
        }

        $(this).hover(function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!$(this).hasClass('hover')) {
                $(this).addClass('hover')
                var space = findMarkers(points, {'id': $(this).data('id')}).spaces[0];
                if (currView !== 'small') {
                    for (var i = 0; i < points.length; i++) {
                        points[i].marker.setOptions({'opacity': 0.25});
                        points[i].marker.setMap(map);
                    }
                }

                if (space.marker !== undefined && space.marker.icon !== undefined) {
                    //space.marker.icon.fillColor = activeColor;
                    space.marker.setOptions({'opacity': 1});
                    space.marker.setZIndex(10000);
                    space.marker.setMap(map);
                }
            }

            /* Act on the event */
        }, function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (!!$(this).hasClass('hover')) {
                $(this).removeClass('hover')
                var space = findMarkers(points, {'id': $(this).data('id')}).spaces[0];
                if (!$(this).hasClass('clicked')) {
                    for (var i = 0; i < points.length; i++) {
                        points[i].marker.setOptions({'opacity': 1});
                        points[i].marker.setMap(map);
                    }
                    if (space.marker !== undefined && space.marker.icon !== undefined) {
                        space.marker.icon.fillColor = markerColor(space.space_type);
                        space.marker.setOptions({'opacity': 1});
                        space.marker.setZIndex(0);
                        space.marker.setMap(map);
                    }
                }

            }
        }).on('click', function (event) {
            event.preventDefault();
            $this = $(this);
            $this.addClass('clicked')
            setTimeout(function () {
                $this.removeClass('clicked');
            }, 400);
            $this.trigger('mouseout')
            window.location.hash = $(this).data('link');
            /* Act on the event */
        });
        ;
    })
    for (var i = 0; i < exclude.total; i++) {
        //console.log('add title', i, $list.find('.list-space[data-expanded="' + (i+1) + '"]:first'));
        if ($list.find('.list-space[data-expanded="' + (i + 1) + '"]:first').prev('div').is('.extended-description')) {
            continue;
        }
        $list.find('.list-space[data-expanded="' + (i + 1) + '"]:first').before('<div class="extended-description"><b>Your search criteria returned no exact matches.</b> <br /> Below are spaces not including: ' + $list.find('.list-space[data-expanded="' + (i + 1) + '"]:first').find('.exclude-array').html() + '</div>');
        var str = "" + $list.find('.extended-description:last').html();
        var ax = str.lastIndexOf(',');
        if (ax != -1) {
            str = str.substring(0, ax) + ' or ' + str.substring(ax + 1);
        }
        $list.find('.extended-description:last').html(str);
    }
    if (typeof (defaults.callback) == 'function') {
        defaults.callback();
    }
}

function loadTemplates(options) {
    var defaults = {};
    $.extend(defaults, options);
    $.each(templates, function (key) {
        templates[key].template = $('#'+templates[key].id).html();
    });
    defaults.callback();
}

function parseTemplate(t, data, partial) {
    //console.log("parse template", t, data, partial);
    if (t == undefined) {
        return false;
    }

    var r = new RegExp('(#{.*\\[.*\\].*})', "g"),
        arrays,
        template,
        matches,
        limit = null,
        icon = null,
        attr = null,
        raw = null,
        transform = null;

    if (partial == true) {
        template = t;
    } else {
        template = templates[t].template;
    }
    arrays = template.match(r);
    if (arrays !== null) {
        for (var i = 0; i < arrays.length; i++) {
            var r = new RegExp('(#{(.*)\\[(.*)\\](.*?)})', "g");
            var match = r.exec(arrays[i]);

            if (match !== null && match !== match[4] !== undefined) {
                limit = match[4].match(/.*limit="(.*)".*/);
                if (limit !== null) {
                    limit = Number(limit[1]);
                } else {
                    limit = null;
                }
            }

            if (match !== null && match[2] !== undefined) {
                var str = convertToValue(match[3], data[match[2]], {"limit": limit, "icon": icon, "attr": attr});
                template = template.replace(match[1], str);
            }

        }
    }
    r = new RegExp('(#{(.*?)})', "g")
    matches = template.match(r);
    if (matches !== null) {
        for (var i = 0; i < matches.length; i++) {
            limit = matches[i].match(/.*limit="(.*?)".*/);
            value = matches[i].match(/.*value="(.*?)".*/);
            attr = matches[i].match(/.*attr="(.*?)".*/);
            transform = matches[i].match(/.*transform="(.*?)".*/);
            icon = matches[i].match(/.*icon.*/);
            raw = matches[i].match(/.*raw.*/);
            if (icon !== null) {
                icon = true;
            }
            if (raw !== null) {
                raw = true;
            }
            if (limit !== null) {
                limit = Number(limit[1]);
            }
            if (attr !== null) {
                attr = attr[1];
            }
            if (transform !== null) {
                transform = transform[1];
            }
            if (value !== null) {
                value = value[1];
            }
            var key = ''
            if (limit !== null || icon !== null || attr !== null || value !== null || raw !== null) {
                key = matches[i].match(/#{(.*)\(.*}/);
            } else {
                key = matches[i].match(/#{(.*)}/);
            }
            //console.log(matches[i], data, key, icon);
            if (key == null) {
                key = matches[i].match(/#{(.*)}/);
            }
            if (key !== null) {
                var str = convertToValue(matches[i], data[key[1]], {
                    "limit": limit,
                    "icon": icon,
                    "attr": attr,
                    "value": value,
                    "raw": raw,
                    "transform": transform
                });
                template = template.replace(matches[i], str);
            }


        }
    }


    return template;
}


function convertToValue(t, data, options) {
    if ($.type(data) == 'array') {
        var temp = '';
        for (var i = 0; i < data.length; i++) {
            var str = t;
            if ($.type(data[i]) == 'object' || $.type(data[i]) == 'array') {
                if (!!options.raw) {
                    str = data[i];
                } else {
                    str = parseTemplate(t, data[i], true);
                }

            } else {
                var searchIconMap = searchArray(iconMap, data[i]);
                if (searchIconMap !== -1) {
                    str = str.replace(/#{value}/g, iconMap[searchIconMap][1]);
                    str = str.replace(/#{attr}/g, String(iconMap[searchIconMap][0].replace(/ /g, '-')).toLowerCase());
                    str = str.replace(/#{icon}/g, iconMap[searchIconMap][2]);
                } else {
                    str = str.replace(/#{value}/g, data[i].replace(/(.*?)/, ''));
                    str = str.replace(/#{attr}/g, data[i]);
                }
            }
            temp += str;
            if (options.limit !== null && i >= (options.limit - 1)) {
                break;
            }
        }

        return temp;

    } else if ($.type(data) == 'object') {
        var temp = t;
        if (!!options.raw) {
            //console.log(data);
            return JSON.stringify(data);
        }
        if (options.value !== null) {
            if (options.limit !== null) {
                temp = data[options.value].substr(0, options.limit);
            } else {
                temp = data[options.value];
            }
        } else {
            $.each(data, function (key, value) {
                if (options.limit !== null) {
                    temp = temp.replace('/#{' + key + '.*}/g', String(value).substr(0, options.limit));
                } else {
                    temp = temp.replace('/#{' + key + '.*}/g', value);
                }

            });
        }

        return temp;
    } else {
        if (data !== undefined && data !== null && data !== 'null') {
            if (options.limit !== null) {
                data = String(data).substr(0, options.limit)
            }
            if (options.attr !== null) {
                data = String(data).replace(' ', options.attr)
            }
            if (options.transform == 'lowercase') {
                data = String(data).toLowerCase();
            }
            if (options.transform == 'uppercase') {
                data = String(data).toUpperCase();
            }
            if (!!options.icon) {
                var searchIconMap = searchArray(iconMap, data);
                if (searchIconMap !== -1) {
                    data = iconMap[searchIconMap][2];
                }
            }
            return data;
        }
        return '';
    }

}

function searchArray(haystack, needle) {
    var ret = -1;
    for (var i = 0; i < haystack.length; i++) {
        if ($.type(haystack[i]) == 'array') {
            for (var j = 0; j < haystack[i].length; j++) {
                if (String(haystack[i][j]).toLowerCase() == String(needle).toLowerCase()) {
                    ret = i;
                    break;
                }
            }
            if (ret !== -1) break;
        } else {
            if (String(haystack[i]).toLowerCase() == String(needle).toLowerCase()) {
                ret = i;
                break;
            }
        }
    }
    return ret;
}

function getDistance(origin, dest, callback) {
    //console.log('get distance()');
    var service = new google.maps.DistanceMatrixService();
    if ($.type(origin) !== 'array') {
        var temp = [];
        temp.push(origin);
        origin = temp;
    }
    if ($.type(dest) !== 'array') {
        var temp = [];
        temp.push(dest);
        dest = temp;
    }
    service.getDistanceMatrix({
        origins: origin,
        destinations: dest,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        travelMode: google.maps.TravelMode.WALKING
    }, function (response, status) {
        if (status == "OK") {
            if ($.type(callback) == 'function') {
                if (response.rows[0].elements[0].distance !== undefined) {
                    callback(response.rows[0].elements[0].distance.text);
                } else {
                    callback();
                }

            }
        } else {
            return '';
        }

    });
}


function orderSpaces() {
    points.sort(function (a, b) {
        aNum = parseFloat(a.distance);
        bNum = parseFloat(b.distance);
        ////console.log(parseFloat(a.distance), parseFloat(b.distance));
        if (a.distance == undefined) return 1;
        if (b.distance == undefined) return -1;

        if (a.distance.indexOf('ft') !== -1) {
            aNum = Number("0.0" + parseFloat(a.distance));
        }
        if (b.distance.indexOf('ft') !== -1) {
            bNum = Number("0.0" + parseFloat(b.distance));
        }
        //check if we have one in feet and one in miles - return feet
        //console.log(a.distance.indexOf('ft'), b.distance.indexOf('ft'));

        if (aNum > bNum) {
            return 1;
        } else if (aNum < bNum) {
            return -1;
        } else {
            return 0;
        }
        //else compare the number from both as they will be the same unit of measurement


    });
}

function lineDistance(point1, point2) {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}
