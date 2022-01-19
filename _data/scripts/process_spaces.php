<?php
$spacesjson = file_get_contents( "/mnt/home/repos/spacefinder-ui/_data/cambridge/lib-cam-ac-uk-spaces.json" );
$data = json_decode( $spacesjson );
$spaces = $data->results;

for( $i = 0; $i < count( $spaces ); $i++ ) {
	if ( $spaces[$i]->id ) {
		// get netlify source files
		$netlify_src = $spaces[$i];
		$newtags = array();
		if ( count( $netlify_src->tags ) ) {
			foreach ( $netlify_src->tags as $tag ) {
				array_push( $newtags, $tag->name );
			}
		}
		$netlify_src->tags = $newtags;
		// rename images
		if ( count( $netlify_src->images ) ) {
			for ( $im = 0; $im < count( $netlify_src->images ); $im++ ) {
				if ( preg_match( '/^.*\/([0-9]+)\/resized\/([^\?]+)\?.*$/', $netlify_src->images[ $im ], $matches ) ) {
					$netlify_src->images[ $im ] = $matches[1] . '-' . $matches[2];
				}
			}
		}
		// redundant properties
		$unwanted_properties = array(
			"created_at",
			"updated_at",
			"expensive",
			"user_tags",
			"admin_tag_list",
			"user_tags_list",
			"term_time_hours",
			"out_of_term_hours",
			"atmosphere_disciplined",
			"atmosphere_relaxed",
			"atmosphere_historic",
			"atmosphere_modern",
			"atmosphere_inspiring",
			"atmosphere_cosy",
			"atmosphere_social",
			"atmosphere_friendly",
			"facility_food_drink",
			"facility_daylight",
			"facility_views",
			"facility_large_desks",
			"facility_free_wifi",
			"facility_no_wifi",
			"facility_computers",
			"facility_laptops_allowed",
			"facility_sockets",
			"facility_signal",
			"facility_printers_copiers",
			"facility_whiteboards",
			"facility_projector",
			"facility_outdoor_seating",
			"facility_bookable",
			"facility_toilets",
			"facility_accessible_toilets",
			"facility_induction_loops",
			"facility_adjustable_furniture",
			"facility_individual_study_space",
			"facility_gender_neutral_toilets",
			"facility_bike_racks",
			"facility_smoking_area",
			"facility_baby_changing",
			"facility_prayer_room",
			"facility_refreshments",
			"facility_break",
			"opentimes_before_9am",
			"opentimes_after_7pm",
			"opentimes_saturday",
			"opentimes_sunday",
			"work_in_a_library",
			"work_private",
			"work_close",
			"work_friends",
			"work_group"
		);
		// populate work property
		$netlify_src->work = array();
		foreach( array( "in_a_library", "private", "close", "friends", "group" ) as $work ) {
			$prop = 'work_' . $work;
			if ( $netlify_src->$prop ) {
				array_push( $netlify_src->work, $work );
			}
			array_push( $unwanted_properties, $prop );
		}
		// rename properties
		$netlify_src->building = $netlify_src->library;
		array_push( $unwanted_properties, "library" );
		// GeoJSON
		$geojson = new stdClass();
		$geojson->type = 'Point';
		$geojson->coordinates = array(
			$netlify_src->lng,
			$netlify_src->lat
		);
		$netlify_src->location = json_encode( $geojson );
		array_push( $unwanted_properties, "lng" );
		array_push( $unwanted_properties, "lat" );
		// rename property values
		for ( $f = 0; $f < count( $netlify_src->facilities ); $f++ ) {
			$netlify_src->facilities[$f] = substr( $netlify_src->facilities[$f], 9 );
		}
		for ( $a = 0; $a < count( $netlify_src->atmosphere ); $a++ ) {
			$netlify_src->atmosphere[$a] = substr( $netlify_src->atmosphere[$a], 11 );
		}
		// remove unwanted properties
		foreach ( $unwanted_properties as $prop ) {
			unset( $netlify_src->prop );
		}
		file_put_contents( '/mnt/home/repos/spacefinder-ui/spaces/' . $netlify_src->id . '.json', json_encode( $netlify_src, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) );
	}
}
