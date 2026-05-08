<?php
/**
 * Plugin Name: Video Sow
 * Plugin URI: https://kindpixels.com/plugins/video-sow/
 * Description: Automatically convert YouTube playlist videos into WordPress articles, with optional transcript and AI processing.
 * Version: 1.2.3
 * Author: KIND PIXELS
 * Author URI: https://kindpixels.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: video-sow
 * Requires at least: 5.8
 * Tested up to: 6.9
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( defined( 'VIDEOSOW_PLUGIN_LOADED' ) ) { return; }
define( 'VIDEOSOW_PLUGIN_LOADED', true );
define( 'VIDEOSOW_VERSION', '1.2.4' );

/**
 * Activation: flag a one-time redirect so the user lands on the Video Sow dashboard
 * (not the WP plugin list) right after activating the plugin.
 */
register_activation_hook( __FILE__, 'videosow_on_activate' );
function videosow_on_activate() {
    set_transient( 'videosow_activation_redirect', 1, 60 );
}
add_action( 'admin_init', 'videosow_maybe_redirect_after_activation' );
function videosow_maybe_redirect_after_activation() {
    if ( ! get_transient( 'videosow_activation_redirect' ) ) return;
    delete_transient( 'videosow_activation_redirect' );
    if ( wp_doing_ajax() || wp_doing_cron() ) return;
    // Don't hijack bulk activations.
    if ( isset( $_GET['activate-multi'] ) ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;
    wp_safe_redirect( admin_url( 'admin.php?page=video-sow' ) );
    exit;
}

// Freemius SDK Initialization
if ( ! function_exists( 'videosow_fs' ) ) {
    function videosow_fs() {
        global $videosow_fs_instance;
        if ( ! isset( $videosow_fs_instance ) ) {
            $paths = array(
                dirname( __FILE__ ) . '/freemius/start.php',
                dirname( __FILE__ ) . '/vendor/freemius/start.php',
            );
            $sdk_loaded = false;
            foreach ( $paths as $sdk_path ) {
                if ( file_exists( $sdk_path ) ) { require_once $sdk_path; $sdk_loaded = true; break; }
            }
            if ( $sdk_loaded && function_exists( 'fs_dynamic_init' ) ) {
                $is_premium_build = file_exists( dirname( __FILE__ ) . '/dist/.pro-build' );
                if ( $is_premium_build ) {
                    try {
                        if ( ! function_exists( 'get_file_data' ) ) {
                            $plugin_php = ABSPATH . 'wp-admin/includes/plugin.php';
                            if ( file_exists( $plugin_php ) ) require_once $plugin_php;
                        }
                        if ( function_exists( 'get_file_data' ) ) {
                            $header = get_file_data( __FILE__, array( 'Name' => 'Plugin Name' ), 'plugin' );
                            $plugin_name = isset( $header['Name'] ) ? (string) $header['Name'] : '';
                            if ( stripos( $plugin_name, 'pro' ) === false ) $is_premium_build = false;
                        }
                    } catch ( Throwable $e ) { $is_premium_build = false; }
                }
                $videosow_fs_instance = fs_dynamic_init( array(
                    'id'                => '20814',
                    'slug'              => 'video-sow',
                    'premium_slug'      => 'video-sow-pro',
                    'premium_suffix'    => 'Pro',
                    'type'              => 'plugin',
                    'public_key'        => 'pk_349523fbf9f410023e4e5a4faa9b8',
                    'is_premium'        => $is_premium_build,
                    'is_premium_only'   => false,
                    'is_org_compliant'  => ! $is_premium_build,
                    'has_addons'        => false,
                    'has_paid_plans'    => true,
                    'anonymous_mode'    => ! $is_premium_build,
                    'opt_in_moderation' => array( 'new' => 0, 'updates' => 0, 'localhost' => false ),
                    'menu'              => array(
                        'slug'       => 'video-sow',
                        'first-path' => 'admin.php?page=video-sow',
                        'account'    => $is_premium_build,
                        'support'    => false,
                    ),
                ) );
                if ( is_object( $videosow_fs_instance ) && method_exists( $videosow_fs_instance, 'set_basename' ) ) {
                    $videosow_fs_instance->set_basename( false, __FILE__ );
                }
            } else {
                $videosow_fs_instance = new stdClass();
            }
        }
        return $videosow_fs_instance;
    }
    videosow_fs();
    do_action( 'videosow_fs_loaded' );
}

class VideoSow_Plugin {
    public function __construct() { add_action( 'init', array( $this, 'init' ) ); }

    public function init() {
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        // Late hook so the CPT's auto-attached submenu is already in place.
        add_action( 'admin_menu', array( $this, 'rename_dashboard_submenu' ), 999 );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
        add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( $this, 'plugin_action_links' ), 99, 1 );
        add_action( 'admin_print_styles', array( $this, 'hide_other_plugin_notices' ) );
    }

    public function add_admin_menu() {
        // Simple "play in grid" SVG icon for Video Sow
        $icon_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10000 10000"><path fill="black" d="M5077.58 271.49c359.5,148.68 639.53,490.99 798.78,835.37 183.34,396.52 181.43,795.95 7.72,1194.2 -51.71,118.55 -118.41,232.85 -164.61,353.5 -43.98,132.79 -62.72,328.88 -96.15,474.35 -19.51,85.06 -52.7,236.61 -56.3,323.98 -0.38,10.18 6.81,11.22 17.59,18.23 37.48,-3.19 304.12,-157.63 340.15,-183.27 271,-193 829,-324 1020.6,-576.51 690.01,-909.09 1876.59,-814.34 2722.04,-196.94 83.68,61.07 168.2,123.27 239.64,201.8 -103.03,228.7 -380.15,513.57 -561.97,672.79 -589.89,516.47 -1421.71,658.43 -2112.11,250.85 -246.76,-145.68 -179.91,-184.89 41.38,-304.79 275.82,-149.44 564.04,-240.67 863.19,-329.11 132.86,-40.26 327.53,-74.61 446.47,-130.58l10.17 -4.83c-594.94,-109.81 -1475.79,218.39 -1985.68,511.71 -1120.8,644.89 -1931.2,1444.48 -2279.94,2714.28 -90.64,326.76 -129.66,665.69 -115.66,1004.54 1.83,43.45 1.07,195.43 52.17,204.53 107.26,-31.66 261.91,-129.27 365.47,-187.56l597.72 -339.23 1062.67 -606.03c137.15,-78.39 522.73,-275.28 613.06,-375.26 82.68,-92.86 125.52,-214.56 119.09,-338.77 -16.75,-321.87 -325.31,-427.2 -548.35,-556.08 -142.04,-82.15 -497.36,-263.7 -598.71,-354.85 60.97,-113.27 630.89,-539.69 761.76,-580 128.2,32.17 644.76,351.05 764.16,434.59 51.79,35.79 100.51,75.79 145.71,119.59 547.29,527.61 543.46,1408.01 0.54,1935.1 -184.19,178.83 -404.25,285.85 -625.84,410.68l-573.67 323.47 -2038.93 1158.97 -1449.2 827.69 -488.8 276.05c-94.5,52.78 -195.72,113.44 -294.06,157.34 -508.17,227.25 -1169.73,118.56 -1564.3,-278.42 -244.27,-245.83 -384.72,-561.59 -412.43,-905.02 -11.19,-138.68 -7.41,-283.78 -7.43,-422.45l-0.04 -629.66 0.12 -4596.41c0.98,-450.57 100.14,-796.48 426.67,-1129.65 245.33,-250.33 657.73,-402.04 1005.63,-397.18 199.26,4 395.99,45.52 579.89,122.38 122.52,52.54 280.11,149.29 399.04,218.46l519.13 298.14c465.97,264.44 930.36,531.69 1393.11,801.72 86.23,50.97 222.69,125.22 279.03,182.78 -64.64,227.45 -242.3,626.93 -391.13,809.95 -65.63,-29.38 -50.3,-30.2 -115.91,-67.96l-411.85 -235.81 -1463.21 -838.26c-136.83,-78.75 -449.4,-272.56 -580.87,-331.11 -62,-28.12 -128.72,-44.37 -196.7,-47.92 -145.89,-6.97 -250.19,40.36 -359.5,135.25 -117.52,102.01 -147.8,233.6 -151.75,383.2 -3.69,139.46 -1.87,284.58 -1.69,425.41l0.63 745.4 0.61 2348.46 -0.1 1415.9c-0.17,174.09 -10.85,590.43 7.24,747.15 13.56,110.3 61.13,213.63 136.11,295.71 154.18,165.76 402.02,175.93 594.06,81.92 112.74,-55.23 211.89,-111.9 320.64,-174.02l491.78 -282.01c146.11,-83.91 679.24,-376.1 774.98,-466.44 39.51,-100.13 34.48,-482.57 41.91,-615.06 8.93,-154.28 24.13,-308.1 45.55,-461.15 29.42,-209.13 63.43,-359.73 53.79,-575.74 -10.18,-202.31 -52.68,-401.73 -125.87,-590.58 -121.09,-313.83 -420.56,-796.77 -732.59,-936 41.78,85.86 106.08,194.66 155.79,275.28 113.67,184.49 392.02,703.17 337.89,906.48 -22.93,13.92 -40.24,15.52 -67.2,11.16 -937.76,-152.36 -1342.57,-1092.38 -1230.52,-1957.84 5.29,-157.68 197.98,-116.78 310.83,-105.19 756.76,77.65 1495.09,608.44 1590.8,1402.7 6.48,53.77 30.06,250.19 91.03,256.09 52.96,-47.35 158.91,-275.67 201.77,-353.69 53.42,-96.6 109.38,-191.83 167.82,-285.51 197.9,-314.4 503.87,-665.69 679.96,-972.37 113.18,-200.68 208.71,-410.79 285.58,-627.97 164.84,-458.31 256.63,-899.88 212.95,-1390.06 -12.16,-136.5 -41.53,-293.41 -100.35,-418.11 -27.54,121.81 -34.27,319.15 -43.91,449.82 -12.62,192.88 -38.78,384.63 -78.32,573.84 -12.17,57.7 -26.17,172.47 -92.4,180.33 -59.43,-18.91 -141.66,-113.33 -183.55,-161.41 -248.85,-285.49 -354.47,-592.79 -329.18,-970.27 25.76,-384.34 245.02,-931.99 536.37,-1184.11z"/></svg>';
        $icon_base64 = 'data:image/svg+xml;base64,' . base64_encode( $icon_svg );
        add_menu_page( 'Video Sow', 'Video Sow', 'manage_options', 'video-sow', array( $this, 'render_admin_page' ), $icon_base64, 100 );
        // Explicit Dashboard submenu — guarantees it exists even when the CPT's
        // show_in_menu auto-attachment runs before our add_menu_page (in which
        // case WP skips the auto-mirror because $submenu['video-sow'] is non-empty).
        add_submenu_page(
            'video-sow',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'video-sow',
            array( $this, 'render_admin_page' )
        );
        // Explicit Tags submenu (so it appears under the Video Sow parent — the
        // taxonomy is not auto-attached when its CPT uses show_in_menu=parent).
        add_submenu_page(
            'video-sow',
            'Tags',
            'Tags',
            'manage_categories',
            'edit-tags.php?taxonomy=videosow_tag&post_type=videosow_video'
        );
    }

    /**
     * Reorder the Video Sow submenu so Dashboard is first, then Articles, then
     * Tags (and any Freemius-injected entries). Also rename the auto-mirror to
     * "Dashboard" if it is the one rendering the parent slug.
     */
    public function rename_dashboard_submenu() {
        global $submenu;
        if ( ! isset( $submenu['video-sow'] ) ) return;
        // Deduplicate Dashboard rows — both add_menu_page mirror and our
        // explicit add_submenu_page can each register one with slug 'video-sow'.
        $seen_dash = false;
        foreach ( $submenu['video-sow'] as $idx => $row ) {
            if ( isset( $row[2] ) && $row[2] === 'video-sow' ) {
                if ( $seen_dash ) { unset( $submenu['video-sow'][ $idx ] ); continue; }
                $submenu['video-sow'][ $idx ][0] = 'Dashboard';
                $seen_dash = true;
            }
        }
        // Sort: Dashboard first, then Articles (edit.php?post_type=videosow_video),
        // then Tags, then everything else (Freemius pages, etc.) preserving order.
        $rank = function( $row ) {
            $slug = isset( $row[2] ) ? $row[2] : '';
            if ( $slug === 'video-sow' ) return 0;
            if ( strpos( $slug, 'post_type=videosow_video' ) !== false && strpos( $slug, 'edit.php' ) === 0 ) return 1;
            if ( strpos( $slug, 'taxonomy=videosow_tag' ) !== false ) return 2;
            if ( strpos( $slug, 'post-new.php?post_type=videosow_video' ) !== false ) return 3;
            return 10;
        };
        $rows = array_values( $submenu['video-sow'] );
        $idx = 0;
        usort( $rows, function( $a, $b ) use ( $rank, &$idx ) {
            $ra = $rank( $a ); $rb = $rank( $b );
            if ( $ra !== $rb ) return $ra - $rb;
            return 0;
        } );
        $submenu['video-sow'] = $rows;
    }

    public function hide_other_plugin_notices() {
        $screen = get_current_screen();
        if ( ! $screen || strpos( $screen->id, 'video-sow' ) === false ) return;
        echo '<style>
            body.videosow-admin-page #wpbody-content > .notice,
            body.videosow-admin-page #wpbody-content > .updated,
            body.videosow-admin-page .wrap > .notice,
            body.videosow-admin-page .wrap > .updated,
            body.videosow-admin-page div[class*="notice"],
            body.videosow-admin-page div[class*="update"] { display:none !important; }
            body.videosow-admin-page .notice-error,
            body.videosow-admin-page .notice-warning,
            body.videosow-admin-page .update-nag { display:block !important; }
        </style>';
    }

    private function get_asset_url( $type ) {
        $plugin_dir = plugin_dir_path( __FILE__ );
        $plugin_url = plugin_dir_url( __FILE__ );
        $predictable = $plugin_dir . 'dist/assets/index.' . $type;
        if ( file_exists( $predictable ) ) return $plugin_url . 'dist/assets/index.' . $type;
        $dist_dir = $plugin_dir . 'dist/assets/';
        if ( is_dir( $dist_dir ) ) {
            foreach ( scandir( $dist_dir ) as $file ) {
                if ( $type === 'js' && preg_match( '/index-[a-zA-Z0-9]+\\.js$/', $file ) ) return $plugin_url . 'dist/assets/' . $file;
                if ( $type === 'css' && preg_match( '/index-[a-zA-Z0-9]+\\.css$/', $file ) ) return $plugin_url . 'dist/assets/' . $file;
            }
        }
        return false;
    }

    public function enqueue_admin_scripts( $hook_suffix ) {
        if ( $hook_suffix !== 'toplevel_page_video-sow' ) return;
        wp_enqueue_media();
        $js_file  = $this->get_asset_url( 'js' );
        $css_file = $this->get_asset_url( 'css' );
        if ( ! $js_file || ! $css_file ) {
            add_action( 'admin_notices', function() {
                echo '<div class="notice notice-error"><p>Video Sow: Plugin assets not found. Please rebuild the plugin (npm run build).</p></div>';
            } );
            return;
        }
        wp_enqueue_script( 'videosow-admin', $js_file, array( 'updates' ), VIDEOSOW_VERSION, true );
        wp_script_add_data( 'videosow-admin', 'type', 'module' );
        wp_enqueue_style( 'videosow-admin', $css_file, array(), VIDEOSOW_VERSION );

        // Freemius helper URLs and current license state
        $fs_account_url = ''; $fs_pricing_url = ''; $fs_is_pro = false; $fs_status = 'free';
        $fs_available = false; $fs_licensed_to = '';
        if ( function_exists( 'videosow_fs' ) ) {
            $fs = videosow_fs();
            if ( is_object( $fs ) ) {
                if ( method_exists( $fs, 'get_account_url' ) ) $fs_account_url = $fs->get_account_url();
                if ( method_exists( $fs, 'get_upgrade_url' ) ) $fs_pricing_url = $fs->get_upgrade_url();
                $fs_available = (
                    method_exists( $fs, 'can_use_premium_code' ) ||
                    method_exists( $fs, 'is_premium' ) ||
                    method_exists( $fs, 'is_paying' )
                );
                if ( method_exists( $fs, 'can_use_premium_code' ) && $fs->can_use_premium_code() ) { $fs_is_pro = true; $fs_status = 'pro'; }
                elseif ( method_exists( $fs, 'is_paying' ) && $fs->is_paying() ) { $fs_is_pro = true; $fs_status = 'pro'; }
                elseif ( method_exists( $fs, 'is_trial' ) && $fs->is_trial() ) { $fs_is_pro = true; $fs_status = 'trial'; }
                if ( $fs_is_pro && method_exists( $fs, 'get_user' ) ) {
                    $user = $fs->get_user();
                    if ( is_object( $user ) && isset( $user->email ) ) $fs_licensed_to = $user->email;
                }
            }
        }

        wp_localize_script( 'videosow-admin', 'videosowData', array(
            'isAdmin'       => current_user_can( 'manage_options' ),
            'nonce'         => wp_create_nonce( 'videosow_nonce' ),
            'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
            'adminPageUrl'  => admin_url( 'admin.php?page=video-sow' ),
            'fsAccountUrl'  => $fs_account_url,
            'fsPricingUrl'  => $fs_pricing_url,
            'fsIsPro'       => $fs_is_pro,
            'fsStatus'      => $fs_status,
            'fsAvailable'   => $fs_available,
            'licensedTo'    => $fs_licensed_to,
            'pluginBasename'=> plugin_basename( __FILE__ ),
        ) );
    }

    public function render_admin_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'video-sow' ) );
        }
        echo '<script>document.body.classList.add("videosow-admin-page");</script>';
        echo '<style>.wrap > h1:first-child{display:none !important;}</style>';
        echo '<div class="wrap videosow-admin-page">';
        echo '<div id="videosow-root" style="margin-top:0;"></div>';
        echo '</div>';
        $this->print_postmessage_bridge();
    }

    /**
     * Same-window postMessage → admin-ajax bridge.
     * The React useImporter hook posts videosow_* events; we forward each one
     * to its matching wp_ajax_videosow_* action and post the result back.
     */
    private function print_postmessage_bridge() {
        $nonce    = wp_create_nonce( 'videosow_nonce' );
        $ajax_url = admin_url( 'admin-ajax.php' );
        ?>
        <script>
        (function(){
            var ajaxUrl = <?php echo wp_json_encode( $ajax_url ); ?>;
            var nonce   = <?php echo wp_json_encode( $nonce ); ?>;
            // Map: incoming postMessage type -> [ajax action, response type, extra fields...]
            var routes = {
                videosow_load_sermon_importer_config:  ['videosow_load_sermon_importer_config',  'videosow_sermon_importer_config_loaded',  'config'],
                videosow_save_sermon_importer_config:  ['videosow_save_sermon_importer_config',  'videosow_sermon_importer_config_saved'],
                videosow_run_sermon_sync:              ['videosow_run_sermon_sync',              'videosow_sermon_sync_result'],
                videosow_scan_sermon_playlist:         ['videosow_scan_sermon_playlist',         'videosow_sermon_scan_result'],
                videosow_step_sermon_sync:             ['videosow_step_sermon_sync',             'videosow_sermon_step_result'],
                videosow_cancel_sermon_sync:           ['videosow_cancel_sermon_sync',           'videosow_sermon_sync_cancelled'],
                videosow_get_sermon_stage:             ['videosow_get_sermon_stage',             'videosow_sermon_stage'],
                videosow_clear_sermon_log:             ['videosow_clear_sermon_log',             'videosow_sermon_log_cleared'],
                videosow_repair_sermon_metadata:       ['videosow_repair_sermon_metadata',       'videosow_sermon_repair_result'],
                videosow_diagnose_transcript:          ['videosow_diagnose_transcript',          'videosow_transcript_diagnosis'],
                videosow_test_playlist:                ['videosow_test_playlist',                'videosow_test_playlist_result'],
                videosow_get_oauth_redirect_uri:       ['videosow_get_oauth_redirect_uri',       'videosow_oauth_redirect_uri'],
                videosow_disconnect_oauth:             ['videosow_disconnect_oauth',             'videosow_oauth_disconnected'],
                videosow_test_oauth:                   ['videosow_test_oauth',                   'videosow_oauth_tested'],
                videosow_list_archive:                 ['videosow_list_archive',                 'videosow_archive_list'],
                videosow_dashboard_stats:              ['videosow_dashboard_stats',              'videosow_dashboard_stats_result']
            };
            window.addEventListener('message', function(e){
                var d = e.data || {}; if (!d || !d.type) return;
                var route = routes[d.type];
                if (!route) {
                    // Special: start_oauth saves config first, then redirects parent.
                    if (d.type === 'videosow_start_oauth') {
                        var fdSave = new FormData();
                        fdSave.append('action', 'videosow_save_sermon_importer_config');
                        fdSave.append('nonce', nonce);
                        fdSave.append('config', JSON.stringify(d.config || {}));
                        fetch(ajaxUrl, {method:'POST', credentials:'same-origin', body:fdSave})
                            .then(function(){
                                var fdSt = new FormData();
                                fdSt.append('action', 'videosow_start_oauth');
                                fdSt.append('nonce', nonce);
                                return fetch(ajaxUrl, {method:'POST', credentials:'same-origin', body:fdSt});
                            })
                            .then(function(r){return r.json();})
                            .then(function(resp){
                                if (resp && resp.success && resp.data && resp.data.auth_url) {
                                    window.location.href = resp.data.auth_url;
                                } else {
                                    window.postMessage({type:'videosow_oauth_start_error', error:(resp && resp.data) || 'unknown'}, '*');
                                }
                            });
                    }
                    return;
                }
                var fd = new FormData();
                fd.append('action', route[0]);
                fd.append('nonce', nonce);
                // Forward known optional fields
                ['config','offset','url','lang','playlist'].forEach(function(k){
                    if (d[k] !== undefined && d[k] !== null) {
                        fd.append(k, typeof d[k] === 'object' ? JSON.stringify(d[k]) : String(d[k]));
                    }
                });
                fetch(ajaxUrl, {method:'POST', credentials:'same-origin', body:fd})
                    .then(function(r){return r.json();})
                    .then(function(resp){
                        var msg = {type: route[1], success: !!resp.success, data: resp.data || null};
                        if (route[2]) msg[route[2]] = resp.success ? resp.data : {};
                        window.postMessage(msg, '*');
                    });
            });
            // Detect OAuth callback redirect
            try {
                var sp = new URLSearchParams(window.location.search);
                var s  = sp.get('videosow_oauth');
                if (s) {
                    setTimeout(function(){
                        window.postMessage({type:'videosow_oauth_callback', status:s, reason:sp.get('reason')||''}, '*');
                    }, 800);
                }
            } catch(e){}
        })();
        </script>
        <?php
    }

    public function plugin_action_links( $links ) {
        $url  = admin_url( 'admin.php?page=video-sow' );
        $link = '<a href="' . esc_url( $url ) . '">Dashboard</a>';
        array_unshift( $links, $link );
        return $links;
    }
}

if ( defined( 'ABSPATH' ) ) { new VideoSow_Plugin(); }

/* ============================================================================
 * Sermon Importer (YouTube → WordPress posts) — ported from Antiohia Tools.
 * All functions prefixed videosow_; AJAX actions prefixed wp_ajax_videosow_*;
 * options stored under videosow_importer_config; CPT slug videosow_video.
 * ============================================================================ */


/* ── Sermon Importer ───────────────────────────── */

function videosow_get_sermon_importer_defaults() {
    return array(
        'apiKey'         => '',
        'playlistId'     => '',
        'playlistIds'    => array(),
        'playlistStats'  => array(), // map: playlist_id => { totalImported, lastSyncAt, lastSyncStatus, lastSyncMsg, firstSyncDone }
        'slug'           => 'articles',
        'syncIntervalH'  => 48,
        'enabled'        => false,
        'fetchTranscript'=> true,
        'transcriptLang' => 'ro',
        'transcriptDisplay' => 'details',
        'youtubeOAuthClientId' => '',
        'youtubeOAuthClientSecret' => '',
        'youtubeOAuthRefreshToken' => '',
        'youtubeChannelName' => '',
        'cloudTranscriptEnabled' => true,
        'descriptionCleanup' => '',
        'archiveTitle'   => '',
        'archiveMetaTitle'         => '',
        'archiveMetaDescription'   => '',
        'archiveToolbarEnabled'    => true,
        'archiveShowSearch'        => true,
        'archiveSidebarEnabled'    => false,
        'singleSidebarEnabled'     => false,
        'archiveColumns'           => 2,
        'archiveLayout'            => 'magazine-2',
        'archiveExcerptWords'      => 40,
        'archiveShowSort'          => true,
        'archiveShowTags'          => true,
        'archiveDefaultSort'       => 'date_desc',
        'archiveTagCloudMode'         => 'random',
        'archiveTagCloudLinesDesktop' => 2,
        'archiveTagCloudLinesMobile'  => 4,
        'archiveTagCloudPool'         => 200,
        'archiveTagCloudManualTags'   => array(),
        'simpleInstructions' => array(
            array( 'id' => 'default_trail', 'type' => 'trailing_whitespace' ),
        ),
        'relaxedMode'    => true,
        'relaxedDelayS'  => 3,
        'relaxedBatch'   => 10,
        'relaxedPauseS'  => 10,
        'aiEnabled'        => false,
        'aiProvider'       => 'openrouter',
        'aiModel'          => 'google/gemini-2.5-flash',
        'aiApiKey'         => '',
        'aiInstructions'   => '',
        'aiTranscriptChars'=> 4000,
        'aiTemplates'      => array(),
        'aiRestrictTags'   => true,
        'aiUseAiExcerpt'   => true,
        'lastSyncAt'     => 0,
        'lastSyncStatus' => '',
        'lastSyncMsg'    => '',
        'totalImported'  => 0,
        'log'            => array(),
        'firstSyncDone'  => false,
    );
}

