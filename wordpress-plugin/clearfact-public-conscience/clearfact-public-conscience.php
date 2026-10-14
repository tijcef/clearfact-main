<?php
/**
 * Plugin Name: ClearFact Public Conscience
 * Description: Adds commentary and video categories, editorial bylines and an optional first draft. Does not change ads, URLs or SEO settings.
 * Version: 1.1.0
 */
if (!defined('ABSPATH')) exit;
function cf_column_term($name, $slug, $description, $parent = 0) {
    $existing = get_term_by('slug', $slug, 'category');
    if ($existing) return (int) $existing->term_id;
    $result = wp_insert_term($name, 'category', array('slug' => $slug, 'description' => $description, 'parent' => $parent));
    return is_wp_error($result) ? $result : (int) $result['term_id'];
}
register_activation_hook(__FILE__, function () {
    $opinion = cf_column_term('Opinion / Commentary', 'opinion-commentary', 'Clearly labelled opinions and commentary on governance, accountability and public life.');
    if (is_wp_error($opinion)) wp_die(esc_html($opinion->get_error_message()));
    $column = cf_column_term('The Public Conscience', 'the-public-conscience', 'Emmanuel Sunday Tijwun writes on governance, human dignity and public accountability.', $opinion);
    $community = cf_column_term('Community', 'community', 'Local reporting on everyday concerns, essential services, community achievements and public accountability.');
    $video = cf_column_term('Video', 'video', 'ClearFact video reports, interviews and commentary.');
    foreach (array($column, $video, $community) as $term) if (is_wp_error($term)) wp_die(esc_html($term->get_error_message()));
});
add_action('rest_api_init', function () {
    register_rest_field('post', 'clearfact_column', array('get_callback' => function ($object) {
        if (!has_category('the-public-conscience', $object['id'])) return null;
        return array('name' => 'The Public Conscience', 'byline' => 'Emmanuel Sunday Tijwun', 'designation' => 'Public Affairs and Humanitarian Affairs Commentator');
    }));
});
add_action('admin_menu', function () {
    add_management_page('The Public Conscience', 'The Public Conscience', 'edit_posts', 'clearfact-column', function () {
        echo '<div class="wrap"><h1>The Public Conscience</h1><p>Assign column articles to both Opinion / Commentary and The Public Conscience. For community reports use the Community category. Readers can send tips through clearfact.ng/submit-story for editorial review. For videos use the Video category and a WordPress Video or Embed block. Add a featured image before publication.</p><p>This column displays Emmanuel Sunday Tijwun as its byline. Use it only for his commentary.</p><form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';
        wp_nonce_field('cf_column_draft');
        echo '<input type="hidden" name="action" value="cf_column_draft">';
        submit_button('Create first commentary draft');
        echo '</form></div>';
    });
});
add_action('admin_post_cf_column_draft', function () {
    if (!current_user_can('edit_posts')) wp_die('Not permitted');
    check_admin_referer('cf_column_draft');
    $existing = get_option('cf_column_first_draft');
    if ($existing && get_post($existing)) { wp_safe_redirect(admin_url('post.php?post='.(int)$existing.'&action=edit')); exit; }
    $categories = array();
    foreach (array('opinion-commentary', 'the-public-conscience') as $slug) {
        $term = get_term_by('slug', $slug, 'category');
        if (!$term) wp_die('Required category missing. Reactivate this plugin to create it.');
        $categories[] = (int)$term->term_id;
    }
    $tags = array();
    foreach (array('Nigeria', 'Governance', 'Leadership', 'Accountability', 'Public Policy') as $name) {
        $term = term_exists($name, 'post_tag');
        if (!$term) $term = wp_insert_term($name, 'post_tag');
        if (is_wp_error($term)) wp_die(esc_html($term->get_error_message()));
        $tags[] = (int)(is_array($term) ? $term['term_id'] : $term);
    }
    $content = file_get_contents(__DIR__.'/first-commentary.html');
    $id = wp_insert_post(array('post_title' => 'Nigeria Must Work for Nigerians, Not Just Those in Power', 'post_name' => 'nigeria-must-work-for-nigerians-not-just-those-in-power', 'post_status' => 'draft', 'post_author' => get_current_user_id(), 'post_category' => $categories, 'tags_input' => $tags, 'post_content' => wp_kses_post($content), 'post_excerpt' => 'Government earns public trust when it protects human dignity, delivers essential services and answers to the people.'), true);
    if (is_wp_error($id)) wp_die(esc_html($id->get_error_message()));
    update_option('cf_column_first_draft', $id, false);
    wp_safe_redirect(admin_url('post.php?post='.$id.'&action=edit')); exit;
});
