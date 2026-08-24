<?php
/**
 * ClearFact one-time WordPress subcategory cleanup.
 *
 * Run from the WordPress installation with:
 *   wp eval-file backend-tools/remove-empty-categories.php
 *
 * Keeps every top-level category and the Elections subcategory. Before any
 * other subcategory is deleted, its posts are assigned to its top-level parent
 * category so no article is deleted or left without a useful category.
 */

if (!defined('ABSPATH')) {
    fwrite(STDERR, "Run this file through WP-CLI: wp eval-file backend-tools/remove-empty-categories.php\n");
    exit(1);
}

$kept_subcategory_slugs = ['elections'];
$default_category = (int) get_option('default_category');

$terms = get_terms([
    'taxonomy'   => 'category',
    'hide_empty' => false,
]);

if (is_wp_error($terms)) {
    fwrite(STDERR, "Unable to load categories: {$terms->get_error_message()}\n");
    exit(1);
}

$terms_by_id = [];

foreach ($terms as $term) {
    $terms_by_id[(int) $term->term_id] = $term;
}

$top_level_parent = static function ($term) use ($terms_by_id, &$default_category) {
    $seen = [];
    $current = $term;

    while ((int) $current->parent > 0) {
        $parent_id = (int) $current->parent;

        if (isset($seen[$parent_id]) || !isset($terms_by_id[$parent_id])) {
            return $default_category;
        }

        $seen[$parent_id] = true;
        $current = $terms_by_id[$parent_id];
    }

    return (int) $current->term_id;
};

$term_depth = static function ($term) use ($terms_by_id) {
    $depth = 0;
    $seen = [];
    $parent_id = (int) $term->parent;

    while ($parent_id > 0 && isset($terms_by_id[$parent_id]) && !isset($seen[$parent_id])) {
        $seen[$parent_id] = true;
        $depth++;
        $parent_id = (int) $terms_by_id[$parent_id]->parent;
    }

    return $depth;
};

$removable_terms = array_values(array_filter(
    $terms,
    static function ($term) use ($kept_subcategory_slugs) {
        return (int) $term->parent > 0
            && !in_array(strtolower($term->slug), $kept_subcategory_slugs, true);
    }
));

usort($removable_terms, static function ($a, $b) use ($term_depth) {
    return $term_depth($b) <=> $term_depth($a);
});

$default_term = $terms_by_id[$default_category] ?? null;

if ($default_term && in_array($default_term, $removable_terms, true)) {
    $replacement_default = $top_level_parent($default_term);

    if ($replacement_default > 0 && $replacement_default !== $default_category) {
        update_option('default_category', $replacement_default);
        $default_category = $replacement_default;
        printf("UPDATED default category to term ID %d.\n", $replacement_default);
    }
}

$deleted = 0;
$reassigned_posts = 0;
$failed = 0;

foreach ($removable_terms as $term) {
    $destination_id = $top_level_parent($term);

    if ($destination_id <= 0 || $destination_id === (int) $term->term_id) {
        $destination_id = $default_category;
    }

    $post_ids = get_objects_in_term((int) $term->term_id, 'category');

    if (is_wp_error($post_ids)) {
        printf("FAILED to load posts for %s (%s): %s\n", $term->name, $term->slug, $post_ids->get_error_message());
        $failed++;
        continue;
    }

    foreach (array_unique(array_map('intval', $post_ids)) as $post_id) {
        $result = wp_set_post_categories($post_id, [$destination_id], true);

        if (is_wp_error($result)) {
            printf("FAILED to reassign post %d from %s: %s\n", $post_id, $term->slug, $result->get_error_message());
            $failed++;
            continue 2;
        }

        $reassigned_posts++;
    }

    $result = wp_delete_term((int) $term->term_id, 'category');

    if (is_wp_error($result)) {
        printf("FAILED to delete %s (%s): %s\n", $term->name, $term->slug, $result->get_error_message());
        $failed++;
        continue;
    }

    printf(
        "DELETED subcategory: %s (%s); reassigned %d posts to term ID %d.\n",
        $term->name,
        $term->slug,
        count($post_ids),
        $destination_id
    );
    $deleted++;
}

printf(
    "\nDone. Kept Elections; deleted %d subcategories; processed %d post assignments; failures %d.\n",
    $deleted,
    $reassigned_posts,
    $failed
);
