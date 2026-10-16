<?php
/**
 * Plugin Name: ClearFact Newsroom Structure
 * Description: Editorial verification, sponsorship disclosure and publishing checks for the headless newsroom. Preserves existing categories, ACF, URLs, ads and indexing.
 * Version: 1.0.0
 * Author: ClearFact Media Ltd
 */
if (!defined('ABSPATH')) exit;

function cfns_fields() {
    return [
        'verification' => ['Verification status', ['' => 'Not recorded', 'under_review' => 'Under review', 'developing' => 'Developing', 'verified' => 'Verified by editor', 'fact_checked' => 'Fact checked']],
        'content_type' => ['Content type', ['' => 'Standard report', 'opinion' => 'Opinion / Commentary', 'analysis' => 'Analysis', 'press_release' => 'Press release', 'sponsored' => 'Sponsored content']],
        'sponsor_name' => ['Sponsor / paying organisation (public)', 'text'],
        'disclosure' => ['Sponsorship disclosure (public)', 'textarea'],
        'review_notes' => ['Verification evidence / source checks (private)', 'textarea'],
        'correction' => ['Correction or update note (public)', 'textarea'],
    ];
}
add_action('add_meta_boxes', function () {
    add_meta_box('cfns-publishing', 'ClearFact Verification & Publishing', 'cfns_render', 'post', 'normal', 'high');
});
function cfns_render($post) {
    wp_nonce_field('cfns_save', 'cfns_nonce');
    $can_verify = current_user_can('edit_others_posts');
    echo '<p>Use Categories for the article’s subject. Use Content type for opinion, press releases and paid content. Keep WordPress Publish, author, schedule, visibility, excerpt, featured image and tags as the publishing controls.</p>';
    foreach (cfns_fields() as $key => $field) {
        $value = (string) get_post_meta($post->ID, '_cfns_'.$key, true);
        $id = 'cfns_'.$key;
        echo '<p><label for="'.esc_attr($id).'"><strong>'.esc_html($field[0]).'</strong></label><br>';
        $disabled = $key === 'verification' && !$can_verify ? ' disabled' : '';
        if (is_array($field[1])) {
            echo '<select id="'.esc_attr($id).'" name="'.esc_attr($id).'"'.$disabled.'>';
            foreach ($field[1] as $k => $label) echo '<option value="'.esc_attr($k).'" '.selected($value, $k, false).'>'.esc_html($label).'</option>';
            echo '</select>';
        } elseif ($field[1] === 'textarea') {
            echo '<textarea id="'.esc_attr($id).'" name="'.esc_attr($id).'" rows="3" class="widefat">'.esc_textarea($value).'</textarea>';
        } else {
            echo '<input type="text" id="'.esc_attr($id).'" name="'.esc_attr($id).'" class="widefat" value="'.esc_attr($value).'">';
        }
        echo '</p>';
    }
    echo '<p><strong>Before publishing:</strong> confirm the headline, factual claims, source attribution, category, byline, excerpt, image rights/alt text and any paid-content disclosure. Verification is an editor’s decision; sponsorship never means verified.</p>';
    $reviewer = (int) get_post_meta($post->ID, '_cfns_reviewer', true);
    if ($reviewer && $can_verify) {
        $user = get_userdata($reviewer);
        echo '<p>Verification last recorded by '.esc_html($user ? $user->display_name : 'an editor').' at '.esc_html(get_post_meta($post->ID, '_cfns_reviewed_at', true)).' UTC.</p>';
    }
    if (cfns_is_sponsored($post->ID) && (!get_post_meta($post->ID, '_cfns_sponsor_name', true) || !get_post_meta($post->ID, '_cfns_disclosure', true))) {
        echo '<p style="color:#b32d2e"><strong>Complete the sponsor name and disclosure before publishing paid content.</strong></p>';
    }
    echo '<p>Public URL: <code>'.esc_html('https://clearfact.ng/post/'.rawurlencode(urldecode($post->post_name))).'</code></p>';
}
add_action('save_post_post', function ($post_id) {
    if (!isset($_POST['cfns_nonce']) || !is_string($_POST['cfns_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['cfns_nonce'])), 'cfns_save')) return;
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($post_id) || !current_user_can('edit_post', $post_id)) return;
    foreach (cfns_fields() as $key => $field) {
        if ($key === 'verification' && !current_user_can('edit_others_posts')) continue;
        $raw = isset($_POST['cfns_'.$key]) && is_string($_POST['cfns_'.$key]) ? wp_unslash($_POST['cfns_'.$key]) : '';
        $value = is_array($field[1]) ? (array_key_exists($raw, $field[1]) ? $raw : '') : ($field[1] === 'textarea' ? sanitize_textarea_field($raw) : sanitize_text_field($raw));
        if ($key === 'verification' && $value !== (string) get_post_meta($post_id, '_cfns_verification', true)) {
            update_post_meta($post_id, '_cfns_reviewer', get_current_user_id());
            update_post_meta($post_id, '_cfns_reviewed_at', gmdate('Y-m-d H:i:s'));
        }
        update_post_meta($post_id, '_cfns_'.$key, $value);
    }
});
function cfns_is_sponsored($id) {
    if (get_post_meta($id, '_cfns_content_type', true) === 'sponsored') return true;
    // Honour existing ACF fields without overwriting or registering them again.
    $acf = function_exists('get_fields') ? get_fields($id) : [];
    $flag = is_array($acf) ? ($acf['is_sponsored'] ?? false) : false;
    return in_array($flag, [true, 1, '1', 'yes', 'true'], true)
        || (is_array($acf) && ($acf['verification_status'] ?? '') === 'Sponsored')
        || has_category(['sponsored', 'sponsored-content'], $id);
}
add_action('rest_api_init', function () {
    register_rest_field('post', 'clearfact_publishing', [
        'get_callback' => function ($object) {
            $id = (int) $object['id'];
            // Deliberate allowlist: private evidence and reviewer identity never enter public REST.
            return [
                'verification' => (string) get_post_meta($id, '_cfns_verification', true),
                'content_type' => (string) get_post_meta($id, '_cfns_content_type', true),
                'sponsored' => cfns_is_sponsored($id),
                'sponsor_name' => (string) get_post_meta($id, '_cfns_sponsor_name', true),
                'disclosure' => (string) get_post_meta($id, '_cfns_disclosure', true),
                'correction' => (string) get_post_meta($id, '_cfns_correction', true),
            ];
        },
        'schema' => ['type' => 'object', 'context' => ['view', 'edit'], 'readonly' => true],
    ]);
});
add_filter('manage_post_posts_columns', function ($columns) { $columns['cfns_status'] = 'Editorial status'; return $columns; });
add_action('manage_post_posts_custom_column', function ($column, $id) {
    if ($column !== 'cfns_status') return;
    $status = (string) get_post_meta($id, '_cfns_verification', true);
    echo esc_html(cfns_fields()['verification'][1][$status] ?? 'Not recorded');
    if (cfns_is_sponsored($id)) echo '<br><strong>Sponsored</strong>';
}, 10, 2);
add_action('admin_menu', function () {
    add_submenu_page('edit.php', 'ClearFact Category Guide', 'Category Guide', 'edit_posts', 'clearfact-category-guide', 'cfns_category_guide');
});
function cfns_category_guide() {
    if (!current_user_can('edit_posts')) return;
    echo '<div class="wrap"><h1>ClearFact Category Guide</h1><p>Select the most relevant subject category. Use tags for people, places and organisations. Opinion / Commentary and The Public Conscience remain available. Sponsored is a disclosure, not a verification status. This guide does not rename, merge, move or delete categories.</p><table class="widefat striped"><thead><tr><th>Category</th><th>Slug (preserve)</th><th>Parent</th><th>Posts</th></tr></thead><tbody>';
    $terms = get_terms(['taxonomy' => 'category', 'hide_empty' => false]);
    if (!is_wp_error($terms)) foreach ($terms as $term) {
        $parent = $term->parent ? get_term($term->parent, 'category') : null;
        echo '<tr><td>'.esc_html($term->name).'</td><td>'.esc_html($term->slug).'</td><td>'.esc_html($parent && !is_wp_error($parent) ? $parent->name : 'Top level').'</td><td>'.esc_html($term->count).'</td></tr>';
    }
    echo '</tbody></table><p>Publishing remains governed by the existing WordPress roles and workflow. Search indexing and ad eligibility remain controlled by the existing frontend rules.</p></div>';
}
