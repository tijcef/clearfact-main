<?php
/**
 * Plugin Name: ClearFact Story Inbox
 * Description: Private reader submissions, newsroom notifications and editorial draft creation.
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) { exit; }
add_action('init', function () {
    register_post_type('cf_story_tip', array(
        'labels' => array('name' => 'Story Inbox', 'singular_name' => 'Story Submission'),
        'public' => false, 'publicly_queryable' => false, 'show_ui' => true,
        'show_in_rest' => false, 'exclude_from_search' => true,
        'menu_icon' => 'dashicons-email-alt', 'supports' => array('title', 'editor'),
        'capability_type' => 'post',
        'capabilities' => array('create_posts' => 'do_not_allow', 'edit_posts' => 'edit_others_posts', 'edit_others_posts' => 'edit_others_posts', 'read_private_posts' => 'edit_others_posts'),
        'map_meta_cap' => true,
    ));
});
add_action('rest_api_init', function () {
    register_rest_route('wp/v2', '/clearfact-story-tip', array(
        'methods' => 'POST', 'permission_callback' => '__return_true',
        'callback' => function ($request) {
            $data = $request->get_json_params();
            if (!is_array($data)) { return new WP_Error('invalid_tip', 'Invalid submission.', array('status' => 400)); }
            foreach (array('subject', 'story', 'evidence', 'contact', 'sender_name', 'name_credit', 'website') as $key) {
                if (isset($data[$key]) && !is_string($data[$key])) { return new WP_Error('invalid_tip', 'Invalid submission.', array('status' => 400)); }
            }
            if (!empty($data['website'])) { return new WP_Error('invalid_tip', 'Submission could not be accepted.', array('status' => 400)); }
            $subject = sanitize_text_field($data['subject'] ?? '');
            $story = sanitize_textarea_field($data['story'] ?? '');
            $name = sanitize_text_field($data['sender_name'] ?? '');
            $credit = ($data['name_credit'] ?? '') === 'publish' ? 'publish' : 'private';
            if (strlen($subject) < 3 || strlen($subject) > 240 || strlen($story) < 30 || strlen($story) > 30000 || ($credit === 'publish' && !$name)) {
                return new WP_Error('invalid_tip', 'Enter a subject and at least 30 characters of story details. Add your name if you request public credit.', array('status' => 400));
            }
            // Only trust the network peer; never accept a client-supplied IP header.
            $key = 'cf_tip_' . hash_hmac('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''), wp_salt('nonce'));
            $attempts = (int) get_transient($key);
            if ($attempts >= 20) { return new WP_Error('tip_limit', 'Too many submissions. Please try again later or contact the editorial desk.', array('status' => 429)); }
            set_transient($key, $attempts + 1, 10 * MINUTE_IN_SECONDS);
            $fingerprint = 'cf_tip_dup_' . hash('sha256', $subject . "\n" . $story);
            if (get_transient($fingerprint)) { return new WP_REST_Response(array('received' => true), 200); }
            $id = wp_insert_post(array('post_type' => 'cf_story_tip', 'post_status' => 'private', 'post_title' => $subject, 'post_content' => $story, 'post_author' => 0), true);
            if (is_wp_error($id)) { return new WP_Error('tip_failed', 'Could not save your submission. Please try again.', array('status' => 500)); }
            update_post_meta($id, '_cf_tip_name', substr($name, 0, 120));
            update_post_meta($id, '_cf_tip_credit', $credit);
            update_post_meta($id, '_cf_tip_contact', substr(sanitize_text_field($data['contact'] ?? ''), 0, 300));
            update_post_meta($id, '_cf_tip_evidence', substr(sanitize_textarea_field($data['evidence'] ?? ''), 0, 10000));
            set_transient($fingerprint, 1, DAY_IN_SECONDS);
            wp_mail(get_option('admin_email'), 'ClearFact: New story awaiting review', "A reader submission is waiting in WordPress Story Inbox.\n\nReview: " . admin_url('post.php?post=' . $id . '&action=edit') . "\n\nNo story has been published automatically.");
            return new WP_REST_Response(array('received' => true), 201);
        },
    ));
});
add_action('admin_notices', function () {
    if (!current_user_can('edit_others_posts')) { return; }
    $query = new WP_Query(array('post_type' => 'cf_story_tip', 'post_status' => 'private', 'posts_per_page' => 1, 'fields' => 'ids', 'meta_query' => array(array('key' => '_cf_tip_draft', 'compare' => 'NOT EXISTS'))));
    if ($query->found_posts) {
        echo '<div class="notice notice-info"><p><strong>ClearFact:</strong> ' . (int) $query->found_posts . ' reader submission(s) awaiting review. <a href="' . esc_url(admin_url('edit.php?post_type=cf_story_tip')) . '">Open Story Inbox</a></p></div>';
    }
});
add_action('add_meta_boxes_cf_story_tip', function ($post) {
    add_meta_box('cf-tip-review', 'Editorial review and source privacy', function ($post) {
        $credit = get_post_meta($post->ID, '_cf_tip_credit', true);
        foreach (array('Name' => '_cf_tip_name', 'Contact (private)' => '_cf_tip_contact', 'Evidence (private)' => '_cf_tip_evidence') as $label => $key) {
            echo '<p><strong>' . esc_html($label) . ':</strong> ' . nl2br(esc_html(get_post_meta($post->ID, $key, true))) . '</p>';
        }
        echo '<p><strong>Credit preference:</strong> ' . ($credit === 'publish' ? 'Permission to publish the supplied name.' : 'Keep the sender name private.') . '</p>';
        echo '<p>Verify the claims, edit the story and check for identifying details before publication. Creating a draft does not publish the story.</p>';
        $draft = (int) get_post_meta($post->ID, '_cf_tip_draft', true);
        if ($draft) { echo '<a class="button" href="' . esc_url(get_edit_post_link($draft)) . '">Open editorial draft</a>'; }
        elseif (current_user_can('edit_posts')) {
            $url = wp_nonce_url(admin_url('admin-post.php?action=cf_tip_draft&tip=' . $post->ID), 'cf_tip_draft_' . $post->ID);
            echo '<a class="button button-primary" href="' . esc_url($url) . '">Create editorial draft</a>';
        }
    }, 'cf_story_tip', 'normal', 'high');
});
add_action('admin_post_cf_tip_draft', function () {
    $id = absint($_GET['tip'] ?? 0);
    check_admin_referer('cf_tip_draft_' . $id);
    if (!current_user_can('edit_others_posts') || !current_user_can('edit_posts') || get_post_type($id) !== 'cf_story_tip') { wp_die('Not permitted.'); }
    $draft = (int) get_post_meta($id, '_cf_tip_draft', true);
    if (!$draft) {
        $tip = get_post($id);
        $body = $tip->post_content;
        if (get_post_meta($id, '_cf_tip_credit', true) === 'publish') {
            $body .= "\n\nContributed by " . get_post_meta($id, '_cf_tip_name', true);
        }
        $draft = wp_insert_post(array('post_type' => 'post', 'post_status' => 'draft', 'post_author' => get_current_user_id(), 'post_title' => $tip->post_title, 'post_content' => wpautop(esc_html($body))), true);
        if (is_wp_error($draft)) { wp_die('Could not create the draft. Please try again.'); }
        update_post_meta($id, '_cf_tip_draft', $draft);
    }
    wp_safe_redirect(get_edit_post_link($draft, 'raw')); exit;
});