function videosow_english_status_message( $msg ) {
    $msg = is_string( $msg ) ? $msg : '';
    if ( $msg === '' ) return '';
    $plain = function_exists( 'remove_accents' ) ? remove_accents( $msg ) : $msg;
    if ( stripos( $plain, 'manual' ) !== false && preg_match( '/(\d+)\s+importat(?:e)?/i', $plain, $m ) ) {
        return sprintf( 'Cancelled manually after %d imported', intval( $m[1] ) );
    }
    if ( preg_match( '/^(\d+)\s+importat(?:e)?$/i', trim( $plain ), $m ) ) {
        return sprintf( '%d imported', intval( $m[1] ) );
    }
    return $msg;
}

function videosow_normalize_config_messages( $cfg ) {
    if ( isset( $cfg['lastSyncMsg'] ) ) $cfg['lastSyncMsg'] = videosow_english_status_message( $cfg['lastSyncMsg'] );
    if ( isset( $cfg['log'] ) && is_array( $cfg['log'] ) ) {
        foreach ( $cfg['log'] as $i => $entry ) {
            if ( isset( $entry['message'] ) ) $cfg['log'][ $i ]['message'] = videosow_english_status_message( $entry['message'] );
        }
    }
    if ( isset( $cfg['playlistStats'] ) && is_array( $cfg['playlistStats'] ) ) {
        foreach ( $cfg['playlistStats'] as $pid => $stats ) {
            if ( is_array( $stats ) && isset( $stats['lastSyncMsg'] ) ) {
                $cfg['playlistStats'][ $pid ]['lastSyncMsg'] = videosow_english_status_message( $stats['lastSyncMsg'] );
            }
        }
    }
    return $cfg;
}

function videosow_get_sermon_importer_config() {
    $saved = get_option( 'videosow_importer_config', array() );
    return videosow_normalize_config_messages( array_merge( videosow_get_sermon_importer_defaults(), is_array( $saved ) ? $saved : array() ) );
}

/**
 * HTTP GET with automatic retry + exponential backoff.
 * Retries on WP_Error (network), HTTP 429, 500, 502, 503, 504, and on YouTube quota errors (403 with reason quotaExceeded/rateLimitExceeded/userRateLimitExceeded).
 * Returns the final wp_remote response (or WP_Error). Logs each retry attempt to error_log.
 */
function videosow_http_get_retry( $url, $args = array(), $max_attempts = 4 ) {
    $attempt = 0;
    $resp    = null;
    $delays  = array( 2, 5, 12, 30 ); // seconds, exponential-ish
    while ( $attempt < $max_attempts ) {
        $resp = wp_remote_get( $url, $args );
        $should_retry = false;
        $reason = '';
        if ( is_wp_error( $resp ) ) {
            $should_retry = true;
            $reason = 'wp_error: ' . $resp->get_error_message();
        } else {
            $code = wp_remote_retrieve_response_code( $resp );
            if ( in_array( $code, array( 429, 500, 502, 503, 504 ), true ) ) {
                $should_retry = true;
                $reason = 'http_' . $code;
            } elseif ( $code === 403 ) {
                $body = json_decode( wp_remote_retrieve_body( $resp ), true );
                $err_reason = isset( $body['error']['errors'][0]['reason'] ) ? $body['error']['errors'][0]['reason'] : '';
                if ( in_array( $err_reason, array( 'rateLimitExceeded', 'userRateLimitExceeded', 'backendError', 'quotaExceeded' ), true ) ) {
                    // quotaExceeded means daily 10k quota burned — no point retrying same day.
                    if ( $err_reason === 'quotaExceeded' ) { $should_retry = false; $reason = 'quotaExceeded (daily limit)'; }
                    else { $should_retry = true; $reason = '403_' . $err_reason; }
                }
            }
        }
        if ( ! $should_retry ) return $resp;
        $attempt++;
        if ( $attempt >= $max_attempts ) {
            error_log( '[VideoSow] HTTP retry exhausted after ' . $attempt . ' attempts (' . $reason . '): ' . $url );
            return $resp;
        }
        $wait = isset( $delays[ $attempt - 1 ] ) ? $delays[ $attempt - 1 ] : 30;
        error_log( '[VideoSow] HTTP retry ' . $attempt . '/' . $max_attempts . ' in ' . $wait . 's (' . $reason . '): ' . $url );
        sleep( $wait );
    }
    return $resp;
}

/**
 * Per-step stage tracker. The dashboard polls this transient while a step
 * is in flight so the user sees what the server is doing right now
 * (fetching transcript, AI processing, creating article, etc.).
 */
function videosow_set_stage( $stage, $detail = '' ) {
    set_transient( 'videosow_current_stage', array(
        'stage'  => (string) $stage,
        'detail' => (string) $detail,
        'ts'     => time(),
    ), 5 * MINUTE_IN_SECONDS );
}
function videosow_clear_stage() {
    delete_transient( 'videosow_current_stage' );
}

/* Custom Post Type with configurable rewrite slug */
function videosow_register_sermon_cpt() {
    $cfg  = videosow_get_sermon_importer_config();
    $slug = ! empty( $cfg['slug'] ) ? sanitize_title( $cfg['slug'] ) : 'articles';
    register_post_type( 'videosow_video', array(
        'labels' => array(
            'name'          => 'Articles',
            'singular_name' => 'Article',
            'add_new_item'  => 'Add Article',
            'edit_item'     => 'Edit Article',
            'menu_name'     => 'Articles',
        ),
        'public'        => true,
        'show_ui'       => true,
        'show_in_menu'  => 'video-sow',
        'menu_icon'     => 'dashicons-microphone',
        'has_archive'   => $slug,
        'rewrite'       => array( 'slug' => $slug, 'with_front' => false ),
        'supports'      => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest'  => true,
        'taxonomies'    => array( 'videosow_tag' ),
    ) );

    register_taxonomy( 'videosow_tag', 'videosow_video', array(
        'labels'            => array(
            'name'          => 'Tags',
            'singular_name' => 'Tag',
            'menu_name'     => 'Tags',
            'all_items'     => 'All Tags',
            'add_new_item'  => 'Add Tag',
            'edit_item'     => 'Edit Tag',
            'search_items'  => 'Search Tags',
        ),
        'public'            => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'hierarchical'      => false,
        'rewrite'           => array( 'slug' => 'videosow-tag' ),
    ) );
}
add_action( 'init', 'videosow_register_sermon_cpt' );

/* Keep the public sermon archive out of page caches so toolbar/grid JS is never served stale. */
function videosow_sermon_archive_no_cache() {
    if ( ! is_post_type_archive( 'videosow_video' ) ) return;
    if ( ! defined( 'DONOTCACHEPAGE' ) ) define( 'DONOTCACHEPAGE', true );
    if ( ! defined( 'DONOTCACHEOBJECT' ) ) define( 'DONOTCACHEOBJECT', true );
    if ( ! defined( 'DONOTCACHEDB' ) ) define( 'DONOTCACHEDB', true );
    nocache_headers();
}
add_action( 'template_redirect', 'videosow_sermon_archive_no_cache', 0 );

/* Force 20 posts per page on the sermon archive (rest are loaded client-side). */
function videosow_sermon_archive_pre_get_posts( $q ) {
    if ( is_admin() || ! $q->is_main_query() ) return;
    if ( $q->is_post_type_archive( 'videosow_video' ) ) {
        $q->set( 'posts_per_page', 20 );
    }
}
add_action( 'pre_get_posts', 'videosow_sermon_archive_pre_get_posts' );

/* Clean archive title + hide empty post meta on /videos/ archive */
function videosow_sermon_archive_title( $title ) {
    if ( is_post_type_archive( 'videosow_video' ) ) {
        $cfg = videosow_get_sermon_importer_config();
        if ( ! empty( $cfg['archiveTitle'] ) ) {
            return esc_html( $cfg['archiveTitle'] );
        }
        $obj = get_post_type_object( 'videosow_video' );
        return $obj && ! empty( $obj->labels->name ) ? esc_html( $obj->labels->name ) : 'Videos';
    }
    return $title;
}
add_filter( 'get_the_archive_title', 'videosow_sermon_archive_title' );

/* SEO meta title + description for the sermon archive */
function videosow_sermon_archive_document_title( $parts ) {
    if ( is_post_type_archive( 'videosow_video' ) ) {
        $cfg = videosow_get_sermon_importer_config();
        if ( ! empty( $cfg['archiveMetaTitle'] ) ) {
            $parts['title'] = $cfg['archiveMetaTitle'];
        }
    }
    return $parts;
}
add_filter( 'document_title_parts', 'videosow_sermon_archive_document_title', 999 );

function videosow_sermon_archive_pre_document_title( $title ) {
    if ( is_post_type_archive( 'videosow_video' ) ) {
        $cfg = videosow_get_sermon_importer_config();
        if ( ! empty( $cfg['archiveMetaTitle'] ) ) {
            return $cfg['archiveMetaTitle'];
        }
    }
    return $title;
}
add_filter( 'pre_get_document_title', 'videosow_sermon_archive_pre_document_title', 999 );
add_filter( 'wp_title', 'videosow_sermon_archive_pre_document_title', 999 );

function videosow_sermon_archive_meta_description() {
    if ( ! is_post_type_archive( 'videosow_video' ) ) return;
    $cfg = videosow_get_sermon_importer_config();
    if ( ! empty( $cfg['archiveMetaDescription'] ) ) {
        $desc = esc_attr( $cfg['archiveMetaDescription'] );
        echo "\n<meta name=\"description\" content=\"{$desc}\" />\n";
        echo "<meta property=\"og:description\" content=\"{$desc}\" />\n";
    }
    if ( ! empty( $cfg['archiveMetaTitle'] ) ) {
        $t = esc_attr( $cfg['archiveMetaTitle'] );
        echo "<meta property=\"og:title\" content=\"{$t}\" />\n";
        echo "<script>document.title = " . wp_json_encode( $cfg['archiveMetaTitle'] ) . ";</script>\n";
    }
}
add_action( 'wp_head', 'videosow_sermon_archive_meta_description', 1 );

function videosow_sermon_archive_css() {
    if ( ! is_post_type_archive( 'videosow_video' ) ) return;
    echo '<style id="videosow-archive-css">'
        . '.post-type-archive-videosow_video .entry-meta,'
        . '.post-type-archive-videosow_video .post-meta,'
        . '.post-type-archive-videosow_video .byline,'
        . '.post-type-archive-videosow_video .posted-on,'
        . '.post-type-archive-videosow_video .author,'
        . '.post-type-archive-videosow_video .posted-by,'
        . '.post-type-archive-videosow_video .entry-date,'
        . '.post-type-archive-videosow_video .updated,'
        . '.post-type-archive-videosow_video .page-header hr,'
        . '.post-type-archive-videosow_video .archive-header hr,'
        . '.post-type-archive-videosow_video .entry-header hr,'
        . '.post-type-archive-videosow_video main hr,'
        . '.post-type-archive-videosow_video .site-main hr,'
        . '.post-type-archive-videosow_video .content-area hr {display:none !important;}'
        . '.post-type-archive-videosow_video .entry-header,'
        . '.post-type-archive-videosow_video .page-header,'
        . '.post-type-archive-videosow_video .archive-header {border-top:0 !important;border-bottom:0 !important;}'
        . '.post-type-archive-videosow_video .archive-heading {border-top:0 !important;border-bottom:0 !important;padding-top:0 !important;padding-bottom:0 !important;margin-top:0 !important;margin-bottom:.35rem !important;}'
        . '.post-type-archive-videosow_video .archive-heading > hr,'
        . '.post-type-archive-videosow_video .archive-heading::before,'
        . '.post-type-archive-videosow_video .archive-heading::after {display:none !important;border:0 !important;}'
        . '</style>';
}
add_action( 'wp_head', 'videosow_sermon_archive_css', 99 );

/* Hide sidebar on archive / single article pages when disabled in settings (default: hidden). */
function videosow_sermon_sidebar_toggle_css() {
    $is_archive = is_post_type_archive( 'videosow_video' );
    $is_single  = is_singular( 'videosow_video' );
    if ( ! $is_archive && ! $is_single ) return;
    $cfg = videosow_get_sermon_importer_config();
    $hide = ( $is_archive && empty( $cfg['archiveSidebarEnabled'] ) ) || ( $is_single && empty( $cfg['singleSidebarEnabled'] ) );
    if ( ! $hide ) return;
    $body = $is_archive ? '.post-type-archive-videosow_video' : '.single-videosow_video';
    echo '<style id="videosow-hide-sidebar-css">'
        . $body . ' #secondary,'
        . $body . ' .sidebar,'
        . $body . ' aside.widget-area,'
        . $body . ' .widget-area,'
        . $body . ' #sidebar,'
        . $body . ' .secondary,'
        . $body . ' .complementary {display:none !important;}'
        // Force the main content column to span the full row even when the theme
        // wraps it in a Bootstrap/Foundation/Twenty-* grid that reserves space
        // for the (now-hidden) sidebar.
        . $body . ' #primary,'
        . $body . ' .content-area,'
        . $body . ' main#main,'
        . $body . ' .site-main,'
        . $body . ' .entry-content,'
        . $body . ' .site-content > .content-area,'
        . $body . ' #content > .content-area,'
        . $body . ' #content-wrap > .content-area,'
        . $body . ' .col-main,'
        . $body . ' .main-content {width:100% !important;max-width:100% !important;float:none !important;margin-right:0 !important;margin-left:0 !important;}'
        // Bootstrap / Foundation / generic grid columns that wrap the article.
        . $body . ' [class*="col-md-"],'
        . $body . ' [class*="col-lg-"],'
        . $body . ' [class*="col-sm-"],'
        . $body . ' [class*="col-xs-"],'
        . $body . ' .columns,'
        . $body . ' .column {flex:0 0 100% !important;width:100% !important;max-width:100% !important;}'
        . '</style>';
}
add_action( 'wp_head', 'videosow_sermon_sidebar_toggle_css', 100 );

/* Force is_active_sidebar() / dynamic_sidebar() to be inert on these pages when disabled. */
function videosow_sermon_disable_sidebars( $is_active_sidebar, $index ) {
    $is_archive = is_post_type_archive( 'videosow_video' );
    $is_single  = is_singular( 'videosow_video' );
    if ( ! $is_archive && ! $is_single ) return $is_active_sidebar;
    $cfg = videosow_get_sermon_importer_config();
    $hide = ( $is_archive && empty( $cfg['archiveSidebarEnabled'] ) ) || ( $is_single && empty( $cfg['singleSidebarEnabled'] ) );
    return $hide ? false : $is_active_sidebar;
}
add_filter( 'is_active_sidebar', 'videosow_sermon_disable_sidebars', 10, 2 );

/* Force 16:9 aspect ratio on YouTube embeds inside single article pages. */
function videosow_single_video_aspect_css() {
    if ( ! is_singular( 'videosow_video' ) ) return;
    echo '<style id="videosow-single-aspect-css">'
        . '.single-videosow_video .entry-content iframe[src*="youtube"],'
        . '.single-videosow_video .entry-content iframe[src*="youtu.be"],'
        . '.single-videosow_video .entry-content .wp-block-embed-youtube iframe,'
        . '.single-videosow_video .entry-content .wp-block-embed iframe,'
        . '.single-videosow_video .entry-content .wp-embedded-content,'
        . '.single-videosow_video .entry-content .videosow-yt-embed iframe,'
        . '.single-videosow_video .entry-content embed,'
        . '.single-videosow_video .entry-content object{display:block;width:100% !important;max-width:100% !important;height:auto !important;aspect-ratio:16/9 !important;}'
        // Fallback for browsers without aspect-ratio: wrap with padding-bottom trick is not possible
        // here, but aspect-ratio is supported in all modern browsers (95%+).
        . '.single-videosow_video .entry-content .wp-block-embed__wrapper{position:relative;}'
        . '.single-videosow_video .entry-content figure.wp-block-embed{margin-left:0 !important;margin-right:0 !important;}'
        // Hide the theme-rendered featured image at the top of the article (the
        // YouTube thumbnail is redundant — the video embed sits right below).
        . '.single-videosow_video .post-thumbnail,'
        . '.single-videosow_video .entry-thumbnail,'
        . '.single-videosow_video .featured-image,'
        . '.single-videosow_video .single-featured-image,'
        . '.single-videosow_video .wp-post-image,'
        . '.single-videosow_video .entry-header .post-thumbnail,'
        . '.single-videosow_video figure.post-thumbnail,'
        . '.single-videosow_video .entry-header img.wp-post-image{display:none !important;}'
        // Make sure the article title can wrap fully and is never truncated by
        // theme line-clamps or fixed heights.
        . '.single-videosow_video .entry-title,'
        . '.single-videosow_video h1.entry-title,'
        . '.single-videosow_video .entry-header h1{display:block !important;overflow:visible !important;text-overflow:clip !important;white-space:normal !important;-webkit-line-clamp:unset !important;-webkit-box-orient:unset !important;max-height:none !important;height:auto !important;word-break:break-word !important;}'
        . '</style>';
}
add_action( 'wp_head', 'videosow_single_video_aspect_css', 100 );

/* Delete attached featured image (and the YouTube thumbnail attachment) when an
 * imported article is permanently deleted. Keeps wp-content/uploads tidy. */
function videosow_delete_thumbnail_with_post( $post_id ) {
    if ( get_post_type( $post_id ) !== 'videosow_video' ) return;
    $thumb_id = (int) get_post_thumbnail_id( $post_id );
    if ( $thumb_id > 0 ) {
        wp_delete_attachment( $thumb_id, true );
    }
}
add_action( 'before_delete_post', 'videosow_delete_thumbnail_with_post', 10, 1 );

/* Inject the archive page title into the theme's empty <h2 class="archive-heading"> */
function videosow_sermon_archive_title_js() {
    if ( ! is_post_type_archive( 'videosow_video' ) ) return;
    $cfg = videosow_get_sermon_importer_config();
    $title = ! empty( $cfg['archiveTitle'] ) ? $cfg['archiveTitle'] : '';
    if ( $title === '' ) {
        $obj = get_post_type_object( 'videosow_video' );
        $title = $obj && ! empty( $obj->labels->name ) ? $obj->labels->name : 'Videos';
    }
    $title_js = wp_json_encode( $title );
    echo '<script id="videosow-archive-title-js">(function(){function run(){var els=document.querySelectorAll(".archive-heading");for(var i=0;i<els.length;i++){var el=els[i];el.innerHTML="";var h1=document.createElement("h1");h1.textContent=' . $title_js . ';h1.style.margin="0";h1.style.padding="0";h1.style.border="0";h1.style.fontWeight="700";el.appendChild(h1);el.style.border="0";el.style.padding="0";}}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run);}else{run();}})();</script>';
}
add_action( 'wp_footer', 'videosow_sermon_archive_title_js', 99 );

/* ── Weekly YouTube views refresh ─────────────── */
function videosow_refresh_sermon_views() {
    $cfg = videosow_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) ) return;
    $posts = get_posts( array(
        'post_type'      => 'videosow_video',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'meta_query'     => array(
            array( 'key' => '_videosow_yt_video_id', 'compare' => 'EXISTS' ),
        ),
    ) );
    if ( empty( $posts ) ) return;
    $map = array();
    foreach ( $posts as $pid ) {
        $vid = get_post_meta( $pid, '_videosow_yt_video_id', true );
        if ( $vid ) $map[ $vid ] = $pid;
    }
    $vids = array_keys( $map );
    foreach ( array_chunk( $vids, 50 ) as $batch ) {
        $url = add_query_arg( array(
            'part' => 'statistics',
            'id'   => implode( ',', $batch ),
            'key'  => $cfg['apiKey'],
        ), 'https://www.googleapis.com/youtube/v3/videos' );
        $resp = wp_remote_get( $url, array( 'timeout' => 30 ) );
        if ( is_wp_error( $resp ) ) continue;
        $body  = json_decode( wp_remote_retrieve_body( $resp ), true );
        $items = isset( $body['items'] ) ? $body['items'] : array();
        foreach ( $items as $it ) {
            $vid   = isset( $it['id'] ) ? $it['id'] : '';
            $views = isset( $it['statistics']['viewCount'] ) ? intval( $it['statistics']['viewCount'] ) : null;
            if ( $vid && isset( $map[ $vid ] ) && $views !== null ) {
                update_post_meta( $map[ $vid ], '_videosow_yt_views', $views );
                update_post_meta( $map[ $vid ], '_videosow_yt_views_updated', time() );
            }
        }
    }
}
add_action( 'videosow_views_refresh_event', 'videosow_refresh_sermon_views' );

function videosow_schedule_views_refresh() {
    if ( ! wp_next_scheduled( 'videosow_views_refresh_event' ) ) {
        wp_schedule_event( time() + 600, 'weekly', 'videosow_views_refresh_event' );
    }
}
add_action( 'init', 'videosow_schedule_views_refresh' );

