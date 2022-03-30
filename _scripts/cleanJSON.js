/**
 * This script scans through files in data/itemjson-combined and compiles a 
 * master list of people information from the ESMS and SAP data, then using this 
 * to consolidate information in these fields. The results are save in the 
 * data/temjson-cleaned directory.
 */
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync( path.resolve( __dirname, '../_data/leeds/spacefinder-leeds.json' ), { encoding: 'utf8' } );
const fileJSON = JSON.parse( data );
const cleanedJSON = [];
const BreakException = {};
const fieldMapping = {
    "name": "Enter space name below e.g. first floor west, the red bean bags or relaxed reading space",
    "description": "Text description of space",
    "access": "Who can use the space?",
    "space_type": "Type of space",
    "library": "In library",
    "address": "Street address",
    "floor": "Floor",
    "lat": "Decimal GPS coordinates (lattitude) eg 52.197949",
    "lng": "Decimal GPS coordinates (longitude) eg 0.122951",
    "restricted": "Access restrictions",
    "restriction": "Description of access restriction",
    "disabled_access": "Disabled access",
    "url": "Website URL",
    "phone_number": "Phone number",
    "twitter_screen_name": "Twitter",
    "facebook_url": "Facebook page",
    "If this is a café, restaurant or bar how expensive is it?(1 = cheap, 5 = expensive)": "expensive"
};
const facilitiesMapping = {
    "Food & drink allowed": "food_drink",
    "Natural daylight": "daylight",
    "Attractive views out of the window": "views",
    "Large desks": "large_desks",
    "Free Wifi": "free_wifi",
    "No WiFi": "no_wifi",
    "Computers": "computers",
    "Laptops allowed": "laptops_allowed",
    "Plug sockets": "sockets",
    "Phone signal": "signal",
    "Printers and copiers": "printers_copiers",
    "Whiteboards": "whiteboards",
    "Projector": "projector",
    "Outdoor seating": "outdoor_seating",
    "Bookable": "bookable",
    "Toilets nearby": "toilets",
    "Close to refreshments": "refreshments",
    "Close to a place to take a break": "break",
};
const atmosphereMapping = {
    "Disciplined?": "disciplined",
    "Relaxed or informal?": "relaxed",
    "Historic?": "historic",
    "Modern?": "modern",
    "Inspiring or thought provoking?": "inspiring",
    "Cosy?": "cosy",
    "Social?": "social",
    "Friendly or welcoming?": "friendly"
};
const workMapping = {
    "...in private?": "private",
    "...close to others?": "close",
    "...alongside friends?": "friends",
    "...in a group?": "group"
};
var spaceID = 1;
fileJSON.forEach( space => {
    const newspace = { "id": spaceID };
    for (f in fieldMapping) {
        if ( f === "twitter_screen_name" ) {
            newspace[f] = space[fieldMapping[f]].replace("https://twitter.com/", "");
        } else {
            newspace[f] = ( space[fieldMapping[f]] == "no" ? false: ( space[fieldMapping[f]] == "yes" ? true: space[fieldMapping[f]] ) );
        }
    }
    try {
        ["Strictly silent", "Whispers", "Background chatter", "Animated discussion", "Music playing"].forEach(n => {
            if (space[n] == "x") {
                newspace.noise = n;
                throw BreakException;
            }
        });
    } catch (e) {
        if ( e !== BreakException ) throw e;
    }
    newspace.facilities = [];
    for (fac in facilitiesMapping) {
        if ( space[fac] !== "" ) {
            newspace.facilities.push(facilitiesMapping[fac]);
        }
    }
    newspace.atmosphere = [];
    for (atm in atmosphereMapping) {
        if ( space[atm] !== "" ) {
            newspace.atmosphere.push(atmosphereMapping[atm]);
        }
    }
    newspace.work = [];
    for (w in workMapping) {
        if ( space[w] !== "" ) {
            newspace.work.push(workMapping[w]);
        }
    }
    cleanedJSON.push(newspace);
    fs.writeFile( path.resolve( __dirname, '../spaces/'+spaceID+'.json' ), JSON.stringify( newspace, null, '    ' ), err => {
        if (err) {
            console.error( err );
            return;
        }
    });
    spaceID++;
});

