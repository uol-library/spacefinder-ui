<?php
$dir = "/mnt/home/repos/spacefinder-ui/assets/photos";
function deleteDir($dirPath) {
	if (! is_dir($dirPath)) {
		throw new InvalidArgumentException("$dirPath must be a directory");
	}
	if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
		$dirPath .= '/';
	}
	$files = glob($dirPath . '*', GLOB_MARK);
	foreach ($files as $file) {
		if (is_dir($file)) {
			deleteDir($file);
		} else {
			unlink($file);
		}
	}
	rmdir($dirPath);
}
if (is_dir($dir)) {
	if ($dh = opendir($dir)) {
		while (($file = readdir($dh)) !== false) {
			// numbered folders
			if ( $file !== '.' && $file !== '..' && is_dir( $dir . '/' . $file ) ) {
				deleteDir($dir . '/' . $file);
			}
		}
		closedir($dh);
	}
}

/*
if (is_dir($dir)) {
	if ($dh = opendir($dir)) {
		while (($file = readdir($dh)) !== false) {
			// numbered folders
			if ( $file !== '.' && $file !== '..' ) {
				if ($sdh = opendir($dir . '/' . $file)) {
					while (($sfile = readdir($sdh)) !== false) {
						if ( ! is_dir( $sfile ) ) {
							//copy( $dir . '/' . $file . '/' . $sfile, $dir . '/' . $file . '-' . $sfile );
						}
					}
					closedir($sdh);
				}
				deleteDir($dir . '/' . $file);
			}
		}
		closedir($dh);
	}
}
if (is_dir($dir)) {
	if ($dh = opendir($dir)) {
		while (($file = readdir($dh)) !== false) {
			// numbered folders
			if ( $file !== '.' && $file !== '..' ) {
				if ($sdh = opendir($dir . '/' . $file)) {
					while (($sfile = readdir($sdh)) !== false) {
						// resized and original
						if ( $sfile === 'resized' ) {
							if ($rdh = opendir($dir . '/' . $file . '/' . $sfile)) {
								while (($rfile = readdir($rdh)) !== false) {
									if ( $rfile !== '.' && $rfile !== '..' ) {
										//copy( $dir . '/' . $file . '/' . $sfile . '/' . $rfile, $dir . '/' . $file . '/' . $rfile );
									}
								}
								closedir($rdh);
								deleteDir($dir . '/' . $file . '/' . $sfile);
							}
						}
						if ( $sfile === 'original' ) {
							deleteDir($dir . '/' . $file . '/' . $sfile);
						}
					}
					closedir($sdh);
				}
			}
		}
		closedir($dh);
	}
}*/