/* ── Archive Toolbar (search + sort + tag cloud) ─ */
function videosow_sermon_archive_toolbar() {
    if ( ! is_post_type_archive( 'videosow_video' ) ) return;
    $cfg = videosow_get_sermon_importer_config();
    $toolbar_enabled = ! empty( $cfg['archiveToolbarEnabled'] );

    $show_search = ! empty( $cfg['archiveShowSearch'] );
    $show_sort   = ! empty( $cfg['archiveShowSort'] );
    $show_tags   = ! empty( $cfg['archiveShowTags'] );
    $default_sort = in_array( isset( $cfg['archiveDefaultSort'] ) ? $cfg['archiveDefaultSort'] : 'date_desc', array( 'date_desc', 'date_asc', 'views_desc' ), true ) ? $cfg['archiveDefaultSort'] : 'date_desc';
    $mode          = isset( $cfg['archiveTagCloudMode'] ) ? $cfg['archiveTagCloudMode'] : 'random';
    $lines_desktop = max( 1, intval( isset( $cfg['archiveTagCloudLinesDesktop'] ) ? $cfg['archiveTagCloudLinesDesktop'] : 2 ) );
    $lines_mobile  = max( 1, intval( isset( $cfg['archiveTagCloudLinesMobile'] ) ? $cfg['archiveTagCloudLinesMobile'] : 4 ) );
    // Pool field removed from UI — always pull from all existing tags.
    $tag_pool      = 0; // 0 = no limit in get_terms.
    $manual_tags   = isset( $cfg['archiveTagCloudManualTags'] ) && is_array( $cfg['archiveTagCloudManualTags'] ) ? $cfg['archiveTagCloudManualTags'] : array();

    $tag_names = array();
    if ( $show_tags ) {
        if ( $mode === 'manual' && ! empty( $manual_tags ) ) {
            $tag_names = array_values( $manual_tags );
        } else {
            $all_tags = get_terms( array(
                'taxonomy'   => 'videosow_tag',
                'hide_empty' => true,
                'orderby'    => 'name',
                'order'      => 'ASC',
            ) );
            if ( is_wp_error( $all_tags ) ) $all_tags = array();
            foreach ( $all_tags as $t ) { $tag_names[] = $t->name; }
            shuffle( $tag_names );
        }
    }
    $tags_json = wp_json_encode( $tag_names );
    $default_sort_js = wp_json_encode( $default_sort );

    // CSS
    echo '<style id="videosow-toolbar-css">'
        . '.post-type-archive-videosow_video .videosow-toolbar{font-family:inherit !important;margin:-.85rem 0 2.25rem !important;padding-top:.75rem !important;--kp-tag-lines-desktop:' . $lines_desktop . ';--kp-tag-lines-mobile:' . $lines_mobile . ';overflow:visible !important;}'
        . '.videosow-toolbar *{box-sizing:border-box;}'
        . '.videosow-toolbar .kp-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;background:#ffffff;padding:.85rem 1rem;border:1px solid rgba(0,0,0,.08);border-radius:14px;}'
        . '.post-type-archive-videosow_video .videosow-toolbar{overflow:visible;}'
        . '.videosow-toolbar .kp-search{flex:1 1 280px;min-width:0;}'
        . '.videosow-toolbar .kp-search input{width:100%;padding:.55rem .85rem;font-size:.95rem;background:rgba(0,0,0,.04);border:0;border-radius:10px;color:#111;outline:none;font-family:inherit !important;}'
        . '.videosow-toolbar .kp-search input::placeholder{color:rgba(0,0,0,.45);}'
        . '.videosow-toolbar .kp-sort{display:flex;align-items:center;gap:.5rem;flex-shrink:0;}'
        . '.videosow-toolbar .kp-sort label{font-size:.85rem;color:rgba(0,0,0,.55);font-weight:500;font-family:inherit !important;}'
        . '.videosow-toolbar .kp-sort select{background:transparent;border:0;font-size:.9rem;font-weight:600;color:#111;cursor:pointer;outline:none;font-family:inherit !important;padding:.25rem .25rem .25rem 0;}'
        . '.videosow-toolbar .kp-tags{display:flex;flex-wrap:wrap;align-content:flex-start;gap:.45rem;margin-top:.85rem;line-height:1;max-height:calc((1.625rem * var(--kp-tag-lines-desktop)) + (.45rem * (var(--kp-tag-lines-desktop) - 1)));overflow:hidden;}'
        . '@media (max-width:768px){.videosow-toolbar .kp-tags{max-height:calc((1.625rem * var(--kp-tag-lines-mobile)) + (.45rem * (var(--kp-tag-lines-mobile) - 1)));}}'
        . '.videosow-toolbar .kp-tag{display:inline-flex;align-items:center;height:1.625rem;padding:0 .8rem;background:#ffffff;border:1px solid rgba(0,0,0,.08);border-radius:9999px;font-size:.78rem;font-weight:500;color:rgba(0,0,0,.65);cursor:pointer;transition:all .15s ease;font-family:inherit !important;line-height:1;white-space:nowrap;}'
        . '.videosow-toolbar .kp-tag:hover{border-color:rgba(0,0,0,.25);color:#111;}'
        . '.videosow-toolbar .kp-tag.is-active{background:#111;border-color:#111;color:#fff;}'
        . '.post-type-archive-videosow_video .kp-hidden-by-toolbar{display:none !important;}'
        . '.post-type-archive-videosow_video .kp-slot-hidden{display:none !important;}'
        . '.post-type-archive-videosow_video .videosow-grid > .videosow-card.kp-slot-hidden{display:none !important;}'
        . '.post-type-archive-videosow_video .kp-source-hidden,.post-type-archive-videosow_video .kp-source-hidden *{display:none !important;}'
        . '.post-type-archive-videosow_video .kp-archive-tail-hidden{display:none !important;margin:0 !important;padding:0 !important;border:0 !important;height:0 !important;}'
        . '.post-type-archive-videosow_video nav.pagination,.post-type-archive-videosow_video .navigation.pagination,.post-type-archive-videosow_video .pagination,.post-type-archive-videosow_video .paging-navigation,.post-type-archive-videosow_video .posts-navigation,.post-type-archive-videosow_video .post-navigation,.post-type-archive-videosow_video .nav-links,.post-type-archive-videosow_video .wp-pagenavi,.post-type-archive-videosow_video .page-numbers{display:none !important;}'
        // Once the synthetic grid exists, force-hide ANY original theme article outside it.
        // Prevents duplicates after wp_update_post date changes (repair tool) re-trigger theme renders.
        . 'body.post-type-archive-videosow_video:has(#videosow-grid) article[id^="post-"]:not(#videosow-grid article){display:none !important;}'
        // Hide native dividers/spacers that the theme renders between/after articles
        . 'body.post-type-archive-videosow_video:has(#videosow-grid) hr,'
        . 'body.post-type-archive-videosow_video:has(#videosow-grid) .post-separator,'
        . 'body.post-type-archive-videosow_video:has(#videosow-grid) .entries-divider{display:none !important;}'
        // Remove bottom spacing left behind by theme list/pagination wrappers
        . 'body.post-type-archive-videosow_video:has(#videosow-grid) .posts-wrapper,'
        . 'body.post-type-archive-videosow_video:has(#videosow-grid) .blog-content,'
        . 'body.post-type-archive-videosow_video:has(#videosow-grid) .entry-content-wrap{padding-bottom:0 !important;margin-bottom:0 !important;}'
        . '.post-type-archive-videosow_video #videosow-load-more-wrap{display:flex;justify-content:center;margin:1.5rem 0 0 !important;padding:0 !important;border:0 !important;}'
        . '.post-type-archive-videosow_video #videosow-load-more-wrap ~ *:not(#videosow-load-more-wrap):not(#videosow-toolbar):not(#videosow-grid){display:none !important;margin:0 !important;padding:0 !important;border:0 !important;height:0 !important;}'
        // Also kill the theme's "entries divider" / pagination separator that
        // sits as the FIRST element after the grid (when load-more wrap is appended
        // outside the same parent in some themes).
        . '.post-type-archive-videosow_video #videosow-grid ~ hr,'
        . '.post-type-archive-videosow_video #videosow-grid ~ .entries-divider,'
        . '.post-type-archive-videosow_video #videosow-grid ~ .post-separator,'
        . '.post-type-archive-videosow_video #videosow-grid ~ .wp-block-separator{display:none !important;margin:0 !important;padding:0 !important;border:0 !important;height:0 !important;}'
        . (function() use ($cfg) {
            $layout = isset($cfg['archiveLayout']) ? $cfg['archiveLayout'] : 'theme';
            $cols = $layout === 'magazine-3' ? 3 : ($layout === 'magazine-2' ? 2 : 1);
            $base = '.post-type-archive-videosow_video .videosow-grid{display:grid !important;grid-template-columns:repeat(' . $cols . ',minmax(0,1fr)) !important;gap:2rem !important;margin:0 !important;width:100% !important;max-width:100% !important;clear:both !important;}'
                . '@media (max-width:768px){.post-type-archive-videosow_video .videosow-grid{grid-template-columns:1fr !important;gap:1.5rem !important;}}';
            // Custom card designs override theme styling — independent of theme markup.
            $custom = '';
            if ( $layout === 'magazine-2' || $layout === 'magazine-3' ) {
                $custom = '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] > .videosow-card{background:#fff !important;border:1px solid rgba(0,0,0,.08) !important;border-radius:14px !important;overflow:hidden !important;display:flex !important;flex-direction:column !important;padding:0 !important;border-top:0 !important;transition:box-shadow .25s ease, transform .25s ease;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] > .videosow-card:hover{box-shadow:0 10px 30px rgba(0,0,0,.08) !important;transform:translateY(-2px);}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] > .videosow-card > article{background:transparent !important;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .post-thumbnail,.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] figure{margin:0 !important;aspect-ratio:16/9 !important;display:block !important;overflow:hidden !important;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .post-thumbnail img,.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] figure img{width:100% !important;height:100% !important;object-fit:cover !important;border-radius:0 !important;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .entry-meta,.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .entry-title,.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .entry-summary{padding:0 1.1rem !important;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .entry-meta{padding-top:1rem !important;font-size:.78rem !important;color:rgba(0,0,0,.55) !important;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .entry-title{font-size:' . ($layout === 'magazine-3' ? '1.05rem' : '1.2rem') . ' !important;font-weight:700 !important;line-height:1.3 !important;margin:.5rem 0 .6rem 0 !important;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .entry-title a{color:#111 !important;text-decoration:none !important;}'
                    . '.videosow-grid[data-vs-layout="' . esc_attr($layout) . '"] .entry-summary{padding-bottom:1.1rem !important;color:rgba(0,0,0,.65) !important;font-size:.9rem !important;line-height:1.55 !important;}';
            } elseif ( $layout === 'list' ) {
                $custom = '.videosow-grid[data-vs-layout="list"] > .videosow-card{background:#fff !important;border:1px solid rgba(0,0,0,.08) !important;border-radius:14px !important;overflow:hidden !important;display:grid !important;grid-template-columns:minmax(220px,32%) 1fr !important;gap:0 !important;padding:0 !important;border-top:1px solid rgba(0,0,0,.08) !important;transition:box-shadow .25s ease;}'
                    . '.videosow-grid[data-vs-layout="list"] > .videosow-card:hover{box-shadow:0 10px 30px rgba(0,0,0,.08) !important;}'
                    . '.videosow-grid[data-vs-layout="list"] > .videosow-card > article{display:contents !important;}'
                    . '.videosow-grid[data-vs-layout="list"] .post-thumbnail,.videosow-grid[data-vs-layout="list"] figure{margin:0 !important;aspect-ratio:16/9 !important;display:block !important;overflow:hidden !important;}'
                    . '.videosow-grid[data-vs-layout="list"] .post-thumbnail img,.videosow-grid[data-vs-layout="list"] figure img{width:100% !important;height:100% !important;object-fit:cover !important;border-radius:0 !important;}'
                    . '.videosow-grid[data-vs-layout="list"] .entry-meta,.videosow-grid[data-vs-layout="list"] .entry-title,.videosow-grid[data-vs-layout="list"] .entry-summary{padding:0 1.4rem !important;}'
                    . '.videosow-grid[data-vs-layout="list"] .entry-meta{padding-top:1.2rem !important;font-size:.8rem !important;color:rgba(0,0,0,.55) !important;}'
                    . '.videosow-grid[data-vs-layout="list"] .entry-title{font-size:1.4rem !important;font-weight:700 !important;line-height:1.25 !important;margin:.5rem 0 .65rem 0 !important;}'
                    . '.videosow-grid[data-vs-layout="list"] .entry-title a{color:#111 !important;text-decoration:none !important;}'
                    . '.videosow-grid[data-vs-layout="list"] .entry-summary{padding-bottom:1.3rem !important;color:rgba(0,0,0,.65) !important;font-size:.95rem !important;line-height:1.55 !important;}'
                    . '@media (max-width:768px){.videosow-grid[data-vs-layout="list"] > .videosow-card{grid-template-columns:1fr !important;}}';
            }
            return $base . $custom;
        })()
        . '.post-type-archive-videosow_video .videosow-grid > .videosow-card{display:block !important;width:auto !important;max-width:none !important;min-width:0 !important;float:none !important;clear:none !important;margin:0 !important;padding:0 !important;}'
        . '.post-type-archive-videosow_video .videosow-grid > .videosow-card > article{display:block !important;margin:0 !important;padding:0 !important;border:0 !important;width:auto !important;max-width:none !important;float:none !important;clear:none !important;}'
        . '.post-type-archive-videosow_video .videosow-grid img{opacity:1 !important;visibility:visible !important;display:block !important;}'
        . '.post-type-archive-videosow_video .videosow-grid > .videosow-card > article::before{display:none !important;}'
        // Cover image hover effect (lost when cloning into custom grid)
        . '.post-type-archive-videosow_video .videosow-grid .videosow-card a:has(img),'
        . '.post-type-archive-videosow_video .videosow-grid .videosow-card .post-thumbnail,'
        . '.post-type-archive-videosow_video .videosow-grid .videosow-card .entry-thumbnail,'
        . '.post-type-archive-videosow_video .videosow-grid .videosow-card figure{display:block;overflow:hidden;border-radius:0 !important;}'
        . '.post-type-archive-videosow_video .videosow-grid .videosow-card img{transition:transform .45s ease, opacity .25s ease;border-radius:0 !important;}'
        . '.post-type-archive-videosow_video .videosow-grid .videosow-card:hover img{transform:scale(1.04);}'
        // Reduce spacing between date and title
        . '.post-type-archive-videosow_video .videosow-grid .entry-meta{display:block !important;}'
        . '.post-type-archive-videosow_video .videosow-grid time,.post-type-archive-videosow_video .videosow-grid .posted-on,.post-type-archive-videosow_video .videosow-grid .entry-date,.post-type-archive-videosow_video .videosow-grid .updated{display:inline !important;}'
        . '.post-type-archive-videosow_video .videosow-grid .entry-summary{display:block !important;margin-top:.75rem !important;}'
        . '.post-type-archive-videosow_video .videosow-grid .entry-summary p{margin:0 !important;}'
        . '.post-type-archive-videosow_video .videosow-grid .entry-meta,'
        . '.post-type-archive-videosow_video .videosow-grid .posted-on,'
        . '.post-type-archive-videosow_video .videosow-grid .kp-slot-date-wrap,'
        . '.post-type-archive-videosow_video .videosow-grid time{margin:0 !important;padding:0 !important;line-height:1.05 !important;}'
         . '.post-type-archive-videosow_video .videosow-grid .entry-meta + *,'
         . '.post-type-archive-videosow_video .videosow-grid .posted-on + *,'
          . '.post-type-archive-videosow_video .videosow-grid .kp-slot-date-wrap + *{margin-top:0 !important;}'
        . '.post-type-archive-videosow_video .videosow-grid h1,'
        . '.post-type-archive-videosow_video .videosow-grid h2,'
        . '.post-type-archive-videosow_video .videosow-grid h3,'
        . '.post-type-archive-videosow_video .videosow-grid .entry-title{margin:0 0 1rem 0 !important;padding:0 !important;line-height:1.2 !important;}'
        . '.post-type-archive-videosow_video .videosow-grid .entry-title a{line-height:1.2 !important;}'
        . '.post-type-archive-videosow_video .videosow-grid .entry-title + .entry-summary,'
        . '.post-type-archive-videosow_video .videosow-grid .entry-title + *{margin-top:1rem !important;}'
        // Divider between rows
        . '.post-type-archive-videosow_video .videosow-grid > .videosow-card{padding-top:2.25rem !important;border-top:1px solid rgba(0,0,0,.08) !important;}'
        . '.post-type-archive-videosow_video .videosow-grid > .videosow-card[data-kp-vis-pos="1"],'
        . '.post-type-archive-videosow_video .videosow-grid > .videosow-card[data-kp-vis-pos="2"]{padding-top:0 !important;border-top:0 !important;}'
        . '@media (max-width:768px){.post-type-archive-videosow_video .videosow-grid > .videosow-card[data-kp-vis-pos="2"]{padding-top:2.25rem !important;border-top:1px solid rgba(0,0,0,.08) !important;}}'
        . '@media (max-width:768px){.post-type-archive-videosow_video .videosow-toolbar .kp-bar{border-color:rgba(0,0,0,.18) !important;}.post-type-archive-videosow_video .videosow-toolbar .kp-tag{border-color:rgba(0,0,0,.18) !important;}.post-type-archive-videosow_video .videosow-grid > .videosow-card{border-top-color:rgba(0,0,0,.18) !important;}}'
        . '.videosow-toolbar .kp-empty{padding:2rem 1rem;text-align:center;color:rgba(0,0,0,.55);font-size:.95rem;}'
        // Hide the theme's article divider on the first row (and hide all dividers when only one row is visible)
        . '.post-type-archive-videosow_video article[data-kp-vis-idx="0"],'
        . '.post-type-archive-videosow_video article[data-kp-vis-idx="1"]{border-top:0 !important;padding-top:0 !important;}'
        . '.post-type-archive-videosow_video article[data-kp-vis-idx="0"]::before,'
        . '.post-type-archive-videosow_video article[data-kp-vis-idx="1"]::before{display:none !important;}'
        . '.post-type-archive-videosow_video.kp-single-row article{border-top:0 !important;padding-top:0 !important;}'
        . '.post-type-archive-videosow_video.kp-single-row article::before{display:none !important;}'
        . '</style>';

    // Container — JS will move it just after the archive heading and wire up filtering
    $opts = array(
        'date_desc'  => 'Newest first',
        'date_asc'   => 'Oldest first',
        'views_desc' => 'Most viewed',
    );
    $sort_html = '';
    if ( $show_sort ) {
        $sort_html = '<div class="kp-sort"><label for="videosow-sort">Sort:</label><select id="videosow-sort">';
        foreach ( $opts as $val => $label ) {
            $sel = $val === $default_sort ? ' selected' : '';
            $sort_html .= '<option value="' . esc_attr( $val ) . '"' . $sel . '>' . esc_html( $label ) . '</option>';
        }
        $sort_html .= '</select></div>';
    }
    $search_html = $show_search ? '<div class="kp-search"><input type="search" id="videosow-search" placeholder="Search videos..." autocomplete="off" /></div>' : '';
    $tags_html   = $show_tags ? '<div class="kp-tags" id="videosow-tags"></div>' : '';
    $bar_html    = ( $search_html || $sort_html ) ? '<div class="kp-bar">' . $search_html . $sort_html . '</div>' : '';
    $excerpt_words = max( 5, min( 200, intval( isset( $cfg['archiveExcerptWords'] ) ? $cfg['archiveExcerptWords'] : 40 ) ) );
    $layout_attr = isset( $cfg['archiveLayout'] ) ? $cfg['archiveLayout'] : 'theme';
    if ( ! in_array( $layout_attr, array( 'theme', 'magazine-2', 'magazine-3', 'list' ), true ) ) $layout_attr = 'theme';
    if ( $toolbar_enabled ) {
        echo '<div id="videosow-toolbar" class="videosow-toolbar" data-tags=\'' . esc_attr( $tags_json ) . '\' data-default-sort="' . esc_attr( $default_sort ) . '" data-excerpt-words="' . esc_attr( $excerpt_words ) . '" data-vs-layout="' . esc_attr( $layout_attr ) . '" style="display:block">'
            . $bar_html
            . $tags_html
            . '</div>';
    }
}
add_action( 'wp_footer', 'videosow_sermon_archive_toolbar', 100 );

