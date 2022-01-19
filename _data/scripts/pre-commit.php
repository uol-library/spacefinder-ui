<?php
$repodir = '/mnt/home/repos/spacefinder-ui/';
$spacesdir = $repodir . 'spaces/';
$spacesjson = array();
if ( is_dir( $spacesdir ) ) {
	if ( $dh = opendir( $spacesdir ) ) {
		while ( ($file = readdir( $dh ) ) !== false ) {
			// get each json file
			if ( $file !== '.' && $file !== '..' && $file !== '.gitignore' ) {
				$spacejson = json_decode( file_get_contents( $spacesdir . $file ) );
				array_push( $spacesjson, $spacejson );
			}
		}
		closedir( $dh );
	}
}
file_put_contents( $repodirdir . 'spaces.json', json_encode( $spacesjson, JSON_UNESCAPED_SLASHES ) );