/*
"name": "Starbucks (Grand Arcade)",
"description": "",
"access": "Anyone (public)",
"space_type": "Café",
"library": null,
"address": "Unit 35, Grand Arcade,\r\nSt Andrew's St,\r\nCambridge,\r\nCB2 3AX.",
"floor": "1st floor",
"lat": "52.20379",
"lng": "0.12144",
"restricted": true,
"restriction": "Please contact the company direct regarding their current access arrangements.",
"disabled_access": true,
"url": "http://www.starbucks.co.uk",
"phone_number": "01223 304746",
"email_address": "",
"twitter_screen_name": "starbucksuk",
"facebook_url": "starbucksuk",
"noise": "Background chatter",
"expensive": null,
"tags": [
    "coffee",
    "tea",
    "cakes"
],
"booking_url": null,
"created_at": "2015-08-24T13:52:05.425Z",
"updated_at": "2020-10-04T09:03:21.673Z",
"images": [
    "229-Starbucks_Grand_Arcade.jpg"
],
"facilities": [
    "food_drink",
    "free_wifi",
    "laptops_allowed",
    "signal",
    "toilets",
    "refreshments"
],
"atmosphere": [
    "relaxed",
    "social",
    "friendly"
],
"admin_tag_list": [
    "coffee",
    "tea",
    "cakes"
],
"work": [
    "close",
    "friends"
]
},

     "Your initials": "ssvp",
      "Enter space name below e.g. first floor west, the red bean bags or relaxed reading space": "Baines Wing Café",
      "Basic info": "Ground floor, Baines Wing, Campus Map ref 58 https://www.leeds.ac.uk/campusmap",
      "Some basic information about the space": "Café with indoor and outdoor seating",
      "Text description of space": "Situated between the School of Healthcare and the Great Hall, Baines Wing Café has a large seating area including its own secluded courtyard which is perfect to enjoy the sunny weather.",
      "Who can use the space?": "Anyone (public)",
      "Type of space": "Café",
      "In library": "no",
      "Street address": "University of Leeds Campus, Woodhouse Lane, Leeds LS2 9JT",
      "Floor": "Ground",
      "Decimal GPS coordinates (lattitude) eg 52.197949": 53.80745464,
      "Decimal GPS coordinates (longitude) eg 0.122951": -1.553855264,
      "Opening hours": "Café open 8.30am-3pm, building open 8am-6pm weekdays",
      "Access restrictions": "no",
      "Description of access restriction": "",
      "Disabled access": "yes",
      "Website URL": "https://gfal.leeds.ac.uk/where-to-eat/cafes/baineswing/",
      "Phone number": "",
      "Twitter": "https://twitter.com/GreatFoodLeeds",
      "Facebook page": "",
      "Disciplined?": "",
      "Relaxed or informal?": "x",
      "Historic?": "",
      "Modern?": "",
      "Inspiring or thought provoking?": "",
      "Cosy?": "x",
      "Social?": "x",
      "Friendly or welcoming?": "x",
      "Strictly silent": "",
      "Whispers": "",
      "Background chatter": "",
      "Animated discussion": "x",
      "Music playing": "",
      "Features & facilities": "",
      "Food & drink allowed": "x",
      "Natural daylight": "x",
      "Attractive views out of the window": "x",
      "Large desks": "",
      "Free Wifi": "x",
      "No WiFi": "",
      "Computers": "",
      "Laptops allowed": "x",
      "Plug sockets": "",
      "Phone signal": "x",
      "Printers and copiers": "",
      "Whiteboards": "",
      "Projector": "",
      "Outdoor seating": "x",
      "Bookable": "",
      "Toilets nearby": "x",
      "Close to refreshments": "x",
      "Close to a place to take a break": "",
      "If this is a café, restaurant or bar how expensive is it?(1 = cheap, 5 = expensive)": 3,
      "...in private?": "",
      "...close to others?": "x",
      "...alongside friends?": "x",
      "...in a group?": "x",
      "Tags": "open, busy, food"
*/