function videosow_sermon_archive_toolbar_js() {
    if ( ! is_post_type_archive( 'videosow_video' ) ) return;
    $cfg = videosow_get_sermon_importer_config();
    $toolbar_enabled = ! empty( $cfg['archiveToolbarEnabled'] );
    $js_excerpt_words = max( 5, min( 200, intval( isset( $cfg['archiveExcerptWords'] ) ? $cfg['archiveExcerptWords'] : 40 ) ) );
    $js_layout = isset( $cfg['archiveLayout'] ) && in_array( $cfg['archiveLayout'], array( 'theme', 'magazine-2', 'magazine-3', 'list' ), true ) ? $cfg['archiveLayout'] : 'theme';
    // Build a JS map of post-id => { date, views, tags[] } for client-side sort/filter
    $q = new WP_Query( array(
        'post_type'      => 'videosow_video',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'fields'         => 'ids',
    ) );
    $data = array();
    foreach ( $q->posts as $pid ) {
        $terms = wp_get_object_terms( $pid, 'videosow_tag', array( 'fields' => 'names' ) );
        if ( is_wp_error( $terms ) ) $terms = array();
        $thumb_id  = get_post_thumbnail_id( $pid );
        $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'large' ) : '';
        $thumb_srcset = $thumb_id ? wp_get_attachment_image_srcset( $thumb_id, 'large' ) : '';
        $thumb_alt = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
        $data[] = array(
            'id'    => $pid,
            'date'  => get_post_time( 'U', true, $pid ),
            'views' => intval( get_post_meta( $pid, '_videosow_yt_views', true ) ),
            'tags'  => array_values( $terms ),
            'title' => html_entity_decode( get_the_title( $pid ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
            'url'   => get_permalink( $pid ),
            'date_str' => get_the_date( '', $pid ),
            'date_attr' => get_post_time( 'c', true, $pid ),
            'excerpt' => wp_strip_all_tags( get_post_field( 'post_excerpt', $pid ) ),
            'thumb' => $thumb_url ? $thumb_url : '',
            'srcset' => $thumb_srcset ? $thumb_srcset : '',
            'alt'   => $thumb_alt ? $thumb_alt : '',
        );
    }
    $data_json = wp_json_encode( $data );
    ?>
<script id="videosow-toolbar-js">
(function(){
  var DATA = <?php echo $data_json; ?>;
  var byId = {};
  DATA.forEach(function(d){ byId[d.id] = d; });
  var BATCH = 20;
  var TOOLBAR_ENABLED = <?php echo $toolbar_enabled ? 'true' : 'false'; ?>;
  var CONFIG_EXCERPT_WORDS = <?php echo (int) $js_excerpt_words; ?>;
  var CONFIG_LAYOUT = <?php echo wp_json_encode( $js_layout ); ?>;
  var EXCERPT_WORDS = (function(){
    var tb = document.getElementById('videosow-toolbar');
    var n = tb ? parseInt(tb.getAttribute('data-excerpt-words') || String(CONFIG_EXCERPT_WORDS), 10) : CONFIG_EXCERPT_WORDS;
    if (!n || isNaN(n) || n < 5) n = 40;
    return n;
  })();
  function trimExcerpt(text, words){
    if (!text) return '';
    var parts = String(text).trim().split(/\s+/);
    if (parts.length <= words) return parts.join(' ');
    return parts.slice(0, words).join(' ') + '…';
  }
  var allLoaded = false; // true when all synthetic cards are in the DOM
  var loadingMore = false;

  function findArchiveAnchor(){
    return document.querySelector('.archive-heading')
        || document.querySelector('.page-header')
        || document.querySelector('.archive-header')
        || document.querySelector('main .entry-header')
        || document.querySelector('main');
  }
  function findArticles(){
    var grid = document.getElementById('videosow-grid');
    if (grid) return Array.prototype.slice.call(grid.children).map(function(card){ return card.__kpArticle || card.querySelector('article'); }).filter(Boolean);
    return Array.prototype.slice.call(document.querySelectorAll('article[id^="post-"], .post-type-archive-videosow_video article'));
  }

  function syncArticleMeta(article, d){
    // Re-populate using the same logic as synthetic cards so styling matches.
    if (!article || !d) return;
    dedupeBlocks(article);
    populateArticle(article, d);
  }

  function getSlot(article){
    if (article.__kpCard) return article.__kpCard;
    var node = article;
    var safety = 0;
    while (node && node.parentNode && safety++ < 6) {
      var parent = node.parentNode;
      if (parent.tagName === 'MAIN' || parent.tagName === 'BODY') break;
      // If parent has multiple children that each contain an article, node is the slot.
      var siblings = parent.children;
      var slotLike = 0;
      for (var i=0;i<siblings.length;i++){
        if (siblings[i] === node || siblings[i].querySelector && siblings[i].querySelector('article[id^="post-"]')) slotLike++;
      }
      if (slotLike >= 2) return node;
      node = parent;
    }
    return article;
  }

  function getPostId(article){
    var m = (article.id || '').match(/post-(\d+)/);
    if (m) return parseInt(m[1],10);
    // Fallback: scan classes (e.g. "post-123") and inner links/forms
    var c = (article.className || '').match(/(?:^|\s)post-(\d+)(?:\s|$)/);
    if (c) return parseInt(c[1],10);
    return 0;
  }

  function getTitle(article){
    var h = article.querySelector('h1, h2, h3, .entry-title');
    return (h ? h.textContent : article.textContent || '').trim();
  }

  function hydrateMedia(root){
    Array.prototype.slice.call(root.querySelectorAll('source')).forEach(function(source){
      var ss = source.getAttribute('data-srcset') || source.getAttribute('data-lazy-srcset');
      if (ss) source.setAttribute('srcset', ss);
      var sizes = source.getAttribute('data-sizes');
      if (sizes) source.setAttribute('sizes', sizes);
    });
    var imgs = Array.prototype.slice.call(root.querySelectorAll('img'));
    imgs.forEach(function(img){
      var src = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original');
      var srcset = img.getAttribute('data-srcset') || img.getAttribute('data-lazy-srcset');
      var sizes = img.getAttribute('data-sizes');
      if (src) img.setAttribute('src', src);
      if (srcset) img.setAttribute('srcset', srcset);
      if (sizes) img.setAttribute('sizes', sizes);
      img.removeAttribute('loading');
      img.removeAttribute('data-lazy-type');
      img.classList.remove('lazyload'); img.classList.remove('lazy'); img.classList.remove('lazyloaded');
      img.style.opacity = '1'; img.style.visibility = 'visible';
      if (img.getAttribute('src')) { var pre = new Image(); pre.src = img.getAttribute('src'); }
    });
  }

  var defaultSort = (document.getElementById('videosow-toolbar') && document.getElementById('videosow-toolbar').getAttribute('data-default-sort')) || 'date_desc';
  var state = { q: '', sort: defaultSort, tags: [] };

  function escAttr(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function escHtml(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // Template cloned from the first theme-rendered article so synthetic cards
  // inherit the theme's CSS classes and visual styling for date/excerpt/title.
  var TEMPLATE_ARTICLE = null;

  function dedupeBlocks(article){
    if (!article) return;
    // Keep only the first occurrence of each meta/summary block — themes sometimes
    // render both a header meta and an inline meta which would duplicate after sync.
    ['.entry-meta', '.entry-summary'].forEach(function(sel){
      var nodes = article.querySelectorAll(sel);
      for (var i = 1; i < nodes.length; i++){
        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
    });
    // Remove standalone <time> nodes that live outside .entry-meta (theme posted-on)
    var times = article.querySelectorAll('time');
    var keptTime = article.querySelector('.entry-meta time');
    times.forEach(function(t){
      if (t === keptTime) return;
      // Preserve the slot we explicitly marked as the date holder.
      if (t.classList && t.classList.contains('kp-slot-date')) return;
      if (t.closest && t.closest('.kp-slot-date')) return;
      if (t.closest && t.closest('.entry-meta')) return;
      if (t.parentNode) t.parentNode.removeChild(t);
    });
  }

  function markSlotByText(root, needle, slotClass){
    if (!root || !needle) return null;
    var target = String(needle).trim();
    if (!target) return null;
    var probe = target.slice(0, 40).toLowerCase();
    var nodes = root.querySelectorAll('*');
    var best = null;
    for (var i = 0; i < nodes.length; i++){
      var el = nodes[i];
      if (el.children && el.children.length > 0) continue; // leaf-ish only
      var txt = (el.textContent || '').trim().toLowerCase();
      if (!txt) continue;
      if (txt.indexOf(probe) !== -1){
        best = el;
        break;
      }
    }
    if (best) {
      best.classList.add(slotClass);
      // For dates, also mark any wrapping .posted-on / .entry-meta so
      // dedupeBlocks and theme styling find it under .entry-meta.
      if (slotClass === 'kp-slot-date') {
        var wrap = best.closest && (best.closest('.posted-on') || best.closest('.entry-meta'));
        if (wrap) wrap.classList.add('kp-slot-date-wrap');
      }
    }
    return best;
  }

  function captureTemplate(article, sampleData){
    if (!article) return;
    var clone = article.cloneNode(true);
    clone.removeAttribute('id');
    // Mark the real theme nodes that hold date/excerpt/title so populateArticle
    // can rewrite IN PLACE (preserving theme styling) instead of falling back
    // to a stub .entry-summary block while the original text remains visible.
    if (sampleData){
      if (sampleData.date_str) markSlotByText(clone, sampleData.date_str, 'kp-slot-date');
      if (sampleData.excerpt)  markSlotByText(clone, sampleData.excerpt,  'kp-slot-excerpt');
      if (sampleData.title){
        var titleEl = clone.querySelector('.entry-title') || clone.querySelector('h1, h2, h3');
        if (titleEl) titleEl.classList.add('kp-slot-title');
      }
    }
    // Ensure fallback slots exist.
    if (!clone.querySelector('.kp-slot-date') && !clone.querySelector('.entry-meta time')){
      var em = document.createElement('div');
      em.className = 'entry-meta';
      em.innerHTML = '<time class="entry-date published kp-slot-date"></time>';
      var titleEl2 = clone.querySelector('h1, h2, h3, .entry-title');
      if (titleEl2 && titleEl2.parentNode) titleEl2.parentNode.insertBefore(em, titleEl2);
      else clone.insertBefore(em, clone.firstChild);
    }
    if (!clone.querySelector('.kp-slot-excerpt') && !clone.querySelector('.entry-summary')){
      var es = document.createElement('div');
      es.className = 'entry-summary kp-slot-excerpt';
      es.innerHTML = '<p></p>';
      clone.appendChild(es);
    }
    TEMPLATE_ARTICLE = clone;
  }

  function populateArticle(article, d){
    if (!article || !d) return;
    // Title
    var titleEl = article.querySelector('.kp-slot-title') || article.querySelector('.entry-title') || article.querySelector('h1, h2, h3');
    if (titleEl){
      var a = titleEl.querySelector('a');
      if (a){ a.setAttribute('href', d.url || '#'); a.textContent = d.title || ''; }
      else { titleEl.textContent = d.title || ''; }
    }
    // Date
    var dateEl = article.querySelector('.kp-slot-date') || article.querySelector('.entry-meta time') || article.querySelector('time');
    if (dateEl){
      if (dateEl.tagName && dateEl.tagName.toLowerCase() === 'time'){
        dateEl.setAttribute('datetime', d.date_attr || '');
      }
      dateEl.textContent = d.date_str || '';
    }
    // Summary
    var summary = article.querySelector('.kp-slot-excerpt') || article.querySelector('.entry-summary');
    if (summary){
      var p = summary.querySelector('p') || summary;
      var text = d.excerpt ? trimExcerpt(d.excerpt, EXCERPT_WORDS) : '';
      if (text){ p.textContent = text; summary.style.display = ''; }
      else { p.textContent = ''; summary.style.display = 'none'; }
    }
    // Thumbnail — make sure the cover image links to the article.
    var thumbA = article.querySelector('.post-thumbnail, a:has(img), figure');
    var img = (thumbA ? thumbA.querySelector('img') : null) || article.querySelector('img');
    if (img){
      if (d.thumb){
        img.setAttribute('src', d.thumb);
        if (d.srcset) img.setAttribute('srcset', d.srcset); else img.removeAttribute('srcset');
        img.setAttribute('alt', d.alt || '');
        img.removeAttribute('data-src'); img.removeAttribute('data-lazy-src'); img.removeAttribute('data-srcset');
        img.classList.remove('lazyload','lazy');
        img.style.opacity = '1'; img.style.visibility = 'visible';
      }
      // Ensure the image (and its figure wrapper) is wrapped in an <a> pointing
      // to the article. Cloned theme markup may have <figure><img></figure>
      // without a link.
      var existingLink = img.closest && img.closest('a');
      if (!existingLink){
        var wrapTarget = (img.parentNode && img.parentNode.tagName === 'FIGURE') ? img.parentNode : img;
        var newLink = document.createElement('a');
        newLink.className = 'post-thumbnail';
        newLink.setAttribute('href', d.url || '#');
        wrapTarget.parentNode.insertBefore(newLink, wrapTarget);
        newLink.appendChild(wrapTarget);
      } else {
        existingLink.setAttribute('href', d.url || '#');
      }
    }
    // Strip any leftover duplicates that might have come from template
    dedupeBlocks(article);
    // Remove sibling stubs: if the theme had BOTH a real excerpt node (now
    // marked .kp-slot-excerpt) and an empty .entry-summary placeholder, drop
    // the extra one so we don't render two summary blocks.
    if (article.querySelector('.kp-slot-excerpt')){
      var extras = article.querySelectorAll('.entry-summary');
      extras.forEach(function(n){ if (!n.classList.contains('kp-slot-excerpt') && n.parentNode) n.parentNode.removeChild(n); });
    }
    if (article.querySelector('.kp-slot-date')){
      var extraMetas = article.querySelectorAll('.entry-meta');
      extraMetas.forEach(function(n){
        if (n.querySelector('.kp-slot-date')) return;
        if (n.parentNode) n.parentNode.removeChild(n);
      });
    }
  }

  function buildSyntheticCard(d){
    var card = document.createElement('div');
    card.className = 'videosow-card';
    var article;
    if (TEMPLATE_ARTICLE){
      article = TEMPLATE_ARTICLE.cloneNode(true);
    } else {
      article = document.createElement('article');
      article.className = 'post type-videosow_video';
      var thumbHtml = d.thumb
        ? '<a href="#" class="post-thumbnail"><figure><img alt="" loading="lazy" /></figure></a>'
        : '';
      article.innerHTML = thumbHtml
        + '<div class="entry-meta"><time class="entry-date published"></time></div>'
        + '<h2 class="entry-title"><a href="#"></a></h2>'
        + '<div class="entry-summary"><p></p></div>';
    }
    article.id = 'post-' + d.id + '-kp-view';
    article.classList.add('post-' + d.id);
    populateArticle(article, d);
    article.__kpCard = card;
    card.__kpArticle = article;
    card.appendChild(article);
    return card;
  }

  function loadedIds(){
    var grid = document.getElementById('videosow-grid');
    var ids = {};
    if (!grid) return ids;
    Array.prototype.slice.call(grid.children).forEach(function(card){
      var a = card.__kpArticle || card.querySelector('article');
      if (!a) return;
      var m = (a.id || '').match(/post-(\d+)/);
      if (m) ids[parseInt(m[1],10)] = 1;
    });
    return ids;
  }

  function appendBatch(n){
    var grid = document.getElementById('videosow-grid');
    if (!grid) return 0;
    var have = loadedIds();
    var added = 0;
    var sentinel = document.getElementById('videosow-sentinel');
    for (var i = 0; i < DATA.length && added < n; i++){
      var d = DATA[i];
      if (have[d.id]) continue;
      var card = buildSyntheticCard(d);
      if (sentinel && sentinel.parentNode === grid) grid.insertBefore(card, sentinel);
      else grid.appendChild(card);
      added++;
    }
    var remaining = DATA.length - Object.keys(loadedIds()).length;
    if (remaining <= 0) allLoaded = true;
    return added;
  }

  function loadMore(){
    if (loadingMore || allLoaded) return 0;
    loadingMore = true;
    var n = appendBatch(BATCH);
    apply();
    updateLoadMoreUI();
    loadingMore = false;
    return n;
  }

  function ensureAllLoaded(){
    if (allLoaded) return;
    while (!allLoaded){
      var n = appendBatch(BATCH);
      if (n === 0) { allLoaded = true; break; }
    }
    apply();
    updateLoadMoreUI();
  }

  function updateLoadMoreUI(){
    var btn = document.getElementById('videosow-load-more');
    if (allLoaded){
      if (btn) btn.style.display = 'none';
    } else {
      if (btn) btn.style.display = '';
    }
  }

  function hideNativePagination(){
    Array.prototype.slice.call(document.querySelectorAll('nav.pagination,.navigation.pagination,.pagination,.paging-navigation,.posts-navigation,.post-navigation,.wp-pagenavi,.page-numbers')).forEach(function(el){
      if (el.id === 'videosow-load-more' || (el.closest && el.closest('#videosow-toolbar'))) return;
      el.style.setProperty('display', 'none', 'important');
    });
  }

  function hideArchiveTail(grid){
    if (!grid || !grid.parentNode) return;
    var afterLoadMore = false;
    Array.prototype.slice.call(grid.parentNode.children).forEach(function(el){
      if (el === grid || el.id === 'videosow-load-more-wrap') { afterLoadMore = true; return; }
      if (!afterLoadMore) return;
      if (el.id === 'videosow-toolbar' || el.id === 'videosow-grid') return;
      // Hide EVERYTHING that comes after the load-more wrap. Themes can render
      // their own dividers, "older posts" links, ad slots, schema markup, etc.
      el.classList.add('kp-archive-tail-hidden');
    });
  }

  function setupLoadMore(grid){
    if (!grid || !grid.parentNode) return;
    if (document.getElementById('videosow-load-more')) return;
    if (DATA.length <= Object.keys(loadedIds()).length) allLoaded = true;

    var wrap = document.createElement('div');
    wrap.id = 'videosow-load-more-wrap';
    wrap.style.cssText = 'display:flex;justify-content:center;margin:1.5rem 0 0;padding:0;border:0;';
    var btn = document.createElement('button');
    btn.id = 'videosow-load-more';
    btn.type = 'button';
    btn.textContent = 'Load more';
    btn.style.cssText = 'background:#111;color:#fff;border:0;border-radius:9999px;padding:.65rem 1.4rem;font-size:.9rem;font-weight:600;cursor:pointer;font-family:inherit;';
    btn.addEventListener('click', loadMore);
    wrap.appendChild(btn);
    grid.parentNode.insertBefore(wrap, grid.nextSibling);
    updateLoadMoreUI();
  }

  function apply(){
    var articles = findArticles();
    if (!articles.length) return;
    var q = state.q.trim().toLowerCase();
    var tagsLc = (state.tags || []).map(function(t){ return String(t).toLowerCase(); });
    var visibleCount = 0;
    // Filter
    articles.forEach(function(a){
      var pid = getPostId(a);
      var d = byId[pid];
      var visible = true;
      if (tagsLc.length){
        // AND semantics: article must contain ALL selected tags.
        var artTags = (d && d.tags) ? d.tags.map(function(x){ return String(x).toLowerCase(); }) : null;
        var hayText = null;
        for (var ti=0; ti<tagsLc.length; ti++){
          var needle = tagsLc[ti];
          var ok = false;
          if (artTags){
            for (var j=0;j<artTags.length;j++){ if (artTags[j] === needle){ ok = true; break; } }
          } else {
            if (hayText === null) hayText = (a.textContent || '').toLowerCase();
            if (hayText.indexOf(needle) !== -1) ok = true;
          }
          if (!ok){ visible = false; break; }
        }
      }
      if (visible && q){
        var hay = (a.textContent || '').toLowerCase();
        if (hay.indexOf(q) === -1) visible = false;
      }
      a.classList.toggle('kp-hidden-by-toolbar', !visible);
      var slot = getSlot(a);
      if (slot !== a) slot.classList.toggle('kp-slot-hidden', !visible);
      if (visible) visibleCount++;
    });
    // Sort: when our normalized grid exists, move cards; otherwise only sort if all slots share a parent.
    var grid = document.getElementById('videosow-grid');
    var nodes = articles.map(function(a){ return getSlot(a); });
    var commonParent = grid || (nodes[0] && nodes[0].parentNode);
    var allShared = grid || (commonParent && nodes.every(function(n){ return n.parentNode === commonParent; }));
    if (allShared){
      var pairs = nodes.map(function(n,i){ return { node:n, art: articles[i], title:getTitle(articles[i]) }; });
      var seenSort = {};
      pairs = pairs.filter(function(p){
        var pid = getPostId(p.art);
        if (!pid || seenSort[pid]) { p.node.classList.add('kp-slot-hidden'); return false; }
        seenSort[pid] = 1;
        syncArticleMeta(p.art, byId[pid]);
        return true;
      });
      pairs.sort(function(x,y){
        var da = byId[getPostId(x.art)] || {date:0,views:0};
        var db = byId[getPostId(y.art)] || {date:0,views:0};
        if (state.sort === 'date_asc')  return da.date - db.date;
        if (state.sort === 'views_desc') return db.views - da.views;
        var byDate = db.date - da.date;
        return byDate || x.title.localeCompare(y.title);
      });
      pairs.forEach(function(p){ commonParent.appendChild(p.node); });
    }

    // Re-index visible articles for first-row divider hiding (CSS uses data-kp-vis-idx)
    var idx = 0;
    findArticles().forEach(function(a){
      if (a.classList.contains('kp-hidden-by-toolbar')) { a.removeAttribute('data-kp-vis-idx'); return; }
      a.setAttribute('data-kp-vis-idx', String(idx++));
    });
    // Re-index visible cards in the normalized grid for divider rules
    var gridEl = document.getElementById('videosow-grid');
    if (gridEl){
      var pos = 0;
      Array.prototype.slice.call(gridEl.children).forEach(function(card){
        if (!card.classList.contains('videosow-card')) return;
        if (card.classList.contains('kp-slot-hidden')) { card.removeAttribute('data-kp-vis-pos'); return; }
        pos++;
        card.setAttribute('data-kp-vis-pos', String(pos));
      });
    }
    // Single-row: <=2 visible articles → hide all dividers
    document.body.classList.toggle('kp-single-row', visibleCount <= 2);
  }

  function buildTags(toolbar){
    var raw = toolbar.getAttribute('data-tags') || '[]';
    var tags = [];
    try { tags = JSON.parse(raw); } catch(e){}
    var wrap = toolbar.querySelector('#videosow-tags');
    if (!wrap || !tags.length){ if(wrap) wrap.style.display='none'; return; }
    var html = '<span class="kp-tag is-active" data-tag="">All</span>';
    tags.forEach(function(t){
      html += '<span class="kp-tag" data-tag="'+ String(t).replace(/"/g,'&quot;') +'">'+ String(t) +'</span>';
    });
    wrap.innerHTML = html;
    wrap.addEventListener('click', function(e){
      var el = e.target.closest('.kp-tag'); if (!el) return;
      var tag = el.getAttribute('data-tag') || '';
      if (tag === ''){
        // "All" clears all selections.
        state.tags = [];
      } else {
        var idx = state.tags.indexOf(tag);
        if (idx === -1) state.tags.push(tag);
        else state.tags.splice(idx, 1);
      }
      wrap.querySelectorAll('.kp-tag').forEach(function(x){
        var t = x.getAttribute('data-tag') || '';
        if (t === '') x.classList.toggle('is-active', state.tags.length === 0);
        else x.classList.toggle('is-active', state.tags.indexOf(t) !== -1);
      });
      if (state.tags.length) ensureAllLoaded();
      apply();
    });
  }

  function init(){
    var toolbar = document.getElementById('videosow-toolbar');
    // Collect articles BEFORE moving anything around.
    var rawArticles = Array.prototype.slice.call(document.querySelectorAll('article[id^="post-"], .post-type-archive-videosow_video article'));
    var seen = {};
    var seenPid = {};
    rawArticles = rawArticles.filter(function(a){
      if (a.parentNode && a.parentNode.closest && a.parentNode.closest('article[id^="post-"]')) return false;
      if (a.closest && a.closest('#videosow-grid')) return false;
      var id = a.id || '';
      if (id) { if (seen[id]) return false; seen[id] = 1; }
      var pid = getPostId(a);
      if (pid) { if (seenPid[pid]) return false; seenPid[pid] = 1; }
      else { return false; }
      return true;
    });

    var grid = document.createElement('div');
    grid.id = 'videosow-grid';
    grid.className = 'videosow-grid';
    var __vsLayout = (toolbar && toolbar.getAttribute('data-vs-layout')) || CONFIG_LAYOUT || 'theme';
    grid.setAttribute('data-vs-layout', __vsLayout);

    if (rawArticles.length){
      captureTemplate(rawArticles[0], byId[getPostId(rawArticles[0])]);
      rawArticles.forEach(function(a){
        var pid = getPostId(a);
        var d = byId[pid];
        if (!d) return;
        var card = buildSyntheticCard(d);
        hydrateMedia(card);
        grid.appendChild(card);
        getSlot(a).classList.add('kp-source-hidden');
      });
    } else {
      // Fallback: theme didn't render recognizable <article> cards on this page.
      // Build the grid from DATA directly so toolbar + columns still work.
      DATA.slice(0, BATCH).forEach(function(d){
        grid.appendChild(buildSyntheticCard(d));
      });
    }

    var anchor = findArchiveAnchor();
    var firstSlot = rawArticles.length ? getSlot(rawArticles[0]) : null;
    var insertHost = null, insertBefore = null;
    if (firstSlot && firstSlot.parentNode){
      insertHost = firstSlot.parentNode; insertBefore = firstSlot;
    } else if (anchor && anchor.parentNode){
      insertHost = anchor.parentNode; insertBefore = anchor.nextSibling;
    } else {
      var mainEl = document.querySelector('main') || document.body;
      insertHost = mainEl; insertBefore = null;
    }
    insertHost.insertBefore(grid, insertBefore);
    if (toolbar) {
      grid.parentNode.insertBefore(toolbar, grid);
      toolbar.style.display = '';
      buildTags(toolbar);
      var s = toolbar.querySelector('#videosow-search');
      var so = toolbar.querySelector('#videosow-sort');
      if (s) s.addEventListener('input', function(){ state.q = s.value; if (s.value) ensureAllLoaded(); apply(); });
      if (so) so.addEventListener('change', function(){ state.sort = so.value; apply(); updateLoadMoreUI(); });
    }
    setupLoadMore(grid);
    hideArchiveTail(grid);
    hideNativePagination();
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
    <?php
}
add_action( 'wp_footer', 'videosow_sermon_archive_toolbar_js', 101 );

/* ── AI-Assist for Sermon Importer ─────────────── */

/**
 * Returns existing tag names across all sermon posts. Cached 1h.
 */
function videosow_get_existing_sermon_tags() {
    $cached = get_transient( 'videosow_existing_tags' );
    if ( is_array( $cached ) ) return $cached;
    $tags = get_terms( array(
        'taxonomy'   => 'videosow_tag',
        'hide_empty' => false,
        'fields'     => 'names',
        'number'     => 200,
    ) );
    if ( is_wp_error( $tags ) ) $tags = array();
    set_transient( 'videosow_existing_tags', $tags, HOUR_IN_SECONDS );
    return $tags;
}

/**
 * Resolve provider endpoint + headers + body shape.
 * Returns array( 'url', 'headers', 'body' ) or null.
 */
function videosow_ai_build_request( $cfg, $messages ) {
    $provider = isset( $cfg['aiProvider'] ) ? $cfg['aiProvider'] : 'openrouter';
    $model    = isset( $cfg['aiModel'] ) ? $cfg['aiModel'] : 'google/gemini-2.5-flash';
    $key      = isset( $cfg['aiApiKey'] ) ? $cfg['aiApiKey'] : '';
    if ( empty( $key ) ) return null;

    $body = array(
        'model'    => $model,
        'messages' => $messages,
    );

    if ( $provider === 'anthropic' ) {
        // Anthropic uses a different schema; convert messages.
        $system = '';
        $msgs   = array();
        foreach ( $messages as $m ) {
            if ( $m['role'] === 'system' ) { $system .= $m['content'] . "\n"; continue; }
            $msgs[] = array( 'role' => $m['role'], 'content' => $m['content'] );
        }
        return array(
            'url'     => 'https://api.anthropic.com/v1/messages',
            'headers' => array(
                'x-api-key'         => $key,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ),
            'body'    => array(
                'model'      => $model,
                'max_tokens' => 2048,
                'system'     => $system,
                'messages'   => $msgs,
            ),
        );
    }

    // OpenAI-compatible (OpenAI, OpenRouter, Lovable AI gateway)
    $url = 'https://openrouter.ai/api/v1/chat/completions';
    if ( $provider === 'openai' ) $url = 'https://api.openai.com/v1/chat/completions';
    if ( $provider === 'lovable' ) $url = 'https://ai.gateway.lovable.dev/v1/chat/completions';

    $body['response_format'] = array( 'type' => 'json_object' );

    return array(
        'url'     => $url,
        'headers' => array(
            'Authorization' => 'Bearer ' . $key,
            'Content-Type'  => 'application/json',
        ),
        'body'    => $body,
    );
}

/**
 * Call AI to enrich a sermon. Returns parsed result array or null.
 * Result keys (all optional): description (string), tags (string[]), excerpt (string), title (string).
 */
function videosow_ai_process_sermon( $cfg, $title, $description, $transcript, $existing_tags ) {
    if ( empty( $cfg['aiEnabled'] ) || empty( $cfg['aiApiKey'] ) || empty( $cfg['aiInstructions'] ) ) {
        return null;
    }

    $tchars = isset( $cfg['aiTranscriptChars'] ) ? intval( $cfg['aiTranscriptChars'] ) : 4000;
    // Normalize transcript: fetch function returns an array of segments {text,start,duration}.
    if ( is_array( $transcript ) ) {
        $parts = array();
        foreach ( $transcript as $seg ) {
            if ( is_array( $seg ) && isset( $seg['text'] ) ) {
                $parts[] = $seg['text'];
            } elseif ( is_string( $seg ) ) {
                $parts[] = $seg;
            }
        }
        $transcript = trim( implode( ' ', $parts ) );
    } elseif ( ! is_string( $transcript ) ) {
        $transcript = '';
    }
    if ( $tchars > 0 && ! empty( $transcript ) ) {
        $transcript = mb_substr( $transcript, 0, $tchars );
    } elseif ( $tchars === 0 ) {
        $transcript = '';
    }

    $tags_list = is_array( $existing_tags ) ? implode( ', ', array_slice( $existing_tags, 0, 200 ) ) : '';

    $system = "You are an editorial assistant. " .
        "Return STRICTLY a single valid JSON object with optional keys: " .
        "\"description\" (simple HTML string with <p>), \"tags\" (array of short strings), " .
        "\"excerpt\" (string max 160 characters), \"title\" (string). " .
        "Include only the keys the user requests via instructions. " .
        "Do not invent quotes or claims that are not in the sources.";

    $user = "=== INSTRUCTIONS ===\n" . $cfg['aiInstructions'] . "\n\n";
    if ( ! empty( $tags_list ) ) {
        if ( ! empty( $cfg['aiRestrictTags'] ) ) {
            $user .= "=== EXISTING SITE TAGS (REQUIRED: choose EXCLUSIVELY from this list, written IDENTICALLY; do NOT create new tags, do NOT change form; if none match, return \"tags\": []) ===\n" . $tags_list . "\n\n";
        } else {
            $user .= "=== EXISTING SITE TAGS (use them with priority) ===\n" . $tags_list . "\n\n";
        }
    }
    $user .= "=== CURRENT TITLE ===\n" . $title . "\n\n";
    $user .= "=== CURRENT DESCRIPTION ===\n" . $description . "\n\n";
    if ( ! empty( $transcript ) ) {
        $user .= "=== TRANSCRIPT ===\n" . $transcript . "\n";
    }

    $req = videosow_ai_build_request( $cfg, array(
        array( 'role' => 'system', 'content' => $system ),
        array( 'role' => 'user',   'content' => $user ),
    ) );
    if ( ! $req ) return null;

    $resp = wp_remote_post( $req['url'], array(
        'timeout' => 60,
        'headers' => $req['headers'],
        'body'    => wp_json_encode( $req['body'] ),
    ) );
    if ( is_wp_error( $resp ) ) return null;
    $code = wp_remote_retrieve_response_code( $resp );
    if ( $code < 200 || $code >= 300 ) return null;

    $data = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( ! is_array( $data ) ) return null;

    // Extract text content depending on provider shape
    $text = '';
    if ( isset( $data['choices'][0]['message']['content'] ) ) {
        $text = $data['choices'][0]['message']['content'];
    } elseif ( isset( $data['content'][0]['text'] ) ) {
        $text = $data['content'][0]['text'];
    }
    if ( ! is_string( $text ) || $text === '' ) return null;

    // Try to parse as JSON; if fails, try to extract first {...} block.
    $parsed = json_decode( $text, true );
    if ( ! is_array( $parsed ) ) {
        if ( preg_match( '/\{.*\}/s', $text, $m ) ) {
            $parsed = json_decode( $m[0], true );
        }
    }
    if ( ! is_array( $parsed ) ) return null;

    $out = array();
    if ( isset( $parsed['description'] ) && is_string( $parsed['description'] ) ) {
        $out['description'] = $parsed['description'];
    }
    if ( isset( $parsed['excerpt'] ) && is_string( $parsed['excerpt'] ) ) {
        $out['excerpt'] = $parsed['excerpt'];
    }
    if ( isset( $parsed['title'] ) && is_string( $parsed['title'] ) ) {
        $out['title'] = $parsed['title'];
    }
    if ( isset( $parsed['tags'] ) && is_array( $parsed['tags'] ) ) {
        $clean = array();
        foreach ( $parsed['tags'] as $t ) {
            if ( is_string( $t ) ) {
                $t = trim( wp_strip_all_tags( $t ) );
                if ( $t !== '' ) $clean[] = $t;
            }
        }
        if ( ! empty( $clean ) ) $out['tags'] = array_slice( array_values( array_unique( $clean ) ), 0, 15 );
    }
    return empty( $out ) ? null : $out;
}

/* Custom cron interval based on saved config */
function videosow_add_sermon_cron_intervals( $schedules ) {
    $cfg = videosow_get_sermon_importer_config();
    $h   = max( 1, intval( $cfg['syncIntervalH'] ) );
    $schedules['videosow_sync_interval'] = array(
        'interval' => $h * HOUR_IN_SECONDS,
        'display'  => sprintf( 'Antiohia Sermon Sync (%dh)', $h ),
    );
    return $schedules;
}
add_filter( 'cron_schedules', 'videosow_add_sermon_cron_intervals' );

function videosow_schedule_sermon_cron() {
    $cfg = videosow_get_sermon_importer_config();
    $next = wp_next_scheduled( 'videosow_sync_event' );
    if ( $cfg['enabled'] && ! empty( $cfg['apiKey'] ) && ! empty( $cfg['playlistId'] ) ) {
        if ( $next ) wp_unschedule_event( $next, 'videosow_sync_event' );
        wp_schedule_event( time() + 60, 'videosow_sync_interval', 'videosow_sync_event' );
    } else if ( $next ) {
        wp_unschedule_event( $next, 'videosow_sync_event' );
    }
}
add_action( 'wp', 'videosow_maybe_schedule_sermon_cron' );
function videosow_maybe_schedule_sermon_cron() {
    $cfg = videosow_get_sermon_importer_config();
    if ( $cfg['enabled'] && ! wp_next_scheduled( 'videosow_sync_event' ) && ! empty( $cfg['apiKey'] ) && ! empty( $cfg['playlistId'] ) ) {
        wp_schedule_event( time() + 60, 'videosow_sync_interval', 'videosow_sync_event' );
    }
}
add_action( 'videosow_sync_event', 'videosow_run_sermon_sync' );

/* AJAX: Save / Load sermon importer config */
function videosow_ajax_load_sermon_importer_config() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    wp_send_json_success( videosow_get_sermon_importer_config() );
}
add_action( 'wp_ajax_videosow_load_sermon_importer_config', 'videosow_ajax_load_sermon_importer_config' );

function videosow_ajax_save_sermon_importer_config() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $incoming = json_decode( stripslashes( $_POST['config'] ), true );
    if ( ! is_array( $incoming ) ) wp_send_json_error( 'Invalid config' );
    $current = videosow_get_sermon_importer_config();
    $merged  = array_merge( $current, array(
        'apiKey'        => isset( $incoming['apiKey'] ) ? sanitize_text_field( $incoming['apiKey'] ) : $current['apiKey'],
        'playlistId'    => isset( $incoming['playlistId'] ) ? sanitize_text_field( $incoming['playlistId'] ) : $current['playlistId'],
        'playlistIds'   => isset( $incoming['playlistIds'] ) && is_array( $incoming['playlistIds'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', $incoming['playlistIds'] ) ) ) : ( isset( $current['playlistIds'] ) ? $current['playlistIds'] : array() ),
        'playlistStats' => isset( $current['playlistStats'] ) && is_array( $current['playlistStats'] ) ? $current['playlistStats'] : array(),
        'slug'          => isset( $incoming['slug'] ) ? sanitize_title( $incoming['slug'] ) : $current['slug'],
        'syncIntervalH' => isset( $incoming['syncIntervalH'] ) ? max( 1, intval( $incoming['syncIntervalH'] ) ) : $current['syncIntervalH'],
        'enabled'       => isset( $incoming['enabled'] ) ? (bool) $incoming['enabled'] : $current['enabled'],
        'fetchTranscript'    => isset( $incoming['fetchTranscript'] ) ? (bool) $incoming['fetchTranscript'] : $current['fetchTranscript'],
        'transcriptLang'     => isset( $incoming['transcriptLang'] ) ? sanitize_text_field( $incoming['transcriptLang'] ) : $current['transcriptLang'],
        'transcriptDisplay'  => isset( $incoming['transcriptDisplay'] ) && in_array( $incoming['transcriptDisplay'], array( 'plain', 'details', 'hidden' ), true ) ? $incoming['transcriptDisplay'] : $current['transcriptDisplay'],
        'youtubeOAuthClientId' => isset( $incoming['youtubeOAuthClientId'] ) ? sanitize_text_field( $incoming['youtubeOAuthClientId'] ) : $current['youtubeOAuthClientId'],
        'youtubeOAuthClientSecret' => isset( $incoming['youtubeOAuthClientSecret'] ) ? sanitize_text_field( $incoming['youtubeOAuthClientSecret'] ) : $current['youtubeOAuthClientSecret'],
        'youtubeOAuthRefreshToken' => isset( $incoming['youtubeOAuthRefreshToken'] ) ? sanitize_text_field( $incoming['youtubeOAuthRefreshToken'] ) : $current['youtubeOAuthRefreshToken'],
        'youtubeChannelName' => isset( $incoming['youtubeChannelName'] ) ? sanitize_text_field( $incoming['youtubeChannelName'] ) : $current['youtubeChannelName'],
        'cloudTranscriptEnabled' => isset( $incoming['cloudTranscriptEnabled'] ) ? (bool) $incoming['cloudTranscriptEnabled'] : $current['cloudTranscriptEnabled'],
        'descriptionCleanup' => isset( $incoming['descriptionCleanup'] ) ? wp_kses_post( (string) $incoming['descriptionCleanup'] ) : $current['descriptionCleanup'],
        'archiveTitle'  => isset( $incoming['archiveTitle'] ) ? sanitize_text_field( $incoming['archiveTitle'] ) : $current['archiveTitle'],
        'archiveMetaTitle'         => isset( $incoming['archiveMetaTitle'] ) ? sanitize_text_field( $incoming['archiveMetaTitle'] ) : $current['archiveMetaTitle'],
        'archiveMetaDescription'   => isset( $incoming['archiveMetaDescription'] ) ? sanitize_textarea_field( $incoming['archiveMetaDescription'] ) : $current['archiveMetaDescription'],
        'archiveToolbarEnabled'    => isset( $incoming['archiveToolbarEnabled'] ) ? (bool) $incoming['archiveToolbarEnabled'] : $current['archiveToolbarEnabled'],
        'archiveShowSearch'        => isset( $incoming['archiveShowSearch'] ) ? (bool) $incoming['archiveShowSearch'] : $current['archiveShowSearch'],
        'archiveSidebarEnabled'    => isset( $incoming['archiveSidebarEnabled'] ) ? (bool) $incoming['archiveSidebarEnabled'] : ( isset( $current['archiveSidebarEnabled'] ) ? (bool) $current['archiveSidebarEnabled'] : false ),
        'singleSidebarEnabled'     => isset( $incoming['singleSidebarEnabled'] ) ? (bool) $incoming['singleSidebarEnabled'] : ( isset( $current['singleSidebarEnabled'] ) ? (bool) $current['singleSidebarEnabled'] : false ),
        'archiveLayout'            => isset( $incoming['archiveLayout'] ) && in_array( $incoming['archiveLayout'], array( 'theme', 'magazine-2', 'magazine-3', 'list' ), true ) ? $incoming['archiveLayout'] : ( isset( $current['archiveLayout'] ) ? $current['archiveLayout'] : 'theme' ),
        'archiveExcerptWords'      => isset( $incoming['archiveExcerptWords'] ) ? max( 5, min( 200, intval( $incoming['archiveExcerptWords'] ) ) ) : ( isset( $current['archiveExcerptWords'] ) ? max( 5, min( 200, intval( $current['archiveExcerptWords'] ) ) ) : 40 ),
        'archiveShowSort'          => isset( $incoming['archiveShowSort'] ) ? (bool) $incoming['archiveShowSort'] : $current['archiveShowSort'],
        'archiveShowTags'          => isset( $incoming['archiveShowTags'] ) ? (bool) $incoming['archiveShowTags'] : $current['archiveShowTags'],
        'archiveDefaultSort'       => isset( $incoming['archiveDefaultSort'] ) && in_array( $incoming['archiveDefaultSort'], array( 'date_desc', 'date_asc', 'views_desc' ), true ) ? $incoming['archiveDefaultSort'] : $current['archiveDefaultSort'],
        'archiveTagCloudMode'         => isset( $incoming['archiveTagCloudMode'] ) && in_array( $incoming['archiveTagCloudMode'], array( 'random', 'manual' ), true ) ? $incoming['archiveTagCloudMode'] : ( isset( $current['archiveTagCloudMode'] ) ? $current['archiveTagCloudMode'] : 'random' ),
        'archiveTagCloudLinesDesktop' => isset( $incoming['archiveTagCloudLinesDesktop'] ) ? max( 1, intval( $incoming['archiveTagCloudLinesDesktop'] ) ) : ( isset( $current['archiveTagCloudLinesDesktop'] ) ? $current['archiveTagCloudLinesDesktop'] : 2 ),
        'archiveTagCloudLinesMobile'  => isset( $incoming['archiveTagCloudLinesMobile'] ) ? max( 1, intval( $incoming['archiveTagCloudLinesMobile'] ) ) : ( isset( $current['archiveTagCloudLinesMobile'] ) ? $current['archiveTagCloudLinesMobile'] : 4 ),
        'archiveTagCloudPool'         => isset( $incoming['archiveTagCloudPool'] ) ? max( 1, intval( $incoming['archiveTagCloudPool'] ) ) : $current['archiveTagCloudPool'],
        'archiveTagCloudManualTags'   => isset( $incoming['archiveTagCloudManualTags'] ) && is_array( $incoming['archiveTagCloudManualTags'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', $incoming['archiveTagCloudManualTags'] ) ) ) : ( isset( $current['archiveTagCloudManualTags'] ) ? $current['archiveTagCloudManualTags'] : array() ),
        'simpleInstructions' => isset( $incoming['simpleInstructions'] ) && is_array( $incoming['simpleInstructions'] ) ? videosow_sanitize_simple_instructions( $incoming['simpleInstructions'] ) : $current['simpleInstructions'],
        'relaxedMode'        => isset( $incoming['relaxedMode'] ) ? (bool) $incoming['relaxedMode'] : $current['relaxedMode'],
        'relaxedDelayS'      => isset( $incoming['relaxedDelayS'] ) ? max( 0, intval( $incoming['relaxedDelayS'] ) ) : $current['relaxedDelayS'],
        'relaxedBatch'       => isset( $incoming['relaxedBatch'] ) ? max( 1, intval( $incoming['relaxedBatch'] ) ) : $current['relaxedBatch'],
        'relaxedPauseS'      => isset( $incoming['relaxedPauseS'] ) ? max( 0, intval( $incoming['relaxedPauseS'] ) ) : $current['relaxedPauseS'],
        'aiEnabled'          => isset( $incoming['aiEnabled'] ) ? (bool) $incoming['aiEnabled'] : $current['aiEnabled'],
        'aiProvider'         => isset( $incoming['aiProvider'] ) ? sanitize_text_field( $incoming['aiProvider'] ) : $current['aiProvider'],
        'aiModel'            => isset( $incoming['aiModel'] ) ? sanitize_text_field( $incoming['aiModel'] ) : $current['aiModel'],
        'aiApiKey'           => isset( $incoming['aiApiKey'] ) ? sanitize_text_field( $incoming['aiApiKey'] ) : $current['aiApiKey'],
        'aiInstructions'     => isset( $incoming['aiInstructions'] ) ? wp_kses_post( (string) $incoming['aiInstructions'] ) : $current['aiInstructions'],
        'aiTranscriptChars'  => isset( $incoming['aiTranscriptChars'] ) ? max( 0, intval( $incoming['aiTranscriptChars'] ) ) : $current['aiTranscriptChars'],
        'aiTemplates'        => isset( $incoming['aiTemplates'] ) && is_array( $incoming['aiTemplates'] ) ? videosow_sanitize_ai_templates( $incoming['aiTemplates'] ) : ( isset( $current['aiTemplates'] ) ? $current['aiTemplates'] : array() ),
        'aiRestrictTags'     => isset( $incoming['aiRestrictTags'] ) ? (bool) $incoming['aiRestrictTags'] : ( isset( $current['aiRestrictTags'] ) ? (bool) $current['aiRestrictTags'] : true ),
        'aiUseAiExcerpt'     => isset( $incoming['aiUseAiExcerpt'] ) ? (bool) $incoming['aiUseAiExcerpt'] : ( isset( $current['aiUseAiExcerpt'] ) ? (bool) $current['aiUseAiExcerpt'] : true ),
    ) );
    update_option( 'videosow_importer_config', $merged );
    // Refresh CPT slug + cron — re-register CPT so the NEW slug is used by flush_rewrite_rules.
    if ( post_type_exists( 'videosow_video' ) ) {
        unregister_post_type( 'videosow_video' );
    }
    if ( function_exists( 'videosow_register_sermon_cpt' ) ) {
        videosow_register_sermon_cpt();
    }
    flush_rewrite_rules( true );
    // Belt-and-suspenders: drop cached rules so they rebuild on the next request too.
    delete_option( 'rewrite_rules' );
    $next = wp_next_scheduled( 'videosow_sync_event' );
    if ( $next ) wp_unschedule_event( $next, 'videosow_sync_event' );
    if ( $merged['enabled'] && ! empty( $merged['apiKey'] ) && ! empty( $merged['playlistId'] ) ) {
        wp_schedule_event( time() + 60, 'videosow_sync_interval', 'videosow_sync_event' );
    }
    wp_send_json_success();
}
add_action( 'wp_ajax_videosow_save_sermon_importer_config', 'videosow_ajax_save_sermon_importer_config' );

/* AJAX: Manual sync trigger */
function videosow_ajax_run_sermon_sync() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $result = videosow_run_sermon_sync( true );
    wp_send_json_success( $result );
}
add_action( 'wp_ajax_videosow_run_sermon_sync', 'videosow_ajax_run_sermon_sync' );

/**
 * AJAX: backfill correct publishedAt + viewCount for already-imported sermons.
 * Fixes posts that were imported via the buggy playlistItems-only path
 * (where publishedAt was actually the date-added-to-playlist, and viewCount was 0).
 * Processes in batches of 50 (YouTube `videos` endpoint allows up to 50 IDs/call).
 * Accepts optional `offset` to resume across multiple AJAX calls for big libraries.
 */
function videosow_ajax_repair_sermon_metadata() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    $cfg = videosow_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) ) wp_send_json_error( 'Missing API Key' );

    $offset = isset( $_POST['offset'] ) ? max( 0, intval( $_POST['offset'] ) ) : 0;
    $batch  = 50;

    // Pull a page of sermon posts (any status) that have a video_id meta.
    $q = new WP_Query( array(
        'post_type'      => 'videosow_video',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'posts_per_page' => $batch,
        'offset'         => $offset,
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'meta_query'     => array( array( 'key' => '_videosow_yt_video_id', 'compare' => 'EXISTS' ) ),
        'fields'         => 'ids',
        'no_found_rows'  => false,
    ) );

    $total = (int) $q->found_posts;
    $ids   = $q->posts;

    if ( empty( $ids ) ) {
        wp_send_json_success( array(
            'done'      => true,
            'processed' => $offset,
            'total'     => $total,
            'updated'   => 0,
        ) );
    }

    // Map post_id → video_id
    $map = array();
    foreach ( $ids as $pid ) {
        $vid = get_post_meta( $pid, '_videosow_yt_video_id', true );
        if ( $vid ) $map[ $pid ] = $vid;
    }

    if ( empty( $map ) ) {
        wp_send_json_success( array(
            'done'      => ( $offset + count( $ids ) ) >= $total,
            'processed' => $offset + count( $ids ),
            'total'     => $total,
            'updated'   => 0,
        ) );
    }

    // Single API call for up to 50 IDs.
    $url  = add_query_arg( array(
        'part' => 'snippet,statistics',
        'id'   => implode( ',', array_values( $map ) ),
        'key'  => $cfg['apiKey'],
    ), 'https://www.googleapis.com/youtube/v3/videos' );
    $resp = wp_remote_get( $url, array( 'timeout' => 30 ) );
    if ( is_wp_error( $resp ) ) wp_send_json_error( 'YouTube API: ' . $resp->get_error_message() );
    $code = wp_remote_retrieve_response_code( $resp );
    $body = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( $code >= 400 ) {
        $msg = isset( $body['error']['message'] ) ? $body['error']['message'] : ( 'HTTP ' . $code );
        wp_send_json_error( 'YouTube API: ' . $msg );
    }
    $items = isset( $body['items'] ) ? $body['items'] : array();

    // Index API results by video id.
    $by_vid = array();
    foreach ( $items as $it ) {
        $vid = isset( $it['id'] ) ? $it['id'] : '';
        if ( $vid ) $by_vid[ $vid ] = $it;
    }

    $updated = 0;
    foreach ( $map as $pid => $vid ) {
        if ( ! isset( $by_vid[ $vid ] ) ) continue;
        $it = $by_vid[ $vid ];
        $published = isset( $it['snippet']['publishedAt'] ) ? $it['snippet']['publishedAt'] : '';
        $views     = isset( $it['statistics']['viewCount'] ) ? intval( $it['statistics']['viewCount'] ) : 0;

        if ( $published ) {
            $post_date_gmt = gmdate( 'Y-m-d H:i:s', strtotime( $published ) );
            $post_date     = get_date_from_gmt( $post_date_gmt );
            wp_update_post( array(
                'ID'            => $pid,
                'post_date'     => $post_date,
                'post_date_gmt' => $post_date_gmt,
                'edit_date'     => true,
            ) );
            update_post_meta( $pid, '_videosow_yt_published', $published );
        }
        update_post_meta( $pid, '_videosow_yt_views', $views );
        update_post_meta( $pid, '_videosow_yt_views_updated', time() );
        $updated++;
    }

    $next_offset = $offset + count( $ids );
    $done        = $next_offset >= $total;

    wp_send_json_success( array(
        'done'        => $done,
        'processed'   => $next_offset,
        'total'       => $total,
        'updated'     => $updated,
        'next_offset' => $done ? null : $next_offset,
    ) );
}
add_action( 'wp_ajax_videosow_repair_sermon_metadata', 'videosow_ajax_repair_sermon_metadata' );

/**
 * AJAX: Diagnose transcript fetch for a single YouTube video.
 * Tries each InnerTube client and the watch-page scrape, returning what each
 * strategy found so the user can see exactly where YouTube is blocking us.
 */
function videosow_ajax_diagnose_transcript() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $url   = isset( $_POST['url'] ) ? sanitize_text_field( wp_unslash( $_POST['url'] ) ) : '';
    $lang  = isset( $_POST['lang'] ) ? sanitize_text_field( wp_unslash( $_POST['lang'] ) ) : 'ro';
    $video_id = '';
    if ( preg_match( '/[?&]v=([A-Za-z0-9_-]{11})/', $url, $m ) ) $video_id = $m[1];
    elseif ( preg_match( '/youtu\.be\/([A-Za-z0-9_-]{11})/', $url, $m ) ) $video_id = $m[1];
    elseif ( preg_match( '/^([A-Za-z0-9_-]{11})$/', $url, $m ) ) $video_id = $m[1];
    if ( ! $video_id ) wp_send_json_error( 'URL/ID YouTube invalid' );

    $report = array( 'video_id' => $video_id, 'strategies' => array() );
    foreach ( array( 'ANDROID', 'IOS', 'WEB' ) as $client ) {
        $tracks = videosow_discover_caption_tracks_innertube( $video_id, $client );
        $report['strategies'][] = array(
            'name'   => 'InnerTube ' . $client,
            'tracks' => count( $tracks ),
            'langs'  => array_map( function( $t ) { return $t['lang'] . ( $t['kind'] === 'asr' ? ' (auto)' : '' ); }, $tracks ),
        );
    }
    // Scrape fallback (counted via discover_caption_tracks minus innertube path is hard;
    // do a direct scrape probe).
    $watch_url = 'https://www.youtube.com/watch?v=' . rawurlencode( $video_id ) . '&hl=en';
    $resp = wp_remote_get( $watch_url, array(
        'timeout' => 20,
        'headers' => array(
            'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
            'Accept-Language' => 'en-US,en;q=0.9',
            'Cookie'          => 'CONSENT=YES+cb.20210328-17-p0.en+FX+000',
        ),
    ) );
    $scrape_tracks = 0; $scrape_status = 'no-response';
    if ( ! is_wp_error( $resp ) ) {
        $code = wp_remote_retrieve_response_code( $resp );
        $html = wp_remote_retrieve_body( $resp );
        $scrape_status = 'http:' . $code . ' bytes:' . strlen( $html );
        if ( $html && preg_match( '/"captionTracks"\s*:\s*\[(.*?)\]/s', $html, $mm ) ) {
            $scrape_tracks = substr_count( $mm[1], '"baseUrl"' );
        }
    } else {
        $scrape_status = 'wp_error:' . $resp->get_error_message();
    }
    $report['strategies'][] = array( 'name' => 'Watch page scrape', 'tracks' => $scrape_tracks, 'langs' => array(), 'note' => $scrape_status );

    $cfg = videosow_get_sermon_importer_config();

    // Lovable Cloud edge function probe
    $cloud_segments = videosow_fetch_youtube_transcript_cloud( $video_id, $lang );
    $report['strategies'][] = array(
        'name'   => 'Lovable Cloud (edge function)',
        'tracks' => $cloud_segments ? 1 : 0,
        'langs'  => array(),
        'note'   => $cloud_segments ? ( count( $cloud_segments ) . ' segmente' ) : 'no segments',
    );

    // OAuth probe with detailed HTTP info for diagnosis.
    $oauth_tracks = array();
    $oauth_note   = 'OAuth not configured';
    if ( videosow_youtube_oauth_is_configured( $cfg ) ) {
        $token = videosow_youtube_oauth_access_token( $cfg );
        if ( ! $token ) {
            $oauth_note = 'OAuth: invalid refresh token (token endpoint failed)';
        } else {
            // Identify which channel the OAuth token actually belongs to.
            $oauth_channel_label = '';
            $oauth_channel_id = '';
            $rc = wp_remote_get(
                add_query_arg( array( 'part' => 'snippet', 'mine' => 'true' ), 'https://www.googleapis.com/youtube/v3/channels' ),
                array( 'timeout' => 20, 'headers' => array( 'Authorization' => 'Bearer ' . $token ) )
            );
            if ( ! is_wp_error( $rc ) && wp_remote_retrieve_response_code( $rc ) === 200 ) {
                $jc = json_decode( wp_remote_retrieve_body( $rc ), true );
                if ( ! empty( $jc['items'][0] ) ) {
                    $oauth_channel_id = isset( $jc['items'][0]['id'] ) ? $jc['items'][0]['id'] : '';
                    $title = isset( $jc['items'][0]['snippet']['title'] ) ? $jc['items'][0]['snippet']['title'] : '';
                    $oauth_channel_label = $title . ' (' . $oauth_channel_id . ')';
                } else {
                    $oauth_channel_label = 'no channel associated with the token';
                }
            } else {
                $oauth_channel_label = 'channels?mine HTTP ' . ( is_wp_error( $rc ) ? $rc->get_error_message() : wp_remote_retrieve_response_code( $rc ) );
            }
            // Identify the owner channel of the video being tested.
            $video_owner_label = '';
            $video_owner_id = '';
            $api_key_x = isset( $cfg['apiKey'] ) ? $cfg['apiKey'] : '';
            if ( $api_key_x ) {
                $rv = wp_remote_get( add_query_arg( array(
                    'part' => 'snippet', 'id' => $video_id, 'key' => $api_key_x,
                ), 'https://www.googleapis.com/youtube/v3/videos' ), array( 'timeout' => 20 ) );
                if ( ! is_wp_error( $rv ) && wp_remote_retrieve_response_code( $rv ) === 200 ) {
                    $jv = json_decode( wp_remote_retrieve_body( $rv ), true );
                    if ( ! empty( $jv['items'][0]['snippet'] ) ) {
                        $sn2 = $jv['items'][0]['snippet'];
                        $video_owner_id = isset( $sn2['channelId'] ) ? $sn2['channelId'] : '';
                        $video_owner_label = ( isset( $sn2['channelTitle'] ) ? $sn2['channelTitle'] : '' ) . ' (' . $video_owner_id . ')';
                    }
                }
            }

            $url = add_query_arg( array( 'part' => 'snippet', 'videoId' => $video_id ), 'https://www.googleapis.com/youtube/v3/captions' );
            $r = wp_remote_get( $url, array( 'timeout' => 25, 'headers' => array( 'Authorization' => 'Bearer ' . $token ) ) );
            if ( is_wp_error( $r ) ) {
                $oauth_note = 'OAuth HTTP error: ' . $r->get_error_message();
            } else {
                $hc = wp_remote_retrieve_response_code( $r );
                $bd = wp_remote_retrieve_body( $r );
                $jj = json_decode( $bd, true );
                if ( $hc >= 200 && $hc < 300 && ! empty( $jj['items'] ) ) {
                    foreach ( $jj['items'] as $it ) {
                        $sn = isset( $it['snippet'] ) ? $it['snippet'] : array();
                        $oauth_tracks[] = array(
                            'id'   => isset( $it['id'] ) ? $it['id'] : '',
                            'lang' => isset( $sn['language'] ) ? $sn['language'] : '',
                            'kind' => isset( $sn['trackKind'] ) ? $sn['trackKind'] : '',
                            'name' => isset( $sn['name'] ) ? $sn['name'] : '',
                        );
                    }
                    $oauth_note = 'OAuth OK (HTTP 200) — ' . count( $oauth_tracks ) . ' manual track(s)';
                } elseif ( $hc >= 200 && $hc < 300 ) {
                    $oauth_note = 'OAuth OK (HTTP 200) — items=[]';
                    if ( $oauth_channel_label || $video_owner_label ) {
                        $oauth_note .= ' | OAuth channel: ' . ( $oauth_channel_label ?: '?' ) . ' | Video owner: ' . ( $video_owner_label ?: '?' );
                        if ( $oauth_channel_id && $video_owner_id && $oauth_channel_id !== $video_owner_id ) {
                            $oauth_note .= ' ⚠ The OAuth token does NOT belong to the video\'s channel — re-authenticate with the Google account that owns the channel (note: with Brand Accounts you must select the brand at consent).';
                        } elseif ( $oauth_channel_id && $video_owner_id ) {
                            $oauth_note .= ' ✓ Accounts match — the video probably has no caption tracks available via the Data API.';
                        }
                    }
                } else {
                    $err_reason = '';
                    $err_status = '';
                    $err_reason_code = '';
                    if ( is_array( $jj ) && isset( $jj['error'] ) ) {
                        if ( isset( $jj['error']['message'] ) ) $err_reason = $jj['error']['message'];
                        if ( isset( $jj['error']['status'] ) )  $err_status = $jj['error']['status'];
                        if ( isset( $jj['error']['errors'][0]['reason'] ) ) $err_reason_code = $jj['error']['errors'][0]['reason'];
                    }
                    // Strip HTML tags and decode entities so we never show raw HTML in the UI.
                    $err_reason = trim( html_entity_decode( wp_strip_all_tags( $err_reason ), ENT_QUOTES, 'UTF-8' ) );
                    // Friendly summaries for the most common cases.
                    $friendly = '';
                    if ( $err_reason_code === 'quotaExceeded' || stripos( $err_reason, 'quota' ) !== false ) {
                        $friendly = 'Google quota exceeded for today (resets around midnight Pacific Time)';
                    } elseif ( $err_reason_code === 'rateLimitExceeded' || $err_reason_code === 'userRateLimitExceeded' ) {
                        $friendly = 'Google rate limit hit — try again in a few minutes';
                    } elseif ( $hc === 401 ) {
                        $friendly = 'OAuth token expired or invalid — reconnect the Google account';
                    } elseif ( $hc === 403 && $err_reason_code === 'forbidden' ) {
                        $friendly = 'Access denied — the OAuth account does not own this video';
                    }
                    if ( $friendly ) {
                        $oauth_note = 'OAuth HTTP ' . $hc . ' — ' . $friendly;
                    } else {
                        // Truncate long messages so the UI doesn't render a wall of text.
                        if ( strlen( $err_reason ) > 180 ) $err_reason = substr( $err_reason, 0, 177 ) . '…';
                        $oauth_note = 'OAuth HTTP ' . $hc . ( $err_status ? ' (' . $err_status . ')' : '' ) . ( $err_reason ? ' — ' . $err_reason : '' );
                    }
                }
            }
        }
    }
    $report['strategies'][] = array(
        'name'   => 'YouTube Data API captions.list',
        'tracks' => count( $oauth_tracks ),
        'langs'  => array_map( function( $t ) { return $t['lang'] . ( $t['kind'] === 'ASR' ? ' (auto)' : '' ); }, $oauth_tracks ),
        'note'   => $oauth_note,
    );

    // Final attempt: full pipeline (what import would actually use).
    $segments = videosow_fetch_youtube_transcript( $video_id, $lang, $cfg );
    $report['final'] = array(
        'segments' => count( $segments ),
        'chars'    => array_sum( array_map( function( $s ) { return strlen( $s['text'] ); }, $segments ) ),
        'preview'  => $segments ? mb_substr( $segments[0]['text'], 0, 120 ) : '',
    );
    wp_send_json_success( $report );
}
add_action( 'wp_ajax_videosow_diagnose_transcript', 'videosow_ajax_diagnose_transcript' );

/**
 * AJAX: Test a YouTube playlist — verify it's reachable with the configured API key
 * and return basic metadata (title, channel, item count, sample items).
 */
function videosow_ajax_test_playlist() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = videosow_get_sermon_importer_config();
    $api_key = isset( $cfg['apiKey'] ) ? $cfg['apiKey'] : '';
    if ( empty( $api_key ) ) wp_send_json_error( 'Missing YouTube API Key in settings.' );
    $raw = isset( $_POST['playlist'] ) ? trim( wp_unslash( $_POST['playlist'] ) ) : '';
    if ( $raw === '' ) wp_send_json_error( 'Enter a playlist ID or URL.' );
    // Extract playlist id from URL or accept raw id (PL..., UU..., LL..., FL..., OL...).
    $playlist_id = '';
    if ( preg_match( '~[?&]list=([A-Za-z0-9_-]+)~', $raw, $m ) ) {
        $playlist_id = $m[1];
    } elseif ( preg_match( '~^[A-Za-z0-9_-]{10,}$~', $raw ) ) {
        $playlist_id = $raw;
    }
    if ( $playlist_id === '' ) wp_send_json_error( 'Nu am putut extrage un ID valid de playlist.' );

    // 1) Playlist metadata
    $meta_url = add_query_arg( array(
        'part' => 'snippet,contentDetails',
        'id'   => $playlist_id,
        'key'  => $api_key,
    ), 'https://www.googleapis.com/youtube/v3/playlists' );
    $r = wp_remote_get( $meta_url, array( 'timeout' => 15 ) );
    if ( is_wp_error( $r ) ) wp_send_json_error( 'Network error: ' . $r->get_error_message() );
    $code = wp_remote_retrieve_response_code( $r );
    $body = json_decode( wp_remote_retrieve_body( $r ), true );
    if ( $code !== 200 ) {
        $err = isset( $body['error']['message'] ) ? $body['error']['message'] : ( 'HTTP ' . $code );
        wp_send_json_error( 'YouTube API: ' . $err );
    }
    if ( empty( $body['items'] ) ) {
        wp_send_json_error( 'Playlist inexistent sau privat.' );
    }
    $item = $body['items'][0];
    $snippet = isset( $item['snippet'] ) ? $item['snippet'] : array();
    $details = isset( $item['contentDetails'] ) ? $item['contentDetails'] : array();

    // 2) First few playlist items (sample)
    $items_url = add_query_arg( array(
        'part'       => 'snippet',
        'playlistId' => $playlist_id,
        'maxResults' => 5,
        'key'        => $api_key,
    ), 'https://www.googleapis.com/youtube/v3/playlistItems' );
    $ri = wp_remote_get( $items_url, array( 'timeout' => 15 ) );
    $samples = array();
    if ( ! is_wp_error( $ri ) && wp_remote_retrieve_response_code( $ri ) === 200 ) {
        $ib = json_decode( wp_remote_retrieve_body( $ri ), true );
        if ( ! empty( $ib['items'] ) ) {
            foreach ( $ib['items'] as $it ) {
                $samples[] = array(
                    'title'     => isset( $it['snippet']['title'] ) ? $it['snippet']['title'] : '',
                    'video_id'  => isset( $it['snippet']['resourceId']['videoId'] ) ? $it['snippet']['resourceId']['videoId'] : '',
                    'published' => isset( $it['snippet']['publishedAt'] ) ? $it['snippet']['publishedAt'] : '',
                );
            }
        }
    }

    wp_send_json_success( array(
        'playlist_id'  => $playlist_id,
        'title'        => isset( $snippet['title'] ) ? $snippet['title'] : '',
        'description'  => isset( $snippet['description'] ) ? mb_substr( (string) $snippet['description'], 0, 240 ) : '',
        'channel'      => isset( $snippet['channelTitle'] ) ? $snippet['channelTitle'] : '',
        'channel_id'   => isset( $snippet['channelId'] ) ? $snippet['channelId'] : '',
        'published_at' => isset( $snippet['publishedAt'] ) ? $snippet['publishedAt'] : '',
        'item_count'   => isset( $details['itemCount'] ) ? intval( $details['itemCount'] ) : 0,
        'thumbnail'    => isset( $snippet['thumbnails']['medium']['url'] ) ? $snippet['thumbnails']['medium']['url'] : '',
        'samples'      => $samples,
    ) );
}
add_action( 'wp_ajax_videosow_test_playlist', 'videosow_ajax_test_playlist' );

/**
 * Final safety net: lock in the YouTube publishedAt date for our CPT against any
 * third-party save_post hook that might overwrite it. Runs at very late priority.
 */
function videosow_lock_yt_date( $post_id, $post, $update ) {
    if ( wp_is_post_revision( $post_id ) ) return;
    if ( $post->post_type !== 'videosow_video' ) return;
    $published = get_post_meta( $post_id, '_videosow_yt_published', true );
    if ( ! $published ) return;
    $gmt   = gmdate( 'Y-m-d H:i:s', strtotime( $published ) );
    $local = get_date_from_gmt( $gmt );
    if ( $post->post_date_gmt === $gmt ) return;
    global $wpdb;
    $wpdb->update( $wpdb->posts, array(
        'post_date'     => $local,
        'post_date_gmt' => $gmt,
    ), array( 'ID' => $post_id ) );
    clean_post_cache( $post_id );
}
add_action( 'save_post_videosow_video', 'videosow_lock_yt_date', 99999, 3 );

/* ── YouTube OAuth: one-click connect flow ───────── */

function videosow_get_oauth_redirect_uri() {
    return admin_url( 'admin.php?page=video-sow&videosow_oauth_callback=1' );
}

/**
 * AJAX: returns the redirect URI (for display in wizard) and starts the OAuth flow
 * by generating a CSRF state token and building the Google authorization URL.
 */
function videosow_ajax_start_oauth() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = videosow_get_sermon_importer_config();
    if ( empty( $cfg['youtubeOAuthClientId'] ) || empty( $cfg['youtubeOAuthClientSecret'] ) ) {
        wp_send_json_error( 'Lipsesc Client ID sau Client Secret.' );
    }
    $state = wp_generate_password( 32, false );
    set_transient( 'videosow_oauth_state_' . $state, 1, 10 * MINUTE_IN_SECONDS );
    $url = add_query_arg( array(
        'client_id'     => $cfg['youtubeOAuthClientId'],
        'redirect_uri'  => videosow_get_oauth_redirect_uri(),
        'response_type' => 'code',
        'scope'         => 'https://www.googleapis.com/auth/youtube.force-ssl',
        'access_type'   => 'offline',
        'prompt'        => 'consent',
        'include_granted_scopes' => 'true',
        'state'         => $state,
    ), 'https://accounts.google.com/o/oauth2/v2/auth' );
    wp_send_json_success( array( 'auth_url' => $url, 'redirect_uri' => videosow_get_oauth_redirect_uri() ) );
}
add_action( 'wp_ajax_videosow_start_oauth', 'videosow_ajax_start_oauth' );

function videosow_ajax_get_oauth_redirect_uri() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    wp_send_json_success( array( 'redirect_uri' => videosow_get_oauth_redirect_uri() ) );
}
add_action( 'wp_ajax_videosow_get_oauth_redirect_uri', 'videosow_ajax_get_oauth_redirect_uri' );

/**
 * AJAX: disconnect — wipe stored refresh token, access token, channel name.
 */
function videosow_ajax_disconnect_oauth() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = videosow_get_sermon_importer_config();
    // Best-effort token revoke
    if ( ! empty( $cfg['youtubeOAuthRefreshToken'] ) ) {
        wp_remote_post( 'https://oauth2.googleapis.com/revoke', array(
            'timeout' => 10,
            'body'    => array( 'token' => $cfg['youtubeOAuthRefreshToken'] ),
        ) );
    }
    $cfg['youtubeOAuthRefreshToken'] = '';
    $cfg['youtubeChannelName'] = '';
    update_option( 'videosow_importer_config', $cfg );
    delete_transient( 'videosow_oauth_access_token' );
    wp_send_json_success();
}
add_action( 'wp_ajax_videosow_disconnect_oauth', 'videosow_ajax_disconnect_oauth' );

/**
 * AJAX: test that the stored OAuth credentials still work by calling channels.list?mine=true.
 */
function videosow_ajax_test_oauth() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = videosow_get_sermon_importer_config();
    $token = videosow_youtube_oauth_access_token( $cfg );
    if ( ! $token ) wp_send_json_error( 'Could not obtain access token. Please reconnect.' );
    $resp = wp_remote_get( 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', array(
        'timeout' => 20,
        'headers' => array( 'Authorization' => 'Bearer ' . $token ),
    ) );
    if ( is_wp_error( $resp ) ) wp_send_json_error( $resp->get_error_message() );
    $code = wp_remote_retrieve_response_code( $resp );
    $json = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( $code < 200 || $code >= 300 ) wp_send_json_error( 'HTTP ' . $code );
    $name = isset( $json['items'][0]['snippet']['title'] ) ? (string) $json['items'][0]['snippet']['title'] : '';
    if ( $name && $name !== $cfg['youtubeChannelName'] ) {
        $cfg['youtubeChannelName'] = $name;
        update_option( 'videosow_importer_config', $cfg );
    }
    wp_send_json_success( array( 'channel' => $name ) );
}
add_action( 'wp_ajax_videosow_test_oauth', 'videosow_ajax_test_oauth' );

