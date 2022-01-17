<?php
$spacesjson = file_get_contents( "spaces.json" );
$spaces = json_decode( $spacesjson );
for( $i = 0; $i < count( $spaces ); $i++ ) {
	$spaces[$i]->work = array();
	foreach( array( "in_a_library", "private", "close", "friends", "group" ) as $work ) {
		$prop = 'work_' . $work;
		if ( $spaces[$i]->$prop ) {
			array_push( $spaces[$i]->work, $work );
		}
		unset( $spaces[$i]->$prop );
	}
	$newtags = array();
	if ( count( $spaces[$i]->tags ) ) {
		foreach ( $spaces[$i]->tags as $tag ) {
			array_push( $newtags, $tag->name );
		}
	}
	$spaces[$i]->tags = $newtags;
	// remove properties not needed
	unset($spaces[$i]->created_at);
	unset($spaces[$i]->updated_at);
	unset($spaces[$i]->expensive);
	// rename properties
	$spaces[$i]->building = $spaces[$i]->library;
	unset($spaces[$i]->library);
	// GeoJSON
	$geojson = new stdClass();
	$geojson->type = 'Point';
	$geojson->coordinates = array(
		$spaces[$i]->lng,
		$spaces[$i]->lat
	);
	$spaces[$i]->location = json_encode($geojson);
	unset($spaces[$i]->lng);
	unset($spaces[$i]->lat);
}
file_put_contents( "spaces_new.json", json_encode( $spaces, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) );