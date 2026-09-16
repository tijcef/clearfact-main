<?php
/**
 * Plugin Name: ClearFact Editorial Quality
 * Description: Adds an editorial-value checklist to WordPress and exposes a safe quality signal to the ClearFact frontend.
 * Version: 1.0.0
 * Author: ClearFact Media Ltd
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const CLEARFACT_QUALITY_NONCE_ACTION = 'clearfact_quality_save';
const CLEARFACT_QUALITY_NONCE_NAME   = 'clearfact_quality_nonce';

function clearfact_quality_reporting_types() {
	return [
		'original'         => 'Original reporting / interview / field reporting',
		'primary_analysis' => 'Primary document or data analysis',
		'fact_check'       => 'Fact check / verification',
		'developing'       => 'Developing or breaking report with attribution',
		'press_release'    => 'Based mainly on a press statement / announcement',
		'curated'          => 'Curated or based mainly on reporting published elsewhere',
	];
}

function clearfact_quality_checklist_fields() {
	return [
		'clearfact_primary_source_checked' => 'Important sources or records are identified in the article.',
		'clearfact_claims_attributed'      => 'Material claims are clearly attributed and not presented as established fact without support.',
		'clearfact_added_value_checked'    => 'ClearFact has added verification, context, explanation, data or direct reporting.',
		'clearfact_not_light_rewrite'      => 'This is not merely a lightly rewritten press release or another publisher\'s report.',
	];
}

function clearfact_quality_external_source_count( $content ) {
	if ( ! is_string( $content ) || '' === trim( $content ) ) {
		return 0;
	}

	preg_match_all( '/<a\b[^>]*\bhref=["\']([^"\']+)["\'][^>]*>/i', $content, $matches );
	$hosts = [];

	foreach ( $matches[1] ?? [] as $href ) {
		$url = wp_parse_url( html_entity_decode( $href, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );

		if ( ! is_array( $url ) || empty( $url['host'] ) ) {
			continue;
		}

		$host = strtolower( $url['host'] );
		$host = preg_replace( '/^www\./', '', $host );

		if ( in_array( $host, [ 'clearfact.ng', 'cms.clearfact.ng' ], true ) ) {
			continue;
		}

		$hosts[ $host ] = true;
	}

	return count( $hosts );
}

function clearfact_quality_word_count( $content ) {
	$text = trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( (string) $content ) ) );

	if ( '' === $text ) {
		return 0;
	}

	preg_match_all( '/\S+/u', $text, $matches );

	return count( $matches[0] ?? [] );
}

function clearfact_quality_payload( $post_id ) {
	$post = get_post( $post_id );

	if ( ! $post instanceof WP_Post ) {
		return [
			'reporting_type'       => '',
			'added_value'          => '',
			'checklist_complete'   => false,
			'word_count'           => 0,
			'external_source_count'=> 0,
			'statement_based'      => false,
			'index_ready'          => false,
			'ad_ready'             => false,
		];
	}

	$reporting_type = sanitize_key( (string) get_post_meta( $post_id, 'clearfact_reporting_type', true ) );
	$added_value    = trim( (string) get_post_meta( $post_id, 'clearfact_added_value', true ) );
	$checklist      = clearfact_quality_checklist_fields();
	$complete       = true;

	foreach ( array_keys( $checklist ) as $meta_key ) {
		if ( '1' !== (string) get_post_meta( $post_id, $meta_key, true ) ) {
			$complete = false;
			break;
		}
	}

	$word_count   = clearfact_quality_word_count( $post->post_content );
	$source_count = clearfact_quality_external_source_count( $post->post_content );
	$strong_types = [ 'original', 'primary_analysis', 'fact_check' ];
	$original_value = $complete && in_array( $reporting_type, $strong_types, true ) && mb_strlen( $added_value ) >= 40;
	$plain_content = wp_strip_all_tags( $post->post_content );
	$statement_based = (bool) preg_match( '/\b(?:in|according to) (?:a |an )?(?:press )?statement\b|\bstatement (?:issued|released)\b|\bpress release\b/i', $plain_content );
	$paragraph_count = preg_match_all( '/<p\b/i', $post->post_content, $paragraph_matches );
	$heading_count   = preg_match_all( '/<h[2-4]\b/i', $post->post_content, $heading_matches );
	$has_evidence    = $source_count >= 1 || $original_value;
	$substantial_unlinked = ! $statement_based && $word_count >= 700 && $paragraph_count >= 8 && $heading_count >= 2;

	$index_ready = ( $word_count >= 220 && $has_evidence ) || ( $word_count >= 350 && $substantial_unlinked );
	$ad_ready    = $index_ready && $word_count >= 450 && $has_evidence;

	return [
		'reporting_type'        => $reporting_type,
		'added_value'           => $added_value,
		'checklist_complete'    => $complete,
		'word_count'            => $word_count,
		'external_source_count' => $source_count,
		'statement_based'       => $statement_based,
		'index_ready'           => $index_ready,
		'ad_ready'              => $ad_ready,
	];
}

function clearfact_quality_add_meta_box() {
	add_meta_box(
		'clearfact-editorial-quality',
		'ClearFact Editorial Value',
		'clearfact_quality_render_meta_box',
		'post',
		'side',
		'high'
	);
}
add_action( 'add_meta_boxes', 'clearfact_quality_add_meta_box' );

function clearfact_quality_render_meta_box( $post ) {
	wp_nonce_field( CLEARFACT_QUALITY_NONCE_ACTION, CLEARFACT_QUALITY_NONCE_NAME );

	$current_type = (string) get_post_meta( $post->ID, 'clearfact_reporting_type', true );
	$added_value  = (string) get_post_meta( $post->ID, 'clearfact_added_value', true );
	$quality      = clearfact_quality_payload( $post->ID );
	?>
	<p><strong>Reporting type</strong></p>
	<select name="clearfact_reporting_type" style="width:100%">
		<option value="">Select…</option>
		<?php foreach ( clearfact_quality_reporting_types() as $value => $label ) : ?>
			<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $current_type, $value ); ?>><?php echo esc_html( $label ); ?></option>
		<?php endforeach; ?>
	</select>

	<p style="margin-top:14px"><strong>What did ClearFact add?</strong></p>
	<textarea name="clearfact_added_value" rows="4" style="width:100%" placeholder="Briefly state the original verification, interview, document analysis, data, local reporting or explanatory value added by ClearFact."><?php echo esc_textarea( $added_value ); ?></textarea>

	<hr style="margin:14px 0">
	<?php foreach ( clearfact_quality_checklist_fields() as $meta_key => $label ) : ?>
		<label style="display:block;margin:10px 0;line-height:1.35">
			<input type="checkbox" name="<?php echo esc_attr( $meta_key ); ?>" value="1" <?php checked( '1', (string) get_post_meta( $post->ID, $meta_key, true ) ); ?>>
			<?php echo esc_html( $label ); ?>
		</label>
	<?php endforeach; ?>

	<hr style="margin:14px 0">
	<p style="margin:0"><strong>Current automatic check</strong></p>
	<ul style="margin:8px 0 0 18px;list-style:disc">
		<li><?php echo esc_html( number_format_i18n( $quality['word_count'] ) ); ?> words</li>
		<li><?php echo esc_html( number_format_i18n( $quality['external_source_count'] ) ); ?> external source domain(s) linked</li>
		<li>Statement/press-release language: <strong><?php echo $quality['statement_based'] ? 'detected' : 'not detected'; ?></strong></li>
		<li>Search indexing: <strong><?php echo $quality['index_ready'] ? 'ready' : 'hold / noindex'; ?></strong></li>
		<li>Ad placement: <strong><?php echo $quality['ad_ready'] ? 'eligible' : 'not yet'; ?></strong></li>
	</ul>
	<p style="font-size:11px;color:#646970">The frontend applies the final quality gate. This checklist does not replace editor review.</p>
	<?php
}

function clearfact_quality_save_meta( $post_id ) {
	if ( ! isset( $_POST[ CLEARFACT_QUALITY_NONCE_NAME ] ) ) {
		return;
	}

	$nonce = sanitize_text_field( wp_unslash( $_POST[ CLEARFACT_QUALITY_NONCE_NAME ] ) );

	if ( ! wp_verify_nonce( $nonce, CLEARFACT_QUALITY_NONCE_ACTION ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$types = clearfact_quality_reporting_types();
	$type  = isset( $_POST['clearfact_reporting_type'] ) ? sanitize_key( wp_unslash( $_POST['clearfact_reporting_type'] ) ) : '';

	if ( ! isset( $types[ $type ] ) ) {
		$type = '';
	}

	update_post_meta( $post_id, 'clearfact_reporting_type', $type );

	$added_value = isset( $_POST['clearfact_added_value'] )
		? sanitize_textarea_field( wp_unslash( $_POST['clearfact_added_value'] ) )
		: '';
	update_post_meta( $post_id, 'clearfact_added_value', $added_value );

	foreach ( array_keys( clearfact_quality_checklist_fields() ) as $meta_key ) {
		update_post_meta( $post_id, $meta_key, isset( $_POST[ $meta_key ] ) ? '1' : '0' );
	}
}
add_action( 'save_post_post', 'clearfact_quality_save_meta' );

/**
 * Public REST field consumed by clearfact.ng. It intentionally exposes only
 * editorial transparency data, never private notes or user information.
 */