/**
 * Handles the OAuth callback redirect from Google. Triggered on admin_init when
 * Google redirects back with ?videosow_oauth_callback=1&code=xxx&state=yyy.
 */
function videosow_handle_oauth_callback() {
    if ( empty( $_GET['videosow_oauth_callback'] ) ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;

    $code  = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : '';
    $state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';
    $error = isset( $_GET['error'] ) ? sanitize_text_field( wp_unslash( $_GET['error'] ) ) : '';

    $base = admin_url( 'admin.php?page=video-sow' );

    if ( $error ) {
        wp_safe_redirect( add_query_arg( array( 'videosow_oauth' => 'error', 'reason' => rawurlencode( $error ) ), $base ) );
        exit;
    }
    if ( ! $code || ! $state || ! get_transient( 'videosow_oauth_state_' . $state ) ) {
        wp_safe_redirect( add_query_arg( array( 'videosow_oauth' => 'error', 'reason' => 'invalid_state' ), $base ) );
        exit;
    }
    delete_transient( 'videosow_oauth_state_' . $state );

    $cfg = videosow_get_sermon_importer_config();
    if ( empty( $cfg['youtubeOAuthClientId'] ) || empty( $cfg['youtubeOAuthClientSecret'] ) ) {
        wp_safe_redirect( add_query_arg( array( 'videosow_oauth' => 'error', 'reason' => 'missing_credentials' ), $base ) );
        exit;
    }

    $resp = wp_remote_post( 'https://oauth2.googleapis.com/token', array(
        'timeout' => 25,
        'body'    => array(
            'code'          => $code,
            'client_id'     => $cfg['youtubeOAuthClientId'],
            'client_secret' => $cfg['youtubeOAuthClientSecret'],
            'redirect_uri'  => videosow_get_oauth_redirect_uri(),
            'grant_type'    => 'authorization_code',
        ),
    ) );
    if ( is_wp_error( $resp ) ) {
        wp_safe_redirect( add_query_arg( array( 'videosow_oauth' => 'error', 'reason' => rawurlencode( $resp->get_error_message() ) ), $base ) );
        exit;
    }
    $json = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( empty( $json['refresh_token'] ) ) {
        $reason = isset( $json['error'] ) ? $json['error'] : 'no_refresh_token';
        wp_safe_redirect( add_query_arg( array( 'videosow_oauth' => 'error', 'reason' => rawurlencode( $reason ) ), $base ) );
        exit;
    }
    $cfg['youtubeOAuthRefreshToken'] = sanitize_text_field( $json['refresh_token'] );
    if ( ! empty( $json['access_token'] ) ) {
        $ttl = ! empty( $json['expires_in'] ) ? max( 60, intval( $json['expires_in'] ) - 120 ) : 3300;
        set_transient( 'videosow_oauth_access_token', $json['access_token'], $ttl );
    }

    // Fetch channel name for display.
    if ( ! empty( $json['access_token'] ) ) {
        $ch = wp_remote_get( 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', array(
            'timeout' => 20,
            'headers' => array( 'Authorization' => 'Bearer ' . $json['access_token'] ),
        ) );
        if ( ! is_wp_error( $ch ) && wp_remote_retrieve_response_code( $ch ) >= 200 && wp_remote_retrieve_response_code( $ch ) < 300 ) {
            $cj = json_decode( wp_remote_retrieve_body( $ch ), true );
            if ( ! empty( $cj['items'][0]['snippet']['title'] ) ) {
                $cfg['youtubeChannelName'] = sanitize_text_field( $cj['items'][0]['snippet']['title'] );
            }
        }
    }
    update_option( 'videosow_importer_config', $cfg );

    wp_safe_redirect( add_query_arg( array( 'videosow_oauth' => 'connected' ), $base ) );
    exit;
}
add_action( 'admin_init', 'videosow_handle_oauth_callback' );

