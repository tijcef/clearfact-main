<?php
/**
 * ClearFact one-time WordPress cleanup.
 *
 * Run from the WordPress installation with:
 *   wp eval-file backend-tools/remove-empty-categories.php
 *
 * Deletes only WordPress categories whose post count is exactly zero.
 * The current default category is preserved.
 */

if (!defined('ABSPATH')) {
    fwrite(STDERR, "Run this file through WP-CLI: wp eval-file backend-tools/remove-empty-categories.php\n");
    exit(1);
}

$default_category = (int) get_option('default_category');
$terms = get_terms([
    'taxonomy'   => 'category',
    'hide_empty' => false,
]);

if (is_wp_error($terms)) {
    fwrite(STDERR, "Unable to load categories: {$terms->get_error_message()}\n");
    exit(1);
}

$deleted = 0;
$skipped = 0;

foreach ($terms as $term) {
    if ((int) $term->count !== 0) {
        continue;
    }

    if ((int) $term->term_id === $default_category) {
        printf("SKIP default category: %s (%s)\n", $term->name, $term->slug);
        $skipped++;
        continue;
    }

    $result = wp_delete_term((int) $term->term_id, 'category');

    if (is_wp_error($result)) {
        printf("FAILED: %s (%s): %s\n", $term->name, $term->slug, $result->get_error_message());
        $skipped++;
        continue;
    }

    printf("DELETED empty category: %s (%s)\n", $term->name, $term->slug);
    $deleted++;
}

printf("\nDone. Deleted %d empty categories; skipped %d.\n", $deleted, $skipped);
