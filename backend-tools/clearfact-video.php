<?php
/**
 * Plugin Name: ClearFact Video Link
 * Description: Adds an optional YouTube video link to posts for the ClearFact frontend.
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) { exit; }

function clearfact_video_clean_url($value) {
    $url = esc_url_raw(trim((string) $value));
    $host = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
    if (!in_array($host, array('youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'), true)) { return ''; }
    $path = (string) wp_parse_url($url, PHP_URL_PATH);
    $id = '';
    if ($host === 'youtu.be') { $id = trim($path, '/'); }
    elseif (preg_match('~^/(shorts|embed|live)/([a-zA-Z0-9_-]{11})/?$~', $path, $match)) { $id = $match[2]; }
    elseif ($path === '/watch') {
        parse_str((string) wp_parse_url($url, PHP_URL_QUERY), $query);
        $id = isset($query['v']) && is_string($query['v']) ? $query['v'] : '';
    }
    return preg_match('/^[a-zA-Z0-9_-]{11}$/', $id) ? $url : '';
}
add_action('init', function () {
    register_post_meta('post', '_clearfact_video_url', array(
        'type' => 'string', 'single' => true, 'show_in_rest' => true,
        'sanitize_callback' => 'clearfact_video_clean_url',
        'auth_callback' => function ($allowed, $key, $post_id) { return current_user_can('edit_post', $post_id); },
    ));
    register_rest_field('post', 'clearfact_video_url', array(
        'get_callback' => function ($post) { return clearfact_video_clean_url(get_post_meta($post['id'], '_clearfact_video_url', true)); },
        'schema' => array('type' => 'string', 'context' => array('view', 'edit')),
    ));
});
add_action('add_meta_boxes', function () {
    add_meta_box('clearfact-video-link', 'YouTube Video Link', function ($post) {
        wp_nonce_field('clearfact_video_save', 'clearfact_video_nonce');
        $value = get_post_meta($post->ID, '_clearfact_video_url', true);
        echo '<p>Paste a YouTube, Shorts or youtu.be link. ClearFact displays the video above the article.</p>';
        echo '<input type="url" name="clearfact_video_url" style="width:100%" placeholder="https://www.youtube.com/watch?v=…" value="' . esc_attr($value) . '">';
        echo '<p>Keep using your normal featured image and categories. Leave empty for articles without a video.</p>';
    }, 'post', 'normal', 'high');
});
add_action('save_post_post', function ($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) { return; }
    if (wp_is_post_revision($post_id) || !current_user_can('edit_post', $post_id)) { return; }
    if (!isset($_POST['clearfact_video_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['clearfact_video_nonce'])), 'clearfact_video_save')) { return; }
    if (!isset($_POST['clearfact_video_url']) || !is_string($_POST['clearfact_video_url'])) { return; }
    $raw = trim(wp_unslash($_POST['clearfact_video_url']));
    $clean = clearfact_video_clean_url($raw);
    // An invalid entry must not erase a previously saved working link.
    if ($raw !== '' && $clean === '') { return; }
    if ($clean === '') { delete_post_meta($post_id, '_clearfact_video_url'); }
    else { update_post_meta($post_id, '_clearfact_video_url', $clean); }
});