/* ── Live progress sync: scan + step ─────────────── */

/**
 * Scan playlist: fetches all video IDs, stores them in an option as a queue,
 * and returns the total count for the progress UI.
 */
function videosow_ajax_scan_sermon_playlist() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    delete_transient( 'videosow_sync_cancelled' );
    $cfg = videosow_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) || empty( $cfg['playlistId'] ) ) {
        wp_send_json_error( 'Missing API Key or Playlist ID' );
    }

    $api_key    = $cfg['apiKey'];
    $playlist   = $cfg['playlistId'];
    $page_token = '';
    $videos     = array();
    $safety     = 0;

    do {
        $safety++;
        if ( $safety > 50 ) break;
        $url = add_query_arg( array(
            'part'       => 'snippet,contentDetails',
            'maxResults' => 50,
            'playlistId' => $playlist,
            'key'        => $api_key,
            'pageToken'  => $page_token,
        ), 'https://www.googleapis.com/youtube/v3/playlistItems' );
        $resp = wp_remote_get( $url, array( 'timeout' => 30 ) );
        if ( is_wp_error( $resp ) ) wp_send_json_error( 'YouTube API: ' . $resp->get_error_message() );
        $code = wp_remote_retrieve_response_code( $resp );
        $body = json_decode( wp_remote_retrieve_body( $resp ), true );
        if ( $code >= 400 ) {
            $msg = isset( $body['error']['message'] ) ? $body['error']['message'] : ( 'HTTP ' . $code );
            wp_send_json_error( 'YouTube API: ' . $msg );
        }
        $items = isset( $body['items'] ) ? $body['items'] : array();
        foreach ( $items as $item ) {
            $sn  = isset( $item['snippet'] ) ? $item['snippet'] : array();
            $vid = isset( $sn['resourceId']['videoId'] ) ? $sn['resourceId']['videoId'] : '';
            $tit = isset( $sn['title'] ) ? $sn['title'] : '';
            if ( ! $vid ) continue;
            if ( $tit === 'Private video' || $tit === 'Deleted video' ) continue;
            $videos[] = $vid;
        }
        $page_token = isset( $body['nextPageToken'] ) ? $body['nextPageToken'] : '';
    } while ( ! empty( $page_token ) );

    // Filter out already-imported (so progress total reflects actual work)
    $remaining = array();
    $already   = 0;
    foreach ( $videos as $vid ) {
        $existing = get_posts( array(
            'post_type'      => 'videosow_video',
            'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
            'meta_key'       => '_videosow_yt_video_id',
            'meta_value'     => $vid,
            'posts_per_page' => 1,
            'fields'         => 'ids',
        ) );
        if ( empty( $existing ) ) $remaining[] = $vid;
        else $already++;
    }

    $session = array(
        'queue'        => $remaining,
        'total'        => count( $remaining ),
        'total_in_pl'  => count( $videos ),
        'already'      => $already,
        'imported'     => array(),
        'started_at'   => time(),
    );
    update_option( 'videosow_sync_session', $session, false );

    wp_send_json_success( array(
        'total'       => $session['total'],
        'total_in_pl' => $session['total_in_pl'],
        'already'     => $session['already'],
    ) );
}
add_action( 'wp_ajax_videosow_scan_sermon_playlist', 'videosow_ajax_scan_sermon_playlist' );

function videosow_ajax_cancel_sermon_sync() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    $cfg     = videosow_get_sermon_importer_config();
    $session = get_option( 'videosow_sync_session', array() );
    $imported = isset( $session['imported'] ) && is_array( $session['imported'] ) ? $session['imported'] : array();

    if ( ! empty( $imported ) ) {
        videosow_log_sync( $cfg, 'error', sprintf( 'Cancelled manually after %d imported', count( $imported ) ), $imported );
    }
    set_transient( 'videosow_sync_cancelled', 1, 10 * MINUTE_IN_SECONDS );
    delete_option( 'videosow_sync_session' );

    wp_send_json_success( array( 'cancelled' => true, 'imported' => count( $imported ) ) );
}
add_action( 'wp_ajax_videosow_cancel_sermon_sync', 'videosow_ajax_cancel_sermon_sync' );

/**
 * Clear the sermon importer log (the "Recent imports" history shown in the widget).
 * Imported posts themselves are not touched.
 */
function videosow_ajax_clear_sermon_log() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = get_option( 'videosow_importer_config', array() );
    if ( ! is_array( $cfg ) ) $cfg = array();
    $cfg['log'] = array();
    $cfg['totalImported'] = 0;
    update_option( 'videosow_importer_config', $cfg );
    wp_send_json_success( array( 'cleared' => true ) );
}
add_action( 'wp_ajax_videosow_clear_sermon_log', 'videosow_ajax_clear_sermon_log' );

/**
 * Step: process the next video from the queue. Returns the imported entry + remaining count.
 */
function videosow_ajax_step_sermon_sync() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    $cfg     = videosow_get_sermon_importer_config();
    $session = get_option( 'videosow_sync_session', array() );

    if ( get_transient( 'videosow_sync_cancelled' ) ) {
        delete_transient( 'videosow_sync_cancelled' );
        delete_option( 'videosow_sync_session' );
        wp_send_json_success( array( 'done' => true, 'cancelled' => true ) );
    }

    if ( ! empty( $session['rest_until'] ) ) {
        $remaining_rest = intval( $session['rest_until'] ) - time();
        if ( $remaining_rest > 0 ) {
            wp_send_json_success( array(
                'done'         => false,
                'resting'      => true,
                'progress'     => isset( $session['total'], $session['queue'] ) ? intval( $session['total'] ) - count( $session['queue'] ) : 0,
                'total'        => isset( $session['total'] ) ? intval( $session['total'] ) : 0,
                'remaining'    => isset( $session['queue'] ) && is_array( $session['queue'] ) ? count( $session['queue'] ) : 0,
                'rest_seconds' => $remaining_rest,
                'rest_reason'  => isset( $session['rest_reason'] ) ? $session['rest_reason'] : 'Coffee break',
            ) );
        }
        unset( $session['rest_until'], $session['rest_reason'] );
        update_option( 'videosow_sync_session', $session, false );
    }
    if ( empty( $session ) || empty( $session['queue'] ) ) {
        // Done — finalize log + counters
        if ( ! empty( $session ) ) {
            $imported = isset( $session['imported'] ) ? $session['imported'] : array();
            $msg = sprintf( '%d imported', count( $imported ) );
            videosow_log_sync( $cfg, 'success', $msg, $imported );
            $cfg2 = videosow_get_sermon_importer_config();
            $cfg2['firstSyncDone'] = true;
            update_option( 'videosow_importer_config', $cfg2 );
            delete_option( 'videosow_sync_session' );
        }
        wp_send_json_success( array( 'done' => true ) );
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $video_id = array_shift( $session['queue'] );
    videosow_set_stage( 'starting', $video_id );
    $entry    = videosow_import_one_video( $cfg, $video_id );
    videosow_clear_stage();

    if ( $entry ) {
        $session['imported'][] = $entry;
    }

    if ( get_transient( 'videosow_sync_cancelled' ) ) {
        delete_transient( 'videosow_sync_cancelled' );
        delete_option( 'videosow_sync_session' );
        wp_send_json_success( array( 'done' => true, 'cancelled' => true, 'entry' => $entry ) );
    }

    $remaining = count( $session['queue'] );
    $done      = $session['total'] - $remaining;

    // Persist session AFTER processing
    update_option( 'videosow_sync_session', $session, false );

    // If done after this step, finalize immediately
    $is_finished = $remaining === 0;
    if ( $is_finished ) {
        $imported = $session['imported'];
        $msg = sprintf( '%d imported', count( $imported ) );
        videosow_log_sync( $cfg, 'success', $msg, $imported );
        $cfg2 = videosow_get_sermon_importer_config();
        $cfg2['firstSyncDone'] = true;
        update_option( 'videosow_importer_config', $cfg2 );
        delete_option( 'videosow_sync_session' );
    }

    // Compute the relaxed-mode rest interval the client should display BEFORE
    // requesting the next step (so the user sees a "Resting" status with
    // remaining seconds instead of an idle gap).
    $rest_seconds = 0;
    $rest_reason  = '';
    if ( ! $is_finished && ! empty( $cfg['relaxedMode'] ) ) {
        $r_delay = max( 0, intval( isset( $cfg['relaxedDelayS'] ) ? $cfg['relaxedDelayS'] : 3 ) );
        $r_batch = max( 1, intval( isset( $cfg['relaxedBatch'] ) ? $cfg['relaxedBatch'] : 10 ) );
        $r_pause = max( 0, intval( isset( $cfg['relaxedPauseS'] ) ? $cfg['relaxedPauseS'] : 10 ) );
        if ( $done > 0 && ( $done % $r_batch ) === 0 && $r_pause > 0 ) {
            $rest_seconds = $r_pause;
            $rest_reason  = 'Coffee break';
        } elseif ( $r_delay > 0 ) {
            $rest_seconds = $r_delay;
            $rest_reason  = 'pause between videos';
        }
        if ( $rest_seconds > 0 ) {
            $session['rest_until']  = time() + $rest_seconds;
            $session['rest_reason'] = $rest_reason;
            update_option( 'videosow_sync_session', $session, false );
        }
    }

    wp_send_json_success( array(
        'done'      => $is_finished,
        'entry'     => $entry,
        'progress'  => $done,
        'total'     => $session['total'],
        'remaining' => $remaining,
        'rest_seconds' => $rest_seconds,
        'rest_reason'  => $rest_reason,
    ) );
}
add_action( 'wp_ajax_videosow_step_sermon_sync', 'videosow_ajax_step_sermon_sync' );

/**
 * AJAX: poll the current per-video stage (used by the dashboard while a step
 * is in flight, so the user sees what the server is doing right now).
 */
function videosow_ajax_get_sermon_stage() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $st = get_transient( 'videosow_current_stage' );
    if ( ! is_array( $st ) ) $st = array( 'stage' => '', 'detail' => '', 'ts' => 0 );
    $st['cancel_pending'] = (bool) get_transient( 'videosow_sync_cancelled' );
    wp_send_json_success( $st );
}
add_action( 'wp_ajax_videosow_get_sermon_stage', 'videosow_ajax_get_sermon_stage' );

/**
 * Import a single video by ID. Returns the imported entry array (or null on skip/error).
 * Extracted from videosow_run_sermon_sync so step endpoint can reuse it.
 */
