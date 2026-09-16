<?php
/**
 * Plugin Name: ClearFact Headless SEO Guard
 * Description: Keeps cms.clearfact.ng as a headless CMS by consolidating public WordPress URLs to clearfact.ng and preventing duplicate CMS pages from being indexed.
 * Version: 1.0.0
 * Author: ClearFact Media Ltd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const CLEARFACT_PUBLIC_ORIGIN = 'https://clearfact.ng';

/**
 * WordPress's own XML sitemap would advertise duplicate CMS URLs. The public
 * TanStack application generates the canonical sitemap instead.
 */
add_filter( 'wp_sitemaps_enabled', '__return_false' );

/**
 * Add a robots directive to any CMS-rendered HTML that is not an admin screen.
 * REST responses and media files are not affected by this filter.
 */
function clearfact_headless_wp_robots( $robots ) {
	if ( is_admin() ) {
		return $robots;
	}

	$robots['noindex']   = true;
	$robots['nofollow']  = true;
	$robots['noarchive'] = true;

	return $robots;
}
add_filter( 'wp_robots', 'clearfact_headless_wp_robots', 999 );

/**
 * Send an HTTP-level noindex signal as a second line of defence for CMS HTML.
 */
function clearfact_headless_x_robots_tag() {
	if ( is_admin() ) {
		return;
	}

	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return;
	}

	header( 'X-Robots-Tag: noindex, nofollow, noarchive', true );
}
add_action( 'send_headers', 'clearfact_headless_x_robots_tag', 20 );

/**
 * Redirect canonical CMS content pages to their public ClearFact equivalents.
 * Admin screens, REST, AJAX and editor previews remain on the CMS host.
 */
function clearfact_headless_redirect_public_pages() {
	if ( is_admin() || wp_doing_ajax() || is_preview() ) {
		return;
	}

	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return;
	}

	$target = '';

	if ( is_singular( 'post' ) ) {
		$post = get_queried_object();

		if ( $post instanceof WP_Post && $post->post_name ) {
			$slug   = rawurlencode( rawurldecode( $post->post_name ) );
			$target = CLEARFACT_PUBLIC_ORIGIN . '/post/' . $slug;
		}
	} elseif ( is_category() ) {
		$term = get_queried_object();

		if ( $term instanceof WP_Term && $term->slug ) {
			$public_term = $term;

			// The public site exposes top-level categories plus Elections. Any other
			// child category is consolidated to its highest surviving parent.
			if ( (int) $term->parent > 0 && 'elections' !== strtolower( $term->slug ) ) {
				$ancestors = get_ancestors( (int) $term->term_id, 'category', 'taxonomy' );

				if ( $ancestors ) {
					$top_id = (int) end( $ancestors );
					$top    = get_term( $top_id, 'category' );

					if ( $top instanceof WP_Term && $top->slug ) {
						$public_term = $top;
					}
				}
			}

			$target = CLEARFACT_PUBLIC_ORIGIN . '/category/' . rawurlencode( $public_term->slug );
		}
	} elseif ( is_author() ) {
		$author = get_queried_object();

		if ( $author instanceof WP_User ) {
			$target = CLEARFACT_PUBLIC_ORIGIN . '/author/' . (int) $author->ID;
		}
	} elseif ( is_front_page() || is_home() ) {
		$target = CLEARFACT_PUBLIC_ORIGIN . '/';
	}

	if ( ! $target ) {
		return;
	}

	wp_redirect( esc_url_raw( $target ), 301, 'ClearFact Headless SEO Guard' ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
	exit;
}
add_action( 'template_redirect', 'clearfact_headless_redirect_public_pages', 1 );
