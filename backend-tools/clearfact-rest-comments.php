<?php
/**
 * Plugin Name: ClearFact REST Comments
 * Description: Allows public article comments through the ClearFact headless WordPress REST API.
 * Version: 1.0.0
 * Author: ClearFact Media Ltd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Permit anonymous creation only on the core public comments endpoint.
 * WordPress keeps this disabled for REST requests by default, even when the
 * normal Discussion settings allow visitors to comment.
 */
function clearfact_allow_anonymous_rest_comments( $allowed, $request ) {
	if ( ! $request instanceof WP_REST_Request ) {
		return $allowed;
	}

	if ( 'POST' !== $request->get_method() || '/wp/v2/comments' !== $request->get_route() ) {
		return $allowed;
	}

	return true;
}
add_filter( 'rest_allow_anonymous_comments', 'clearfact_allow_anonymous_rest_comments', 10, 2 );

/**
 * Make an incorrect registration option visible instead of silently failing.
 */
function clearfact_rest_comments_admin_notice() {
	if ( ! current_user_can( 'manage_options' ) || ! get_option( 'comment_registration' ) ) {
		return;
	}

	echo '<div class="notice notice-error"><p><strong>ClearFact REST Comments:</strong> Open <a href="' . esc_url( admin_url( 'options-discussion.php' ) ) . '">Settings &rarr; Discussion</a> and untick &ldquo;Users must be registered and logged in to comment.&rdquo;</p></div>';
}
add_action( 'admin_notices', 'clearfact_rest_comments_admin_notice' );