function videosow_import_one_video( $cfg, $video_id ) {
    if ( empty( $video_id ) || empty( $cfg['apiKey'] ) ) return null;
    videosow_set_stage( 'starting', $video_id );

    // Dedup
    $existing = get_posts( array(
        'post_type'      => 'videosow_video',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'meta_key'       => '_videosow_yt_video_id',
        'meta_value'     => $video_id,
        'posts_per_page' => 1,
        'fields'         => 'ids',
    ) );
    if ( ! empty( $existing ) ) return null;

    // Fetch fresh snippet from videos endpoint (more reliable than playlistItems cache)
    $url  = add_query_arg( array(
        'part' => 'snippet,statistics',
        'id'   => $video_id,
        'key'  => $cfg['apiKey'],
    ), 'https://www.googleapis.com/youtube/v3/videos' );
    $resp = videosow_http_get_retry( $url, array( 'timeout' => 30 ) );
    if ( is_wp_error( $resp ) ) {
        error_log( '[VideoSow] videos endpoint failed for ' . $video_id . ': ' . $resp->get_error_message() );
        return null;
    }
    $code = wp_remote_retrieve_response_code( $resp );
    $body = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( $code >= 400 ) {
        $msg = isset( $body['error']['message'] ) ? $body['error']['message'] : ( 'HTTP ' . $code );
        error_log( '[VideoSow] videos endpoint HTTP ' . $code . ' for ' . $video_id . ': ' . $msg );
        return null;
    }
    $items = isset( $body['items'] ) ? $body['items'] : array();
    if ( empty( $items ) ) {
        error_log( '[VideoSow] videos endpoint returned no items for ' . $video_id );
        return null;
    }
    $sn = isset( $items[0]['snippet'] ) ? $items[0]['snippet'] : array();
    $stats_views = isset( $items[0]['statistics']['viewCount'] ) ? intval( $items[0]['statistics']['viewCount'] ) : 0;

    $title       = isset( $sn['title'] ) ? $sn['title'] : '';
    if ( $title === 'Private video' || $title === 'Deleted video' || $title === '' ) return null;
    $description = isset( $sn['description'] ) ? $sn['description'] : '';
    $published   = isset( $sn['publishedAt'] ) ? $sn['publishedAt'] : '';
    $thumb_url   = '';
    if ( isset( $sn['thumbnails'] ) ) {
        foreach ( array( 'maxres', 'standard', 'high', 'medium', 'default' ) as $sz ) {
            if ( isset( $sn['thumbnails'][ $sz ]['url'] ) ) { $thumb_url = $sn['thumbnails'][ $sz ]['url']; break; }
        }
    }

    if ( ! empty( $cfg['descriptionCleanup'] ) ) {
        $description = videosow_clean_description( $description, $cfg['descriptionCleanup'] );
    }
    if ( ! empty( $cfg['simpleInstructions'] ) ) {
        $description = videosow_apply_simple_instructions( $description, $cfg['simpleInstructions'] );
        // Hashtags removal also operates on the title.
        foreach ( (array) $cfg['simpleInstructions'] as $ins ) {
            if ( is_array( $ins ) && isset( $ins['type'] ) && $ins['type'] === 'hashtags' ) {
                $title = trim( preg_replace( '/\s+/u', ' ', preg_replace( '/(^|\s)#[\p{L}\p{N}_]+/u', '$1', $title ) ) );
                break;
            }
        }
    }

    // Fetch transcript (may also be needed by AI)
    $transcript = '';
    if ( ! empty( $cfg['fetchTranscript'] ) || ! empty( $cfg['aiEnabled'] ) ) {
        $tr_lang = isset( $cfg['transcriptLang'] ) ? $cfg['transcriptLang'] : 'ro';
        // NOTE: each tier (local InnerTube, OAuth, Cloud) inside
        // videosow_fetch_youtube_transcript() already does its own retries
        // and fallbacks. An outer retry loop here turned a single video into
        // 60–120s of API thrashing, which often hit PHP max_execution_time
        // and dropped the transcript silently. A single call is correct.
        videosow_set_stage( 'fetching_transcript', $video_id );
        $transcript = videosow_fetch_youtube_transcript( $video_id, $tr_lang, $cfg );
    }

    // AI-Assist (optional): may rewrite description/title/excerpt and suggest tags
    $ai_tags    = array();
    $ai_excerpt = '';
    if ( ! empty( $cfg['aiEnabled'] ) ) {
        videosow_set_stage( 'ai_processing', $video_id );
        // Pre-compute speaker tag (from simple instructions) BEFORE asking AI,
        // so that a brand-new speaker is already included in the "existing tags"
        // list the AI must choose from.
        $pre_speaker_tags = videosow_extract_speaker_tags( $title, isset( $cfg['simpleInstructions'] ) ? $cfg['simpleInstructions'] : array() );
        $existing_tags    = videosow_get_existing_sermon_tags();
        if ( ! empty( $pre_speaker_tags ) ) {
            foreach ( $pre_speaker_tags as $st ) {
                if ( ! in_array( $st, $existing_tags, true ) ) $existing_tags[] = $st;
            }
        }
        $ai = videosow_ai_process_sermon( $cfg, $title, $description, $transcript, $existing_tags );
        if ( is_array( $ai ) ) {
            if ( ! empty( $ai['description'] ) ) $description = $ai['description'];
            if ( ! empty( $ai['title'] ) )       $title       = $ai['title'];
            if ( ! empty( $ai['excerpt'] ) )     $ai_excerpt  = $ai['excerpt'];
            if ( ! empty( $ai['tags'] ) ) {
                $ai_tags = $ai['tags'];
                // If restriction is on, drop any tag the AI invented that isn't
                // already a known tag on the site (case-insensitive match).
                if ( ! empty( $cfg['aiRestrictTags'] ) && ! empty( $existing_tags ) ) {
                    $allowed_lc = array();
                    foreach ( $existing_tags as $et ) { $allowed_lc[ mb_strtolower( $et ) ] = $et; }
                    $filtered = array();
                    foreach ( $ai_tags as $t ) {
                        $key = mb_strtolower( trim( (string) $t ) );
                        if ( isset( $allowed_lc[ $key ] ) ) $filtered[] = $allowed_lc[ $key ];
                    }
                    $ai_tags = array_values( array_unique( $filtered ) );
                }
            }
        }
    }

    $content  = '[embed]https://www.youtube.com/watch?v=' . $video_id . "[/embed]\n\n";
    $content .= wp_kses_post( wpautop( $description ) );
    $tdisplay = isset( $cfg['transcriptDisplay'] ) ? $cfg['transcriptDisplay'] : 'plain';
    if ( ! empty( $cfg['fetchTranscript'] ) && ! empty( $transcript ) && $tdisplay !== 'hidden' ) {
        $content .= "\n\n" . videosow_render_transcript_block( $transcript, $tdisplay );
    }

    $post_date = $published ? gmdate( 'Y-m-d H:i:s', strtotime( $published ) ) : current_time( 'mysql', 1 );
    // Excerpt source: AI excerpt only when explicitly enabled; otherwise first part of description.
    $use_ai_excerpt = ( $ai_excerpt !== '' && ! empty( $cfg['aiUseAiExcerpt'] ) );
    // CRITICAL: insert spaces at paragraph/line-break boundaries BEFORE stripping tags,
    // otherwise "<p>foo</p><p>bar</p>" collapses to "foobar".
    $excerpt_raw = $use_ai_excerpt ? $ai_excerpt : (string) $description;
    $excerpt_raw = preg_replace( '~</p>|<br\s*/?>|</div>|</li>~i', "\n", $excerpt_raw );
    $excerpt_source = wp_strip_all_tags( $excerpt_raw );
    // First, ensure paragraph boundaries (blank lines OR single newlines after sentence-ending punctuation)
    // become a single space so adjacent paragraphs never merge ("foo.Bar" or "foo\nBar" → "foo. Bar").
    $excerpt_source = str_replace( array( "\r\n", "\r" ), "\n", (string) $excerpt_source );
    // Collapse ALL whitespace runs (including newlines from emoji-line-breaks) into a single space.
    $excerpt_source = preg_replace( '/\s+/u', ' ', $excerpt_source );
    $excerpt_source = trim( $excerpt_source );
    // Store a generously long excerpt at import time (max 200 words). The
    // archive page trims it down further client-side based on the configured
    // archiveExcerptWords setting, so changes apply live to existing posts too.
    $cfg_words = max( 5, min( 200, intval( isset( $cfg['archiveExcerptWords'] ) ? $cfg['archiveExcerptWords'] : 40 ) ) );
    $store_words = max( 200, $cfg_words );
    $final_excerpt  = $use_ai_excerpt ? $excerpt_source : wp_trim_words( $excerpt_source, $store_words, '…' );

    // CRITICAL: install a temporary filter that forces post_date/post_date_gmt for our
    // wp_insert_post call below. Other plugins (SEO, theme save_post hooks) sometimes
    // mutate post data after we set it; this filter runs inside wp_insert_post and is
    // the most robust way to make YouTube's publishedAt stick from the very first write.
    $kp_force_date = $published ? $post_date : '';
    $kp_date_filter = null;
    if ( $kp_force_date ) {
        $kp_date_filter = function( $data ) use ( $kp_force_date ) {
            if ( isset( $data['post_type'] ) && $data['post_type'] === 'videosow_video' ) {
                $data['post_date_gmt']     = $kp_force_date;
                $data['post_date']         = get_date_from_gmt( $kp_force_date );
                $data['post_modified_gmt'] = $kp_force_date;
                $data['post_modified']     = get_date_from_gmt( $kp_force_date );
            }
            return $data;
        };
        add_filter( 'wp_insert_post_data', $kp_date_filter, 9999 );
    }
    videosow_set_stage( 'creating_article', $title );
    $post_id = wp_insert_post( array(
        'post_title'    => wp_strip_all_tags( $title ),
        'post_content'  => $content,
        'post_excerpt'  => $final_excerpt,
        'post_status'   => 'draft',
        'post_type'     => 'videosow_video',
        'post_date_gmt' => $post_date,
        'post_date'     => get_date_from_gmt( $post_date ),
        'edit_date'     => true,
    ), true );
    if ( $kp_date_filter ) remove_filter( 'wp_insert_post_data', $kp_date_filter, 9999 );
    if ( is_wp_error( $post_id ) ) return null;

    // Belt-and-suspenders: cron-context inserts sometimes ignore post_date for
    // drafts (WP forces post_date_gmt to 0000-00-00 unless edit_date is honored,
    // and some filters reset it). Force dates with wp_update_post AND a direct
    // $wpdb->update so YouTube's publishedAt always sticks.
    if ( $published ) {
        $local_date = get_date_from_gmt( $post_date );
        wp_update_post( array(
            'ID'            => $post_id,
            'post_date'     => $local_date,
            'post_date_gmt' => $post_date,
            'edit_date'     => true,
        ) );
        global $wpdb;
        $wpdb->update(
            $wpdb->posts,
            array(
                'post_date'         => $local_date,
                'post_date_gmt'     => $post_date,
                'post_modified'     => $local_date,
                'post_modified_gmt' => $post_date,
            ),
            array( 'ID' => $post_id )
        );
        clean_post_cache( $post_id );
        // Some themes display via get_the_date() which respects 'date_format';
        // also store as post meta for fallback display in the synthetic grid.
        update_post_meta( $post_id, '_videosow_yt_published_local', $local_date );
    }

    update_post_meta( $post_id, '_videosow_yt_video_id', $video_id );
    update_post_meta( $post_id, '_videosow_yt_published', $published );
    update_post_meta( $post_id, '_videosow_yt_views', $stats_views );
    update_post_meta( $post_id, '_videosow_yt_views_updated', time() );

    // Always store transcript status + raw text as post meta (diagnostic + reuse).
    if ( ! empty( $cfg['fetchTranscript'] ) ) {
        if ( ! empty( $transcript ) && is_array( $transcript ) ) {
            $raw_lines = array();
            foreach ( $transcript as $seg ) {
                if ( ! empty( $seg['text'] ) ) $raw_lines[] = $seg['text'];
            }
            $raw_text = trim( implode( ' ', $raw_lines ) );
            update_post_meta( $post_id, '_videosow_transcript', $raw_text );
            update_post_meta( $post_id, '_videosow_transcript_status', 'ok:' . strlen( $raw_text ) . 'chars' );
        } else {
            update_post_meta( $post_id, '_videosow_transcript_status', 'empty:no-captions' );
        }
    }

    if ( ! empty( $ai_tags ) ) {
        wp_set_object_terms( $post_id, $ai_tags, 'videosow_tag', false );
        update_post_meta( $post_id, '_videosow_ai_processed', 1 );
        delete_transient( 'videosow_existing_tags' );
    } elseif ( ! empty( $cfg['aiEnabled'] ) ) {
        update_post_meta( $post_id, '_videosow_ai_processed', 1 );
    }

    // Speaker → tag (extracted from title, append-only).
    $speaker_tags = videosow_extract_speaker_tags( $title, isset( $cfg['simpleInstructions'] ) ? $cfg['simpleInstructions'] : array() );
    if ( ! empty( $speaker_tags ) ) {
        wp_set_object_terms( $post_id, $speaker_tags, 'videosow_tag', true );
        delete_transient( 'videosow_existing_tags' );
    }

    if ( $thumb_url ) {
        $tmp = download_url( $thumb_url, 20 );
        if ( ! is_wp_error( $tmp ) ) {
            $file_array = array( 'name' => 'yt-' . $video_id . '.jpg', 'tmp_name' => $tmp );
            $att_id = media_handle_sideload( $file_array, $post_id, $title );
            if ( ! is_wp_error( $att_id ) ) set_post_thumbnail( $post_id, $att_id );
            else @unlink( $tmp );
        }
    }

    // FINAL safety net: after thumbnail sideload + term assignments + meta updates,
    // re-force the YouTube publishedAt date directly via $wpdb. Some themes/plugins
    // hook into save_post / set_object_terms and call wp_update_post, which can
    // reset post_date back to "now". This is the last write before we return.
    if ( $published ) {
        global $wpdb;
        $local_date = get_date_from_gmt( $post_date );
        $wpdb->update(
            $wpdb->posts,
            array(
                'post_date'         => $local_date,
                'post_date_gmt'     => $post_date,
                'post_modified'     => $local_date,
                'post_modified_gmt' => $post_date,
            ),
            array( 'ID' => $post_id )
        );
        clean_post_cache( $post_id );
    }

    return array(
        'id'        => $post_id,
        'title'     => $title,
        'video_id'  => $video_id,
        'edit_link' => get_edit_post_link( $post_id, 'raw' ),
        'permalink' => get_permalink( $post_id ),
    );
}

/**
 * Run a sync. If $manual === true and firstSyncDone is false, performs full backfill.
 * Otherwise pages until it hits an already-imported video (incremental).
 */
function videosow_run_sermon_sync( $manual = false ) {
    $cfg = videosow_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) || empty( $cfg['playlistId'] ) ) {
        return videosow_log_sync( $cfg, 'error', 'Missing API Key or Playlist ID', array() );
    }

    $is_backfill = empty( $cfg['firstSyncDone'] );
    $api_key     = $cfg['apiKey'];
    $playlist    = $cfg['playlistId'];
    $imported    = array();
    $skipped     = 0;
    $page_token  = '';
    $safety      = 0;

    $relaxed       = ! empty( $cfg['relaxedMode'] );
    $relaxed_delay = max( 0, intval( isset( $cfg['relaxedDelayS'] ) ? $cfg['relaxedDelayS'] : 3 ) );
    $relaxed_batch = max( 1, intval( isset( $cfg['relaxedBatch'] ) ? $cfg['relaxedBatch'] : 10 ) );
    $relaxed_pause = max( 0, intval( isset( $cfg['relaxedPauseS'] ) ? $cfg['relaxedPauseS'] : 10 ) );
    if ( $relaxed ) {
        // Give PHP plenty of time when throttling
        @set_time_limit( 0 );
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    do {
        $safety++;
        if ( $safety > 50 ) break; // hard cap (50 pages * 50 = 2500 videos)

        $url = add_query_arg( array(
            'part'       => 'snippet,contentDetails',
            'maxResults' => 50,
            'playlistId' => $playlist,
            'key'        => $api_key,
            'pageToken'  => $page_token,
        ), 'https://www.googleapis.com/youtube/v3/playlistItems' );

        $resp = wp_remote_get( $url, array( 'timeout' => 30 ) );
        if ( is_wp_error( $resp ) ) {
            return videosow_log_sync( $cfg, 'error', 'YouTube API: ' . $resp->get_error_message(), $imported );
        }
        $code = wp_remote_retrieve_response_code( $resp );
        $body = json_decode( wp_remote_retrieve_body( $resp ), true );
        if ( $code >= 400 ) {
            $msg = isset( $body['error']['message'] ) ? $body['error']['message'] : ( 'HTTP ' . $code );
            return videosow_log_sync( $cfg, 'error', 'YouTube API: ' . $msg, $imported );
        }

        $items = isset( $body['items'] ) ? $body['items'] : array();
        $hit_existing = false;

        foreach ( $items as $item ) {
            $sn       = isset( $item['snippet'] ) ? $item['snippet'] : array();
            $video_id = isset( $sn['resourceId']['videoId'] ) ? $sn['resourceId']['videoId'] : '';
            if ( ! $video_id ) continue;

            // Dedup
            $existing = get_posts( array(
                'post_type'      => 'videosow_video',
                'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
                'meta_key'       => '_videosow_yt_video_id',
                'meta_value'     => $video_id,
                'posts_per_page' => 1,
                'fields'         => 'ids',
            ) );
            if ( ! empty( $existing ) ) {
                $skipped++;
                if ( ! $is_backfill ) { $hit_existing = true; }
                continue;
            }

            // Delegate to the canonical importer (which queries the `videos` endpoint
            // for the REAL publishedAt + viewCount — playlistItems.snippet.publishedAt
            // is the date added to the playlist, not the upload date).
            $entry = videosow_import_one_video( $cfg, $video_id );
            if ( $entry ) {
                $imported[] = $entry;
            } else {
                $skipped++;
                continue;
            }

            // Relaxed mode: throttle to give the server room to breathe
            if ( $relaxed ) {
                $count_so_far = count( $imported );
                if ( $relaxed_batch > 0 && ( $count_so_far % $relaxed_batch ) === 0 ) {
                    if ( $relaxed_pause > 0 ) sleep( $relaxed_pause );
                } elseif ( $relaxed_delay > 0 ) {
                    sleep( $relaxed_delay );
                }
            }
        }

        $page_token = isset( $body['nextPageToken'] ) ? $body['nextPageToken'] : '';

        // Incremental sync stops as soon as we hit an existing video
        if ( ! $is_backfill && $hit_existing ) break;
    } while ( ! empty( $page_token ) );

    $cfg['firstSyncDone'] = true;
    $msg = sprintf( '%d imported, %d skipped', count( $imported ), $skipped );
    return videosow_log_sync( $cfg, 'success', $msg, $imported );
}

function videosow_log_sync( $cfg, $status, $msg, $imported ) {
    $entry = array(
        'time'     => time(),
        'status'   => $status,
        'message'  => $msg,
        'count'    => count( $imported ),
        'imported' => array_slice( $imported, 0, 10 ),
    );
    $log = isset( $cfg['log'] ) && is_array( $cfg['log'] ) ? $cfg['log'] : array();
    array_unshift( $log, $entry );
    $cfg['log']            = array_slice( $log, 0, 20 );
    $cfg['lastSyncAt']     = $entry['time'];
    $cfg['lastSyncStatus'] = $status;
    $cfg['lastSyncMsg']    = $msg;
    // Always count imported items toward the total — even on partial/error runs
    // (e.g. user cancelled mid-sync). Otherwise the dashboard shows 0 while
    // posts were in fact created.
    if ( ! empty( $imported ) ) {
        $cfg['totalImported'] = intval( $cfg['totalImported'] ) + count( $imported );
    }

    // Per-playlist stats: mirror lastSync* + totalImported + firstSyncDone keyed
    // by the active playlist ID, so the UI can show stats relevant to whatever
    // playlist the user is currently viewing.
    $pid = isset( $cfg['playlistId'] ) ? (string) $cfg['playlistId'] : '';
    if ( $pid !== '' ) {
        $stats = isset( $cfg['playlistStats'] ) && is_array( $cfg['playlistStats'] ) ? $cfg['playlistStats'] : array();
        $cur = isset( $stats[ $pid ] ) && is_array( $stats[ $pid ] ) ? $stats[ $pid ] : array();
        $cur['lastSyncAt']     = $entry['time'];
        $cur['lastSyncStatus'] = $status;
        $cur['lastSyncMsg']    = $msg;
        if ( ! empty( $imported ) ) {
            $cur['totalImported'] = intval( isset( $cur['totalImported'] ) ? $cur['totalImported'] : 0 ) + count( $imported );
        } elseif ( ! isset( $cur['totalImported'] ) ) {
            $cur['totalImported'] = 0;
        }
        if ( $status === 'success' ) {
            $cur['firstSyncDone'] = true;
        } elseif ( ! isset( $cur['firstSyncDone'] ) ) {
            $cur['firstSyncDone'] = false;
        }
        $stats[ $pid ] = $cur;
        $cfg['playlistStats'] = $stats;
    }

    update_option( 'videosow_importer_config', $cfg );
    return $entry;
}

/* ── YouTube transcript fetching ───────────────── */

/**
 * Remove user-defined boilerplate blocks from a YouTube description.
 * Blocks are separated by a line containing only "---". Whitespace-insensitive
 * (collapses runs of whitespace) so small formatting differences still match.
 */
function videosow_clean_description( $description, $cleanup_raw ) {
    if ( empty( $cleanup_raw ) || ! is_string( $cleanup_raw ) ) return $description;
    $cleanup_raw = str_replace( array( "\r\n", "\r" ), "\n", $cleanup_raw );
    // Split blocks ONLY on a line containing exclusively five or more "^" characters.
    // We avoid using "---" or "===" as separators because such runs frequently appear
    // inside real YouTube descriptions as visual dividers, and would otherwise be
    // interpreted as block separators here.
    $blocks = preg_split( '/^\s*\^{5,}\s*$/m', $cleanup_raw );
    if ( ! is_array( $blocks ) ) return $description;

    $desc = str_replace( array( "\r\n", "\r" ), "\n", (string) $description );

    foreach ( $blocks as $block ) {
        $block = trim( $block );
        if ( $block === '' ) continue;
        // Strict literal removal: delete every exact occurrence of the block as-is.
        $desc = str_replace( $block, '', $desc );
    }

    // Collapse 3+ blank lines down to a single blank line, trim edges.
    $desc = preg_replace( "/\n{3,}/", "\n\n", $desc );
    return trim( $desc );
}

/**
 * Sanitize the array of simple-instruction pills coming from the React UI.
 */
function videosow_sanitize_simple_instructions( $list ) {
    $allowed_types = array( 'boilerplate', 'hashtags', 'trailing_whitespace', 'speaker_tag' );
    $clean = array();
    foreach ( (array) $list as $item ) {
        if ( ! is_array( $item ) ) continue;
        $type = isset( $item['type'] ) ? sanitize_key( $item['type'] ) : '';
        if ( ! in_array( $type, $allowed_types, true ) ) continue;
        $row = array(
            'id'   => isset( $item['id'] ) ? sanitize_text_field( (string) $item['id'] ) : wp_generate_password( 8, false ),
            'type' => $type,
        );
        if ( $type === 'boilerplate' ) {
            $row['value'] = isset( $item['value'] ) ? wp_kses_post( (string) $item['value'] ) : '';
        }
        $clean[] = $row;
    }
    return $clean;
}

function videosow_sanitize_ai_templates( $list ) {
    $clean = array();
    foreach ( (array) $list as $item ) {
        if ( ! is_array( $item ) ) continue;
        $clean[] = array(
            'id'    => isset( $item['id'] ) ? sanitize_text_field( (string) $item['id'] ) : wp_generate_password( 8, false ),
            'label' => isset( $item['label'] ) ? sanitize_text_field( (string) $item['label'] ) : 'Template',
            'text'  => isset( $item['text'] ) ? wp_kses_post( (string) $item['text'] ) : '',
        );
    }
    return $clean;
}

/**
 * Apply the ordered list of simple-instruction pills to a description string.
 */
function videosow_apply_simple_instructions( $description, $instructions ) {
    if ( ! is_array( $instructions ) || empty( $instructions ) ) return $description;
    $desc = str_replace( array( "\r\n", "\r" ), "\n", (string) $description );
    foreach ( $instructions as $ins ) {
        if ( ! is_array( $ins ) || empty( $ins['type'] ) ) continue;
        switch ( $ins['type'] ) {
            case 'boilerplate':
                $val = isset( $ins['value'] ) ? trim( (string) $ins['value'] ) : '';
                if ( $val !== '' ) {
                    $val = str_replace( array( "\r\n", "\r" ), "\n", $val );
                    $desc = str_replace( $val, '', $desc );
                }
                break;
            case 'hashtags':
                // Remove hashtags like #cuvant or #ABC123 (Unicode-aware).
                $desc = preg_replace( '/(^|\s)#[\p{L}\p{N}_]+/u', '$1', $desc );
                break;
            case 'trailing_whitespace':
                // Normalize line endings.
                $desc = str_replace( array( "\r\n", "\r" ), "\n", $desc );
                // Strip whitespace at the end of every line.
                $desc = preg_replace( "/[ \t]+\n/", "\n", $desc );
                // Collapse 2+ blank lines (anywhere) into a single blank line (one paragraph break).
                $desc = preg_replace( "/\n[ \t]*\n(?:[ \t]*\n)+/", "\n\n", $desc );
                // Strip trailing whitespace + empty lines/paragraphs.
                $desc = rtrim( $desc );
                break;
            case 'speaker_tag':
                // No-op on description; handled separately via title.
                break;
        }
        // Collapse 3+ blank lines after each step.
        $desc = preg_replace( "/\n{3,}/", "\n\n", $desc );
    }
    return trim( $desc );
}

/**
 * If the simple instructions list contains "speaker_tag" and the title ends with
 * a parenthesised name like "… (Pastor Ion Popescu)", return that name as a tag
 * candidate. Title itself is left untouched.
 */
function videosow_extract_speaker_tags( $title, $instructions ) {
    if ( ! is_array( $instructions ) || empty( $instructions ) ) return array();
    $has = false;
    foreach ( $instructions as $ins ) {
        if ( is_array( $ins ) && isset( $ins['type'] ) && $ins['type'] === 'speaker_tag' ) { $has = true; break; }
    }
    if ( ! $has ) return array();
    $title = trim( (string) $title );
    if ( $title === '' ) return array();
    if ( ! preg_match( '/\(([^()]+)\)\s*$/u', $title, $m ) ) return array();
    $name = trim( $m[1] );
    if ( $name === '' ) return array();
    return array( $name );
}

/**
 * Fetch the transcript / captions for a YouTube video.
 * Uses public timedtext first, then YouTube Data API OAuth as official fallback.
 * Returns an array of segments: [ [ 'start' => float, 'text' => string ], ... ] or empty array.
 */
