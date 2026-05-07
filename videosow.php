<?php
/**
 * Plugin Name: Video Sow
 * Plugin URI: https://kindpixels.com/plugins/video-sow/
 * Description: Automatically convert YouTube playlist videos into WordPress articles, with optional transcript and AI processing.
 * Version: 0.1.0
 * Author: KIND PIXELS
 * Author URI: https://kindpixels.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: videosow
 * Requires at least: 5.8
 * Tested up to: 6.9
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

if ( defined( 'VIDEOSOW_PLUGIN_LOADED' ) ) { return; }
define( 'VIDEOSOW_PLUGIN_LOADED', true );
define( 'VIDEOSOW_VERSION', '0.1.0' );

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
                    'slug'              => 'videosow',
                    'premium_slug'      => 'videosow-pro',
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
                        'slug'       => 'videosow',
                        'first-path' => 'admin.php?page=videosow',
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
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
        add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), array( $this, 'plugin_action_links' ), 99, 1 );
        add_action( 'admin_print_styles', array( $this, 'hide_other_plugin_notices' ) );
    }

    public function add_admin_menu() {
        // Simple "play in grid" SVG icon for Video Sow
        $icon_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="black" d="M2 2h7v7H2V2zm0 9h7v7H2v-7zm9-9h7v7h-7V2zm2.5 11l4.5 2.5-4.5 2.5v-5z"/></svg>';
        $icon_base64 = 'data:image/svg+xml;base64,' . base64_encode( $icon_svg );
        add_menu_page( '', 'Video Sow', 'manage_options', 'videosow', array( $this, 'render_admin_page' ), $icon_base64, 100 );
    }

    public function hide_other_plugin_notices() {
        $screen = get_current_screen();
        if ( ! $screen || strpos( $screen->id, 'videosow' ) === false ) return;
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
        if ( $hook_suffix !== 'toplevel_page_videosow' ) return;
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
            'adminPageUrl'  => admin_url( 'admin.php?page=videosow' ),
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
            wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'videosow' ) );
        }
        echo '<script>document.body.classList.add("videosow-admin-page");</script>';
        echo '<style>.wrap > h1:first-child{display:none !important;}</style>';
        echo '<div class="wrap videosow-admin-page">';
        echo '<div id="videosow-root" style="margin-top:0;"></div>';
        echo '</div>';
    }

    public function plugin_action_links( $links ) {
        $url  = admin_url( 'admin.php?page=videosow' );
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

<?php require __FILE__; ?>