function clearfact_quality_register_rest_field() {
	register_rest_field(
		'post',
		'clearfact_editorial',
		[
			'get_callback' => static function ( $object ) {
				$post_id = isset( $object['id'] ) ? (int) $object['id'] : 0;
				return clearfact_quality_payload( $post_id );
			},
			'schema'       => [
				'description' => 'ClearFact editorial-value and publication-readiness metadata.',
				'type'        => 'object',
				'context'     => [ 'view', 'edit' ],
				'readonly'    => true,
			],
		]
	);
}
add_action( 'rest_api_init', 'clearfact_quality_register_rest_field' );

function clearfact_quality_admin_notice() {
	$screen = get_current_screen();

	if ( ! $screen || 'post' !== $screen->base || 'post' !== $screen->post_type ) {
		return;
	}

	$post_id = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	if ( $post_id <= 0 || 'publish' !== get_post_status( $post_id ) ) {
		return;
	}

	$quality = clearfact_quality_payload( $post_id );

	if ( $quality['index_ready'] && $quality['ad_ready'] ) {
		return;
	}

	$message = $quality['index_ready']
		? 'This article can be indexed, but the ClearFact frontend will withhold ad placement until it has stronger sourcing/original-value signals and at least 450 words.'
		: 'This article is published, but the ClearFact frontend may mark it noindex until it has enough substantive reporting, a useful excerpt and stronger sourcing/original-value signals.';

	echo '<div class="notice notice-warning"><p><strong>ClearFact Editorial Quality:</strong> ' . esc_html( $message ) . '</p></div>';
}
add_action( 'admin_notices', 'clearfact_quality_admin_notice' );

function clearfact_quality_add_posts_column( $columns ) {
	$columns['clearfact_quality'] = 'ClearFact Quality';
	return $columns;
}
add_filter( 'manage_post_posts_columns', 'clearfact_quality_add_posts_column' );

function clearfact_quality_render_posts_column( $column, $post_id ) {
	if ( 'clearfact_quality' !== $column ) {
		return;
	}

	$quality = clearfact_quality_payload( $post_id );

	if ( $quality['ad_ready'] ) {
		echo '<strong style="color:#087a2f">Index + Ads</strong>';
	} elseif ( $quality['index_ready'] ) {
		echo '<strong style="color:#8a5a00">Index only</strong>';
	} else {
		echo '<strong style="color:#b32d2e">Needs work</strong>';
	}
}
add_action( 'manage_post_posts_custom_column', 'clearfact_quality_render_posts_column', 10, 2 );