function videosow_fetch_youtube_transcript( $video_id, $preferred_lang = 'ro', $cfg = null ) {
    if ( empty( $video_id ) ) return array();

    $preferred_lang = strtolower( $preferred_lang );

    // TIER 1 — try local extraction (InnerTube + watch-page scrape) from the
    // client's own server IP. Free, fast, no external dependency.
    // Try twice with a short pause between attempts to absorb transient
    // network blips / temporary InnerTube hiccups before falling through.
    $tracks = videosow_discover_caption_tracks( $video_id );
    if ( empty( $tracks ) ) {
        usleep( 600000 ); // 0.6s
        $tracks = videosow_discover_caption_tracks( $video_id );
    }
    if ( empty( $tracks ) ) {
        error_log( '[VideoSow] Tier 1 (local) found no caption tracks for ' . $video_id );
    }

    // Build prioritized candidate list of baseUrls.
    $ordered = array();
    // Manual in preferred lang
    foreach ( $tracks as $tr ) {
        if ( strpos( strtolower( $tr['lang'] ), $preferred_lang ) === 0 && $tr['kind'] !== 'asr' ) $ordered[] = $tr;
    }
    // Manual in English
    foreach ( $tracks as $tr ) {
        if ( strpos( strtolower( $tr['lang'] ), 'en' ) === 0 && $tr['kind'] !== 'asr' ) $ordered[] = $tr;
    }
    // Any other manual
    foreach ( $tracks as $tr ) {
        if ( $tr['kind'] !== 'asr' && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    }
    // ASR in preferred lang
    foreach ( $tracks as $tr ) {
        if ( $tr['kind'] === 'asr' && strpos( strtolower( $tr['lang'] ), $preferred_lang ) === 0 ) $ordered[] = $tr;
    }
    // ASR English
    foreach ( $tracks as $tr ) {
        if ( $tr['kind'] === 'asr' && strpos( strtolower( $tr['lang'] ), 'en' ) === 0 ) $ordered[] = $tr;
    }
    // Any ASR (with translation to preferred lang if available)
    foreach ( $tracks as $tr ) {
        if ( $tr['kind'] === 'asr' && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    }

    foreach ( $ordered as $tr ) {
        if ( empty( $tr['baseUrl'] ) ) continue;
        $url = $tr['baseUrl'];
        // Force XML format (timedtext baseUrl already returns XML by default).
        // If track lang differs from preferred and translation supported, request tlang.
        if ( ! empty( $tr['translatable'] ) && strpos( strtolower( $tr['lang'] ), $preferred_lang ) !== 0 ) {
            $url = add_query_arg( array( 'tlang' => $preferred_lang ), $url );
        }
        // One retry on transient failure (network blip, 5xx).
        $segments = array();
        for ( $attempt = 0; $attempt < 2 && empty( $segments ); $attempt++ ) {
            if ( $attempt > 0 ) usleep( 500000 );
            $resp = wp_remote_get( $url, array(
                'timeout' => 25,
                'headers' => array(
                    'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
                    'Accept-Language' => $preferred_lang . ',en;q=0.8',
                ),
            ) );
            if ( is_wp_error( $resp ) ) continue;
            $code = wp_remote_retrieve_response_code( $resp );
            if ( $code < 200 || $code >= 300 ) continue;
            $body = wp_remote_retrieve_body( $resp );
            if ( ! $body ) continue;
            $segments = videosow_parse_timedtext_xml( $body );
            if ( empty( $segments ) ) $segments = videosow_parse_timedtext_json( $body );
        }
        if ( ! empty( $segments ) ) return $segments;
    }

    if ( ! is_array( $cfg ) ) {
        $cfg = videosow_get_sermon_importer_config();
    }

    // TIER 2 — OAuth via YouTube Data API (most reliable when configured;
    // user owns the channel so quota is generous and there is no anti-bot wall).
    if ( videosow_youtube_oauth_is_configured( $cfg ) ) {
        error_log( '[VideoSow] Tier 1 empty, trying OAuth for ' . $video_id );
        $oauth = videosow_fetch_youtube_transcript_oauth( $video_id, $preferred_lang, $cfg );
        if ( ! empty( $oauth ) ) return $oauth;
        error_log( '[VideoSow] OAuth transcript empty for ' . $video_id . ', falling back to cloud' );
    } else {
        error_log( '[VideoSow] OAuth not configured for ' . $video_id );
    }

    // TIER 3 — Lovable Cloud edge function. Runs the same InnerTube/scrape
    // logic from a different IP pool, last-resort when both local & OAuth fail.
    if ( ! isset( $cfg['cloudTranscriptEnabled'] ) || ! empty( $cfg['cloudTranscriptEnabled'] ) ) {
        error_log( '[VideoSow] Trying cloud transcript for ' . $video_id );
        $cloud = videosow_fetch_youtube_transcript_cloud( $video_id, $preferred_lang );
        if ( ! empty( $cloud ) ) return $cloud;
        error_log( '[VideoSow] Cloud transcript also empty for ' . $video_id );
    }

    return array();
}

/**
 * TIER 2 — Ask the Lovable Cloud edge function for the transcript.
 * No auth required (the endpoint is public and verify_jwt=false).
 */
function videosow_fetch_youtube_transcript_cloud( $video_id, $preferred_lang ) {
    $endpoint = 'https://iekrogrsxnlajemidshf.supabase.co/functions/v1/get-transcript';
    $resp = wp_remote_post( $endpoint, array(
        'timeout' => 35,
        'headers' => array( 'Content-Type' => 'application/json' ),
        'body'    => wp_json_encode( array(
            'videoId' => $video_id,
            'lang'    => $preferred_lang,
        ) ),
    ) );
    if ( is_wp_error( $resp ) ) return array();
    $code = wp_remote_retrieve_response_code( $resp );
    if ( $code < 200 || $code >= 300 ) return array();
    $json = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( ! is_array( $json ) || empty( $json['ok'] ) || empty( $json['segments'] ) ) return array();
    $segments = array();
    foreach ( $json['segments'] as $seg ) {
        if ( ! is_array( $seg ) || ! isset( $seg['text'] ) ) continue;
        $segments[] = array(
            'start' => isset( $seg['start'] ) ? (float) $seg['start'] : 0.0,
            'text'  => (string) $seg['text'],
        );
    }
    return $segments;
}

function videosow_youtube_oauth_is_configured( $cfg ) {
    return is_array( $cfg )
        && ! empty( $cfg['youtubeOAuthClientId'] )
        && ! empty( $cfg['youtubeOAuthClientSecret'] )
        && ! empty( $cfg['youtubeOAuthRefreshToken'] );
}

function videosow_youtube_oauth_access_token( $cfg ) {
    if ( ! videosow_youtube_oauth_is_configured( $cfg ) ) return '';
    $cached = get_transient( 'videosow_oauth_access_token' );
    if ( is_string( $cached ) && $cached !== '' ) return $cached;

    $resp = wp_remote_post( 'https://oauth2.googleapis.com/token', array(
        'timeout' => 25,
        'body'    => array(
            'client_id'     => $cfg['youtubeOAuthClientId'],
            'client_secret' => $cfg['youtubeOAuthClientSecret'],
            'refresh_token' => $cfg['youtubeOAuthRefreshToken'],
            'grant_type'    => 'refresh_token',
        ),
    ) );
    if ( is_wp_error( $resp ) ) return '';
    if ( wp_remote_retrieve_response_code( $resp ) < 200 || wp_remote_retrieve_response_code( $resp ) >= 300 ) return '';
    $json = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( empty( $json['access_token'] ) ) return '';
    $ttl = ! empty( $json['expires_in'] ) ? max( 60, intval( $json['expires_in'] ) - 120 ) : 3300;
    set_transient( 'videosow_oauth_access_token', $json['access_token'], $ttl );
    return $json['access_token'];
}

function videosow_youtube_api_caption_tracks( $video_id, $cfg ) {
    $token = videosow_youtube_oauth_access_token( $cfg );
    if ( ! $token ) return array();
    $url = add_query_arg( array(
        'part'    => 'snippet',
        'videoId' => $video_id,
    ), 'https://www.googleapis.com/youtube/v3/captions' );
    $resp = wp_remote_get( $url, array(
        'timeout' => 25,
        'headers' => array( 'Authorization' => 'Bearer ' . $token ),
    ) );
    if ( is_wp_error( $resp ) ) {
        error_log( '[videosow][oauth] captions.list wp_error: ' . $resp->get_error_message() );
        return array();
    }
    $code = wp_remote_retrieve_response_code( $resp );
    if ( $code < 200 || $code >= 300 ) {
        error_log( '[videosow][oauth] captions.list HTTP ' . $code . ' body=' . substr( wp_remote_retrieve_body( $resp ), 0, 300 ) );
        return array();
    }
    $json = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( empty( $json['items'] ) || ! is_array( $json['items'] ) ) return array();
    $out = array();
    foreach ( $json['items'] as $item ) {
        if ( empty( $item['id'] ) ) continue;
        $sn = isset( $item['snippet'] ) && is_array( $item['snippet'] ) ? $item['snippet'] : array();
        $out[] = array(
            'id'   => (string) $item['id'],
            'lang' => isset( $sn['language'] ) ? (string) $sn['language'] : '',
            'name' => isset( $sn['name'] ) ? (string) $sn['name'] : '',
            'kind' => isset( $sn['trackKind'] ) ? (string) $sn['trackKind'] : '',
        );
    }
    return $out;
}

function videosow_fetch_youtube_transcript_oauth( $video_id, $preferred_lang, $cfg ) {
    $tracks = videosow_youtube_api_caption_tracks( $video_id, $cfg );
    if ( empty( $tracks ) ) return array();

    $preferred_lang = strtolower( $preferred_lang );
    $ordered = array();
    foreach ( $tracks as $tr ) if ( strpos( strtolower( $tr['lang'] ), $preferred_lang ) === 0 && strtoupper( $tr['kind'] ) !== 'ASR' ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( strpos( strtolower( $tr['lang'] ), 'en' ) === 0 && strtoupper( $tr['kind'] ) !== 'ASR' && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( strtoupper( $tr['kind'] ) !== 'ASR' && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( strpos( strtolower( $tr['lang'] ), $preferred_lang ) === 0 && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;

    $token = videosow_youtube_oauth_access_token( $cfg );
    if ( ! $token ) return array();
    foreach ( $ordered as $tr ) {
        $url = add_query_arg( array( 'alt' => 'media', 'tfmt' => 'srt' ), 'https://www.googleapis.com/youtube/v3/captions/' . rawurlencode( $tr['id'] ) );
        $resp = wp_remote_get( $url, array(
            'timeout' => 35,
            'headers' => array( 'Authorization' => 'Bearer ' . $token ),
        ) );
        if ( is_wp_error( $resp ) ) continue;
        if ( wp_remote_retrieve_response_code( $resp ) < 200 || wp_remote_retrieve_response_code( $resp ) >= 300 ) continue;
        $body = wp_remote_retrieve_body( $resp );
        if ( ! $body ) continue;
        $segments = videosow_parse_srt_captions( $body );
        if ( ! empty( $segments ) ) return $segments;
    }
    return array();
}

/**
 * Scrape the YouTube watch page to discover available caption tracks.
 * Returns array of [ 'lang', 'name', 'kind' ('asr'|''), 'baseUrl', 'translatable' ].
 */
function videosow_discover_caption_tracks( $video_id ) {
    // Strategy 1: youtubei/v1/player using ANDROID client — most reliable on
    // server IPs (no PoToken / consent wall). Web client is often blocked.
    // Order: IOS first (best track-discovery success rate in 2025), then ANDROID, then WEB.
    $tracks = videosow_discover_caption_tracks_innertube( $video_id, 'IOS' );
    if ( ! empty( $tracks ) ) return $tracks;
    $tracks = videosow_discover_caption_tracks_innertube( $video_id, 'ANDROID' );
    if ( ! empty( $tracks ) ) return $tracks;
    $tracks = videosow_discover_caption_tracks_innertube( $video_id, 'WEB' );
    if ( ! empty( $tracks ) ) return $tracks;

    // Strategy 2: scrape the watch page (legacy fallback).
    $watch_url = 'https://www.youtube.com/watch?v=' . rawurlencode( $video_id ) . '&hl=en';
    $resp = wp_remote_get( $watch_url, array(
        'timeout' => 25,
        'headers' => array(
            'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
            'Accept-Language' => 'en-US,en;q=0.9',
            'Cookie'          => 'CONSENT=YES+cb.20210328-17-p0.en+FX+000',
        ),
    ) );
    if ( is_wp_error( $resp ) ) return array();
    $html = wp_remote_retrieve_body( $resp );
    if ( ! $html ) return array();

    return videosow_extract_caption_tracks_from_html( $html );
}

/**
 * Robust extraction of caption tracks from a YouTube watch-page HTML blob.
 * Tries (1) a direct regex on the "captionTracks":[...] array (handles
 * unicode-escaped baseUrls like \u0026), then (2) ytInitialPlayerResponse JSON.
 */
function videosow_extract_caption_tracks_from_html( $html ) {
    $out = array();

    // Strategy A — direct regex on captionTracks array (most robust).
    if ( preg_match( '/"captionTracks"\s*:\s*(\[.*?\])/s', $html, $m ) ) {
        $arr_raw = $m[1];
        // Decode unicode escapes (\u0026 etc) so JSON parser sees clean URLs.
        $arr_decoded = json_decode( '{"x":' . $arr_raw . '}', true );
        if ( is_array( $arr_decoded ) && ! empty( $arr_decoded['x'] ) ) {
            foreach ( $arr_decoded['x'] as $t ) {
                $base = isset( $t['baseUrl'] ) ? (string) $t['baseUrl'] : '';
                if ( ! $base ) continue;
                $base = html_entity_decode( $base, ENT_QUOTES, 'UTF-8' );
                $out[] = array(
                    'lang'         => isset( $t['languageCode'] ) ? (string) $t['languageCode'] : '',
                    'name'         => isset( $t['name']['simpleText'] ) ? (string) $t['name']['simpleText'] : ( isset( $t['name']['runs'][0]['text'] ) ? (string) $t['name']['runs'][0]['text'] : '' ),
                    'kind'         => isset( $t['kind'] ) ? (string) $t['kind'] : '',
                    'baseUrl'      => $base,
                    'translatable' => ! empty( $t['isTranslatable'] ),
                );
            }
            if ( ! empty( $out ) ) return $out;
        }

        // Fallback A2 — pull every baseUrl + languageCode pair via plain regex.
        if ( preg_match_all( '/\{[^{}]*?"baseUrl"\s*:\s*"([^"]+)"[^{}]*?\}/s', $arr_raw, $mm ) ) {
            foreach ( $mm[0] as $idx => $obj ) {
                $base = stripcslashes( $mm[1][ $idx ] ); // turn \u0026 → &, \/ → /
                $base = str_replace( array( '\\u0026', '\\/' ), array( '&', '/' ), $base );
                $lang = ''; $kind = '';
                if ( preg_match( '/"languageCode"\s*:\s*"([^"]+)"/', $obj, $lm ) ) $lang = $lm[1];
                if ( preg_match( '/"kind"\s*:\s*"([^"]+)"/', $obj, $km ) ) $kind = $km[1];
                $out[] = array(
                    'lang'         => $lang,
                    'name'         => '',
                    'kind'         => $kind,
                    'baseUrl'      => $base,
                    'translatable' => false,
                );
            }
            if ( ! empty( $out ) ) return $out;
        }
    }

    return $out;
}

/**
 * Use YouTube's internal InnerTube API (used by the web client) to fetch
 * captionTracks without scraping HTML. No API key needed — the web key is
 * public and stable.
 */
function videosow_discover_caption_tracks_innertube( $video_id, $client = 'ANDROID' ) {
    // Per-client config: API key, clientVersion, User-Agent.
    $clients = array(
        'ANDROID' => array(
            'key'     => 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w',
            'name'    => 'ANDROID',
            'version' => '20.10.38',
            'sdk'     => 30,
            'ua'      => 'com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip',
        ),
        'IOS' => array(
            'key'     => 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc',
            'name'    => 'IOS',
            'version' => '20.10.4',
            'ua'      => 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X)',
        ),
        'WEB' => array(
            'key'     => 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
            'name'    => 'WEB',
            'version' => '2.20250320.00.00',
            'ua'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        ),
    );
    if ( ! isset( $clients[ $client ] ) ) $client = 'ANDROID';
    $c = $clients[ $client ];

    $client_ctx = array(
        'clientName'    => $c['name'],
        'clientVersion' => $c['version'],
        'hl'            => 'en',
        'gl'            => 'US',
    );
    if ( $client === 'ANDROID' ) {
        $client_ctx['androidSdkVersion'] = $c['sdk'];
        $client_ctx['osName']            = 'Android';
        $client_ctx['osVersion']         = '14';
        $client_ctx['deviceMake']        = 'Google';
        $client_ctx['deviceModel']       = 'Pixel 8';
    } elseif ( $client === 'IOS' ) {
        $client_ctx['deviceMake']  = 'Apple';
        $client_ctx['deviceModel'] = 'iPhone16,2';
        $client_ctx['osName']      = 'iOS';
        $client_ctx['osVersion']   = '18.3.2.22D82';
    }

    $endpoint = 'https://www.youtube.com/youtubei/v1/player?key=' . $c['key'];
    $payload  = array(
        'context' => array( 'client' => $client_ctx ),
        'videoId' => $video_id,
        'contentCheckOk' => true,
        'racyCheckOk'    => true,
    );
    $headers = array(
        'Content-Type'              => 'application/json',
        'User-Agent'                => $c['ua'],
        'X-YouTube-Client-Name'     => $client === 'ANDROID' ? '3' : ( $client === 'IOS' ? '5' : '1' ),
        'X-YouTube-Client-Version'  => $c['version'],
        'Origin'                    => 'https://www.youtube.com',
        'Referer'                   => 'https://www.youtube.com/',
    );
    $resp = wp_remote_post( $endpoint, array(
        'timeout' => 25,
        'headers' => $headers,
        'body'    => wp_json_encode( $payload ),
    ) );
    if ( is_wp_error( $resp ) ) {
        error_log( '[VideoSow][innertube:' . $client . '] wp_error: ' . $resp->get_error_message() );
        return array();
    }
    $http_code = wp_remote_retrieve_response_code( $resp );
    if ( $http_code < 200 || $http_code >= 300 ) {
        error_log( '[VideoSow][innertube:' . $client . '] HTTP ' . $http_code );
        return array();
    }
    $body = wp_remote_retrieve_body( $resp );
    if ( ! $body ) return array();
    $json = json_decode( $body, true );
    if ( ! is_array( $json ) ) return array();
    $play_status = isset( $json['playabilityStatus']['status'] ) ? $json['playabilityStatus']['status'] : '';
    if ( $play_status && $play_status !== 'OK' ) {
        $reason = isset( $json['playabilityStatus']['reason'] ) ? $json['playabilityStatus']['reason'] : '';
        error_log( '[VideoSow][innertube:' . $client . '] playability=' . $play_status . ' reason=' . $reason );
    }
    if ( empty( $json['captions']['playerCaptionsTracklistRenderer']['captionTracks'] ) ) return array();

    $out = array();
    foreach ( $json['captions']['playerCaptionsTracklistRenderer']['captionTracks'] as $t ) {
        $base = isset( $t['baseUrl'] ) ? $t['baseUrl'] : '';
        if ( ! $base ) continue;
        $base = html_entity_decode( $base, ENT_QUOTES, 'UTF-8' );
        $out[] = array(
            'lang'         => isset( $t['languageCode'] ) ? (string) $t['languageCode'] : '',
            'name'         => isset( $t['name']['simpleText'] ) ? (string) $t['name']['simpleText'] : ( isset( $t['name']['runs'][0]['text'] ) ? (string) $t['name']['runs'][0]['text'] : '' ),
            'kind'         => isset( $t['kind'] ) ? (string) $t['kind'] : '',
            'baseUrl'      => $base,
            'translatable' => ! empty( $t['isTranslatable'] ),
        );
    }
    return $out;
}

function videosow_parse_timedtext_json( $body ) {
    $segments = array();
    $data = json_decode( $body, true );
    if ( ! is_array( $data ) || empty( $data['events'] ) ) return $segments;
    foreach ( $data['events'] as $ev ) {
        if ( empty( $ev['segs'] ) ) continue;
        $text = '';
        foreach ( $ev['segs'] as $s ) {
            if ( isset( $s['utf8'] ) ) $text .= $s['utf8'];
        }
        $text = trim( preg_replace( '/\s+/', ' ', $text ) );
        if ( $text === '' ) continue;
        $start = isset( $ev['tStartMs'] ) ? ( $ev['tStartMs'] / 1000.0 ) : 0.0;
        $segments[] = array( 'start' => $start, 'text' => $text );
    }
    return $segments;
}

function videosow_parse_timedtext_xml( $xml_body ) {
    $segments = array();
    $prev = libxml_use_internal_errors( true );
    $sx = simplexml_load_string( $xml_body );
    libxml_use_internal_errors( $prev );
    if ( ! $sx || ! isset( $sx->text ) ) return $segments;
    foreach ( $sx->text as $t ) {
        $attrs = $t->attributes();
        $start = isset( $attrs['start'] ) ? (float) $attrs['start'] : 0.0;
        $raw   = (string) $t;
        $text  = html_entity_decode( strip_tags( $raw ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
        $text  = trim( preg_replace( '/\s+/', ' ', $text ) );
        if ( $text !== '' ) {
            $segments[] = array( 'start' => $start, 'text' => $text );
        }
    }
    return $segments;
}

function videosow_parse_srt_captions( $body ) {
    $segments = array();
    $body = str_replace( array( "\r\n", "\r" ), "\n", (string) $body );
    $blocks = preg_split( "/\n{2,}/", trim( $body ) );
    if ( ! is_array( $blocks ) ) return $segments;
    foreach ( $blocks as $block ) {
        $lines = array_values( array_filter( explode( "\n", trim( $block ) ), function( $line ) { return trim( $line ) !== ''; } ) );
        if ( count( $lines ) < 2 ) continue;
        if ( preg_match( '/^\d+$/', trim( $lines[0] ) ) ) array_shift( $lines );
        $time_line = array_shift( $lines );
        $start = 0.0;
        if ( preg_match( '/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s+-->/', $time_line, $m ) ) {
            $start = intval( $m[1] ) * 3600 + intval( $m[2] ) * 60 + intval( $m[3] ) + intval( $m[4] ) / 1000.0;
        }
        $text = html_entity_decode( wp_strip_all_tags( implode( ' ', $lines ) ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
        $text = trim( preg_replace( '/\s+/', ' ', $text ) );
        if ( $text !== '' ) $segments[] = array( 'start' => $start, 'text' => $text );
    }
    return $segments;
}

function videosow_render_transcript_block( $segments, $mode = 'plain' ) {
    if ( empty( $segments ) ) return '';
    if ( $mode === 'hidden' ) return '';

    // Group consecutive segments into paragraphs (~ every ~25 lines or 30s gap).
    $paragraphs = array();
    $buffer = array();
    $first_start = $segments[0]['start'];
    foreach ( $segments as $i => $seg ) {
        $buffer[] = $seg['text'];
        $is_last  = ( $i === count( $segments ) - 1 );
        $next_start = $is_last ? null : $segments[ $i + 1 ]['start'];
        if ( count( $buffer ) >= 25 || $is_last || ( $next_start !== null && ( $next_start - $seg['start'] ) > 4 && count( $buffer ) >= 10 ) ) {
            $paragraphs[] = array(
                'start' => $first_start,
                'text'  => trim( implode( ' ', $buffer ) ),
            );
            $buffer = array();
            if ( ! $is_last ) $first_start = $next_start;
        }
    }

    $fmt = function( $sec ) {
        $sec = (int) $sec;
        $h = floor( $sec / 3600 );
        $m = floor( ( $sec % 3600 ) / 60 );
        $s = $sec % 60;
        return $h > 0 ? sprintf( '%d:%02d:%02d', $h, $m, $s ) : sprintf( '%d:%02d', $m, $s );
    };

    if ( $mode === 'plain' ) {
        $html  = '<div class="videosow-transcript-plain" style="margin-top:24px;">';
        $html .= '<h3 style="margin:0 0 12px 0;font-size:18px;font-weight:600;color:#1a1a1a;">Transcript</h3>';
        $html .= '<div class="videosow-transcript-body" style="line-height:1.7;color:#333;">';
        foreach ( $paragraphs as $p ) {
            $html .= '<p>' . esc_html( $p['text'] ) . '</p>';
        }
        $html .= '</div></div>';
        return $html;
    }

    // Default: details (collapsible)
    $html  = '<details class="videosow-transcript" style="margin-top:24px;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;background:#fafafa;">';
    $html .= '<summary style="cursor:pointer;font-weight:600;color:#1a1a1a;list-style:none;">Transcript</summary>';
    $html .= '<div class="videosow-transcript-body" style="margin-top:12px;line-height:1.7;color:#333;">';
    foreach ( $paragraphs as $p ) {
        $html .= '<p><span class="videosow-ts" style="color:#9ca3af;font-size:12px;font-family:monospace;margin-right:8px;">[' . esc_html( $fmt( $p['start'] ) ) . ']</span>' . esc_html( $p['text'] ) . '</p>';
    }
    $html .= '</div></details>';
    return $html;
}

/**
 * AJAX: list videos imported by this plugin (videosow_video CPT) for the Import → Archive table.
 */
function videosow_ajax_list_archive() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    $playlist = isset( $_POST['playlist'] ) ? sanitize_text_field( wp_unslash( $_POST['playlist'] ) ) : '';
    $args = array(
        'post_type'      => 'videosow_video',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'posts_per_page' => 100,
        'orderby'        => 'date',
        'order'          => 'DESC',
    );
    // NOTE: per-playlist filtering is not yet wired (playlist_id meta not stored on import).
    // For now, always list all imported videos so users can see what was created.
    // The `playlist` parameter is accepted for forward-compat.
    $q = new WP_Query( $args );
    $rows = array();
    foreach ( $q->posts as $p ) {
        $vid = (string) get_post_meta( $p->ID, '_videosow_yt_video_id', true );
        $views = (int) get_post_meta( $p->ID, '_videosow_yt_view_count', true );
        $rows[] = array(
            'id'        => $p->ID,
            'title'     => get_the_title( $p ),
            'videoId'   => $vid,
            'date'      => get_the_date( 'Y-m-d', $p ),
            'status'    => $p->post_status === 'publish' ? 'Published' : 'Draft',
            'views'     => $views,
            'editLink'  => get_edit_post_link( $p->ID, '' ),
            'permalink' => get_permalink( $p ),
        );
    }
    wp_send_json_success( array( 'rows' => $rows ) );
}
add_action( 'wp_ajax_videosow_list_archive', 'videosow_ajax_list_archive' );

/**
 * AJAX: dashboard stats — counts and recent activity for the Dashboard tab.
 */
function videosow_ajax_dashboard_stats() {
    check_ajax_referer( 'videosow_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    $counts    = wp_count_posts( 'videosow_video' );
    $published = isset( $counts->publish ) ? (int) $counts->publish : 0;
    $draft     = isset( $counts->draft ) ? (int) $counts->draft : 0;
    $pending   = isset( $counts->pending ) ? (int) $counts->pending : 0;
    $private_  = isset( $counts->private ) ? (int) $counts->private : 0;
    $future    = isset( $counts->future ) ? (int) $counts->future : 0;
    $imported  = $published + $draft + $pending + $private_ + $future;

    $cfg = videosow_get_sermon_importer_config();
    $last_sync_at  = isset( $cfg['lastSyncAt'] ) ? (int) $cfg['lastSyncAt'] : 0;
    $last_sync_msg = isset( $cfg['lastSyncMsg'] ) ? videosow_english_status_message( (string) $cfg['lastSyncMsg'] ) : '';
    $last_sync_human = $last_sync_at ? human_time_diff( $last_sync_at, current_time( 'timestamp' ) ) . ' ago' : '';

    $q = new WP_Query( array(
        'post_type'      => 'videosow_video',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'posts_per_page' => 6,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'no_found_rows'  => true,
    ) );
    $recent = array();
    foreach ( $q->posts as $p ) {
        $recent[] = array(
            'id'        => $p->ID,
            'title'     => get_the_title( $p ),
            'when'      => human_time_diff( get_post_time( 'U', true, $p ), current_time( 'timestamp', true ) ) . ' ago',
            'status'    => $p->post_status === 'publish' ? 'Published' : 'Drafted',
            'editLink'  => get_edit_post_link( $p->ID, '' ),
            'permalink' => get_permalink( $p ),
            'videoId'   => (string) get_post_meta( $p->ID, '_videosow_yt_video_id', true ),
        );
    }

    wp_send_json_success( array(
        'imported'      => $imported,
        'published'     => $published,
        'draft'         => $draft + $pending,
        'lastSyncAt'    => $last_sync_at,
        'lastSyncMsg'   => $last_sync_msg,
        'lastSyncHuman' => $last_sync_human,
        'totalImported' => isset( $cfg['totalImported'] ) ? (int) $cfg['totalImported'] : $imported,
        'recent'        => $recent,
    ) );
}
add_action( 'wp_ajax_videosow_dashboard_stats', 'videosow_ajax_dashboard_stats' );
