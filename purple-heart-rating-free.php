<?php
/*
Plugin Name: Purple Heart Rating (Free) by WP-Buddy
Plugin URI: https://purpleheartratingplugin.com
Description: The ultimate Rating plugin which will blow you away!
Version: 1.3.4
Author: wp-buddy
Author URI: https://wp-buddy.com
Text Domain: purple-heart-rating-free
*/
/*  Copyright 2012-2020  WP-Buddy  (email : info@wp-buddy.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 *
 * PHP Version check.
 *
 */
if ( version_compare( PHP_VERSION, '5.6.0', '<' ) ) {
	add_action( 'admin_notices', 'wpbphf_old_php_notice' );

	function wpbphf_old_php_notice() {

		printf(
			'<div class="notice error"><p>%s</p></div>',
			sprintf(
				__( 'Hey mate! Sorry for interrupting you. It seem\'s that you\'re using an old PHP version (your current version is %s). You should upgrade to at least 5.6.0 or higher in order to use the Purple Heart Rating plugin. We recommend version 7.x! Thank you!', 'purple-heart-rating-free' ),
				esc_html( PHP_VERSION )
			)
		);
	}

	$plugin_file = substr( str_replace( WP_PLUGIN_DIR, '', __FILE__ ), 1 );

	add_action( 'after_plugin_row_' . $plugin_file, 'wpbphf_plugin_upgrade_notice', 10, 2 );

	function wpbphf_plugin_upgrade_notice( $plugin_data, $status ) {

		printf(
			'<tr><td></td><td colspan="2"><div class="notice notice-error notice-error-alt inline"><p>%s</p></div></td></tr>',
			__( 'This plugin needs at least PHP version 5.6.x to run properly. Please ask your host on how to change PHP versions.', 'purple-heart-rating-free' )
		);
	}

	# sorry. The plugin will not work with an old PHP version.
	return;
}


/**
 * The autoloader class
 *
 * @param string $class_name
 *
 * @return bool
 * @since 1.0
 */
function wpbphf_autoloader( $class_name ) {

	$file = trailingslashit( dirname( __FILE__ ) ) . 'classes/' . strtolower( $class_name ) . '.php';
	if ( is_file( $file ) ) {
		require_once( $file );

		return true;
	}

	return false;
}


// registering the autoloader function
spl_autoload_register( 'wpbphf_autoloader', true );

$wpb_purpleheart_free = new WPB_Purple_Heart_Rating_Free( __FILE__ );
