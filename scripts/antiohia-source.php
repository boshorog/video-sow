<?php
/**
 * Plugin Name: Antiohia Tools
 * Description: WordPress tools for plugin list, social proof, plan comparison, donation form and YouTube sermon importer.
 * Version: 4.9.24
 * Author: KIND PIXELS
 * Text Domain: antiohia-shortcodes
 * Requires PHP: 7.0
 * Requires at least: 5.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/* ── Admin menu ─────────────────────────────────── */

function kp_antiohia_register_admin_page() {
    add_menu_page(
        'Antiohia Tools',
        'Antiohia Tools',
        'manage_options',
        'antiohia-shortcodes',
        'kp_antiohia_render_admin_page',
        'dashicons-shortcode',
        31
    );
}
add_action( 'admin_menu', 'kp_antiohia_register_admin_page' );

/* ── AJAX: Save / Load donation config ──────────── */

function kp_antiohia_ajax_save_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized' );
    }
    $config = json_decode( stripslashes( $_POST['config'] ), true );
    if ( ! is_array( $config ) ) {
        wp_send_json_error( 'Invalid config' );
    }
    update_option( 'antiohia_donation_config', $config );
    wp_send_json_success();
}
add_action( 'wp_ajax_antiohia_save_config', 'kp_antiohia_ajax_save_config' );

function kp_antiohia_ajax_load_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized' );
    }
    $config = get_option( 'antiohia_donation_config', array() );
    wp_send_json_success( $config );
}
add_action( 'wp_ajax_antiohia_load_config', 'kp_antiohia_ajax_load_config' );

/* ── AJAX: Save / Load countdown config ─────────── */

function kp_antiohia_ajax_save_countdown_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized' );
    }
    $config = json_decode( stripslashes( $_POST['config'] ), true );
    if ( ! is_array( $config ) ) {
        wp_send_json_error( 'Invalid config' );
    }
    update_option( 'antiohia_countdown_config', $config );
    wp_send_json_success();
}
add_action( 'wp_ajax_antiohia_save_countdown_config', 'kp_antiohia_ajax_save_countdown_config' );

function kp_antiohia_ajax_load_countdown_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized' );
    }
    $config = get_option( 'antiohia_countdown_config', array() );
    wp_send_json_success( $config );
}
add_action( 'wp_ajax_antiohia_load_countdown_config', 'kp_antiohia_ajax_load_countdown_config' );

/* ── AJAX: Save / Load live schedule config ─────── */

function kp_antiohia_ajax_save_live_schedule_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized' );
    }
    $config = json_decode( stripslashes( $_POST['config'] ), true );
    if ( ! is_array( $config ) ) {
        wp_send_json_error( 'Invalid config' );
    }
    update_option( 'antiohia_live_schedule_config', $config );
    wp_send_json_success();
}
add_action( 'wp_ajax_antiohia_save_live_schedule_config', 'kp_antiohia_ajax_save_live_schedule_config' );

function kp_antiohia_ajax_load_live_schedule_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Unauthorized' );
    }
    $config = get_option( 'antiohia_live_schedule_config', array() );
    wp_send_json_success( $config );
}
add_action( 'wp_ajax_antiohia_load_live_schedule_config', 'kp_antiohia_ajax_load_live_schedule_config' );
/* ── Admin page render ──────────────────────────── */

function kp_antiohia_render_admin_page() {
    // Remove ALL admin notices
    remove_all_actions('admin_notices');
    remove_all_actions('all_admin_notices');
    remove_all_actions('network_admin_notices');
    remove_all_actions('user_admin_notices');
    $nonce = wp_create_nonce( 'antiohia_nonce' );
    $ajax_url = admin_url( 'admin-ajax.php' );
    ?>
    <style>
        /* Hide all admin notices on this page */
        body.toplevel_page_antiohia-shortcodes .notice,
        body.toplevel_page_antiohia-shortcodes .updated,
        body.toplevel_page_antiohia-shortcodes .update-nag,
        body.toplevel_page_antiohia-shortcodes .error,
        body.toplevel_page_antiohia-shortcodes #wpbody-content > .notice,
        body.toplevel_page_antiohia-shortcodes #wpbody-content > .updated,
        body.toplevel_page_antiohia-shortcodes #wpbody-content > .error,
        body.toplevel_page_antiohia-shortcodes #wpbody-content > .update-nag,
        body.toplevel_page_antiohia-shortcodes #wpbody-content > div.notice,
        body.toplevel_page_antiohia-shortcodes #wpbody-content > div.updated {
            display: none !important;
        }

        body.toplevel_page_antiohia-shortcodes,
        body.toplevel_page_antiohia-shortcodes #wpwrap,
        body.toplevel_page_antiohia-shortcodes #wpcontent,
        body.toplevel_page_antiohia-shortcodes #wpbody,
        body.toplevel_page_antiohia-shortcodes #wpbody-content,
        body.toplevel_page_antiohia-shortcodes #wpbody-content .wrap,
        body.toplevel_page_antiohia-shortcodes .wrap.antiohia-admin,
        body.toplevel_page_antiohia-shortcodes .antiohia-iframe-wrapper,
        body.toplevel_page_antiohia-shortcodes .antiohia-iframe-wrapper iframe {
            background: #ffffff !important;
            background-color: #ffffff !important;
            background-image: none !important;
        }
        .antiohia-admin {
            padding: 0;
            margin: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            background: #fff !important;
        }
        .antiohia-iframe-wrapper {
            width: 100%;
            max-width: 1280px;
            background: #fff !important;
        }
        .antiohia-iframe-wrapper iframe {
            display: block;
            width: 100%;
            min-height: 100vh;
            border: 0;
            background: #fff !important;
            background-color: #fff !important;
        }
    </style>
    <div class="wrap antiohia-admin">
        <main class="antiohia-iframe-wrapper">
            <iframe
                src="<?php echo esc_url( plugin_dir_url( __FILE__ ) . 'dist/index.html' ); ?>"
                title="Antiohia Tools Dashboard"
                loading="eager"
                scrolling="no"
                id="antiohia-dashboard-iframe"
            ></iframe>
        </main>
    </div>
    <script>
        (function() {
            // Hide any notices that appear after page load
            var hideNotices = function() {
                var sel = '#wpbody-content > .notice, #wpbody-content > .updated, #wpbody-content > .error, #wpbody-content > .update-nag';
                document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; });
            };
            hideNotices();
            setTimeout(hideNotices, 500);
            setTimeout(hideNotices, 2000);

            var iframe = document.getElementById('antiohia-dashboard-iframe');
            if (!iframe) return;
            var ajaxUrl = '<?php echo esc_js( $ajax_url ); ?>';
            var nonce = '<?php echo esc_js( $nonce ); ?>';

            function resizeIframe() {
                try {
                    var body = iframe.contentWindow.document.body;
                    var html = iframe.contentWindow.document.documentElement;
                    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                    iframe.style.height = height + 'px';
                } catch (e) {}
            }

            iframe.onload = function() {
                resizeIframe();
                try {
                    var observer = new MutationObserver(resizeIframe);
                    observer.observe(iframe.contentWindow.document.body, { childList: true, subtree: true, attributes: true });
                } catch (e) {}
            };
            window.addEventListener('resize', resizeIframe);

            // PostMessage bridge for save/load
            window.addEventListener('message', function(e) {
                if (!e.data || !e.data.type) return;

                if (e.data.type === 'antiohia_load_config') {
                    var fd = new FormData();
                    fd.append('action', 'antiohia_load_config');
                    fd.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fd, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_config_loaded',
                                config: resp.success ? resp.data : {}
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_save_config') {
                    var fd2 = new FormData();
                    fd2.append('action', 'antiohia_save_config');
                    fd2.append('nonce', nonce);
                    fd2.append('config', JSON.stringify(e.data.config));
                    fetch(ajaxUrl, { method: 'POST', body: fd2, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_config_saved',
                                success: !!resp.success
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_load_countdown_config') {
                    var fd3 = new FormData();
                    fd3.append('action', 'antiohia_load_countdown_config');
                    fd3.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fd3, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_countdown_config_loaded',
                                config: resp.success ? resp.data : {}
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_save_countdown_config') {
                    var fd4 = new FormData();
                    fd4.append('action', 'antiohia_save_countdown_config');
                    fd4.append('nonce', nonce);
                    fd4.append('config', JSON.stringify(e.data.config));
                    fetch(ajaxUrl, { method: 'POST', body: fd4, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_countdown_config_saved',
                                success: !!resp.success
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_load_live_schedule_config') {
                    var fd5 = new FormData();
                    fd5.append('action', 'antiohia_load_live_schedule_config');
                    fd5.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fd5, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_live_schedule_config_loaded',
                                config: resp.success ? resp.data : {}
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_save_live_schedule_config') {
                    var fd6 = new FormData();
                    fd6.append('action', 'antiohia_save_live_schedule_config');
                    fd6.append('nonce', nonce);
                    fd6.append('config', JSON.stringify(e.data.config));
                    fetch(ajaxUrl, { method: 'POST', body: fd6, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_live_schedule_config_saved',
                                success: !!resp.success
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_load_sermon_importer_config') {
                    var fd7 = new FormData();
                    fd7.append('action', 'antiohia_load_sermon_importer_config');
                    fd7.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fd7, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_importer_config_loaded',
                                config: resp.success ? resp.data : {}
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_save_sermon_importer_config') {
                    var fd8 = new FormData();
                    fd8.append('action', 'antiohia_save_sermon_importer_config');
                    fd8.append('nonce', nonce);
                    fd8.append('config', JSON.stringify(e.data.config));
                    fetch(ajaxUrl, { method: 'POST', body: fd8, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_importer_config_saved',
                                success: !!resp.success
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_run_sermon_sync') {
                    var fd9 = new FormData();
                    fd9.append('action', 'antiohia_run_sermon_sync');
                    fd9.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fd9, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_sync_result',
                                success: !!resp.success,
                                data: resp.data || null
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_scan_sermon_playlist') {
                    var fdScan = new FormData();
                    fdScan.append('action', 'antiohia_scan_sermon_playlist');
                    fdScan.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdScan, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_scan_result',
                                success: !!resp.success,
                                data: resp.data || null,
                                error: resp.data && !resp.success ? resp.data : null
                            }, '*');
                        });
                }

                if (e.data.type === 'antiohia_step_sermon_sync') {
                    var fdStep = new FormData();
                    fdStep.append('action', 'antiohia_step_sermon_sync');
                    fdStep.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdStep, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_step_result',
                                success: !!resp.success,
                                data: resp.data || null
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_cancel_sermon_sync') {
                    var fdCancel = new FormData();
                    fdCancel.append('action', 'antiohia_cancel_sermon_sync');
                    fdCancel.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdCancel, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_sync_cancelled',
                                success: !!resp.success,
                                data: resp.data || null
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_get_sermon_stage') {
                    var fdStg = new FormData();
                    fdStg.append('action', 'antiohia_get_sermon_stage');
                    fdStg.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdStg, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_stage',
                                success: !!resp.success,
                                data: resp.data || null
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_clear_sermon_log') {
                    var fdClr = new FormData();
                    fdClr.append('action', 'antiohia_clear_sermon_log');
                    fdClr.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdClr, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_log_cleared',
                                success: !!resp.success
                            }, '*');
                            if (resp.success) {
                                // Reload config so the widget log empties.
                                var fdR = new FormData();
                                fdR.append('action', 'antiohia_load_sermon_importer_config');
                                fdR.append('nonce', nonce);
                                fetch(ajaxUrl, { method: 'POST', body: fdR, credentials: 'same-origin' })
                                    .then(function(r){ return r.json(); })
                                    .then(function(resp2){
                                        iframe.contentWindow.postMessage({
                                            type: 'antiohia_sermon_importer_config_loaded',
                                            config: resp2.success ? resp2.data : {}
                                        }, '*');
                                    });
                            }
                        });
                }
                if (e.data.type === 'antiohia_repair_sermon_metadata') {
                    var fdRep = new FormData();
                    fdRep.append('action', 'antiohia_repair_sermon_metadata');
                    fdRep.append('nonce', nonce);
                    fdRep.append('offset', String(e.data.offset || 0));
                    fetch(ajaxUrl, { method: 'POST', body: fdRep, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_sermon_repair_result',
                                success: !!resp.success,
                                data: resp.data || null,
                                error: resp.data && !resp.success ? resp.data : null
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_diagnose_transcript') {
                    var fdDg = new FormData();
                    fdDg.append('action', 'antiohia_diagnose_transcript');
                    fdDg.append('nonce', nonce);
                    fdDg.append('url', e.data.url || '');
                    fdDg.append('lang', e.data.lang || 'ro');
                    fetch(ajaxUrl, { method: 'POST', body: fdDg, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_transcript_diagnosis',
                                success: !!resp.success,
                                data: resp.data || null
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_test_playlist') {
                    var fdTp = new FormData();
                    fdTp.append('action', 'antiohia_test_playlist');
                    fdTp.append('nonce', nonce);
                    fdTp.append('playlist', e.data.playlist || '');
                    fetch(ajaxUrl, { method: 'POST', body: fdTp, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_test_playlist_result',
                                success: !!resp.success,
                                data: resp.data || null
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_get_oauth_redirect_uri') {
                    var fdRu = new FormData();
                    fdRu.append('action', 'antiohia_get_oauth_redirect_uri');
                    fdRu.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdRu, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_oauth_redirect_uri',
                                success: !!resp.success,
                                data: resp.data || null
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_start_oauth') {
                    // First save current config (so client_id/secret are persisted), then start.
                    var fdSave = new FormData();
                    fdSave.append('action', 'antiohia_save_sermon_importer_config');
                    fdSave.append('nonce', nonce);
                    fdSave.append('config', JSON.stringify(e.data.config || {}));
                    fetch(ajaxUrl, { method: 'POST', body: fdSave, credentials: 'same-origin' })
                        .then(function() {
                            var fdSt = new FormData();
                            fdSt.append('action', 'antiohia_start_oauth');
                            fdSt.append('nonce', nonce);
                            return fetch(ajaxUrl, { method: 'POST', body: fdSt, credentials: 'same-origin' });
                        })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            if (resp && resp.success && resp.data && resp.data.auth_url) {
                                // Navigate the parent window (escaping the iframe) to Google.
                                window.location.href = resp.data.auth_url;
                            } else {
                                iframe.contentWindow.postMessage({
                                    type: 'antiohia_oauth_start_error',
                                    error: (resp && resp.data) ? resp.data : 'unknown'
                                }, '*');
                            }
                        });
                }
                if (e.data.type === 'antiohia_disconnect_oauth') {
                    var fdDx = new FormData();
                    fdDx.append('action', 'antiohia_disconnect_oauth');
                    fdDx.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdDx, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_oauth_disconnected',
                                success: !!resp.success
                            }, '*');
                        });
                }
                if (e.data.type === 'antiohia_test_oauth') {
                    var fdTo = new FormData();
                    fdTo.append('action', 'antiohia_test_oauth');
                    fdTo.append('nonce', nonce);
                    fetch(ajaxUrl, { method: 'POST', body: fdTo, credentials: 'same-origin' })
                        .then(function(r) { return r.json(); })
                        .then(function(resp) {
                            iframe.contentWindow.postMessage({
                                type: 'antiohia_oauth_tested',
                                success: !!resp.success,
                                data: resp.data || null,
                                error: resp.success ? null : (resp.data || 'unknown')
                            }, '*');
                        });
                }
            });

            // Detect callback redirect (?antiohia_oauth=connected|error) and notify the iframe.
            (function notifyCallbackOnce() {
                try {
                    var sp = new URLSearchParams(window.location.search);
                    var s  = sp.get('antiohia_oauth');
                    if (!s) return;
                    var reason = sp.get('reason') || '';
                    var notify = function() {
                        if (!iframe.contentWindow) return;
                        iframe.contentWindow.postMessage({
                            type: 'antiohia_oauth_callback',
                            status: s,
                            reason: reason
                        }, '*');
                    };
                    iframe.addEventListener('load', function() { setTimeout(notify, 300); });
                    setTimeout(notify, 1500);
                } catch (e) {}
            })();
        })();
    </script>
    <?php
}

function kp_antiohia_plugin_action_links( $links ) {
    $url  = admin_url( 'admin.php?page=antiohia-shortcodes' );
    $link = '<a href="' . esc_url( $url ) . '">Dashboard</a>';
    array_unshift( $links, $link );
    return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'kp_antiohia_plugin_action_links' );

/* ── Stripe REST API endpoint ───────────────────── */

function kp_antiohia_register_stripe_endpoint() {
    register_rest_route( 'antiohia/v1', '/create-checkout-session', array(
        'methods'             => 'POST',
        'callback'            => 'kp_antiohia_create_checkout_session',
        'permission_callback' => '__return_true',
    ) );
}
add_action( 'rest_api_init', 'kp_antiohia_register_stripe_endpoint' );

function kp_antiohia_create_checkout_session( WP_REST_Request $request ) {
    if ( ! defined( 'STRIPE_SECRET_KEY' ) || ! STRIPE_SECRET_KEY ) {
        return new WP_Error( 'stripe_not_configured', 'STRIPE_SECRET_KEY not defined in wp-config.php', array( 'status' => 500 ) );
    }

    $params     = $request->get_json_params();
    $amount_ron = isset( $params['amount_ron'] ) ? absint( $params['amount_ron'] ) : 0;
    $type       = isset( $params['type'] ) ? sanitize_text_field( $params['type'] ) : 'once';
    $note       = isset( $params['note'] ) ? sanitize_textarea_field( $params['note'] ) : '';

    if ( $amount_ron <= 0 ) {
        return new WP_Error( 'invalid_amount', 'Suma trebuie să fie mai mare decât 0.', array( 'status' => 400 ) );
    }

    $amount_bani = $amount_ron * 100; // Stripe uses smallest currency unit

    $line_item = array(
        'price_data' => array(
            'currency'     => 'ron',
            'unit_amount'  => $amount_bani,
            'product_data' => array(
                'name' => ( $type === 'monthly' ? 'Donație lunară' : 'Donație' ) . ' — ' . $amount_ron . ' RON',
            ),
        ),
        'quantity' => 1,
    );

    if ( $type === 'monthly' ) {
        $line_item['price_data']['recurring'] = array( 'interval' => 'month' );
    }

    $body = array(
        'mode'        => ( $type === 'monthly' ) ? 'subscription' : 'payment',
        'line_items'  => array( $line_item ),
        'success_url' => home_url( '/?donation=success&session_id={CHECKOUT_SESSION_ID}' ),
        'cancel_url'  => home_url( '/?donation=cancelled' ),
    );

    if ( ! empty( $note ) ) {
        if ( $type === 'monthly' ) {
            $body['subscription_data'] = array( 'metadata' => array( 'mentiune' => $note ) );
        } else {
            $body['payment_intent_data'] = array( 'metadata' => array( 'mentiune' => $note ) );
        }
    }

    $response = wp_remote_post( 'https://api.stripe.com/v1/checkout/sessions', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . STRIPE_SECRET_KEY,
            'Content-Type'  => 'application/x-www-form-urlencoded',
        ),
        'body'    => kp_antiohia_stripe_encode( $body ),
        'timeout' => 30,
    ) );

    if ( is_wp_error( $response ) ) {
        return new WP_Error( 'stripe_error', $response->get_error_message(), array( 'status' => 500 ) );
    }

    $status = wp_remote_retrieve_response_code( $response );
    $data   = json_decode( wp_remote_retrieve_body( $response ), true );

    if ( $status >= 400 || empty( $data['id'] ) ) {
        $msg = isset( $data['error']['message'] ) ? $data['error']['message'] : 'Stripe API error';
        return new WP_Error( 'stripe_api_error', $msg, array( 'status' => $status ) );
    }

    return rest_ensure_response( array( 'session_id' => $data['id'] ) );
}

/**
 * Encode nested array to Stripe's expected format (e.g. line_items[0][price_data][currency])
 */
function kp_antiohia_stripe_encode( $data, $prefix = '' ) {
    $result = array();
    foreach ( $data as $key => $value ) {
        $full_key = $prefix === '' ? $key : $prefix . '[' . $key . ']';
        if ( is_array( $value ) ) {
            $result = array_merge( $result, kp_antiohia_stripe_encode( $value, $full_key ) );
        } else {
            $result[ $full_key ] = $value;
        }
    }
    return $result;
}

/* ── Shortcodes ─────────────────────────────────── */

function kp_antiohia_get_donation_defaults() {
    return array(
        'title'               => 'Fii parte din schimbare',
        'subtitle'            => 'Donatia ta ajuta direct comunitatea noastra.',
        'currency'            => 'RON',
        'button_text'         => 'DONEAZA',
        'amounts'             => '50,100,200,500,1000',
        'tab_once_label'      => 'Donatie unica',
        'tab_monthly_label'   => 'Donatie lunara',
        'custom_label'        => 'Alta suma',
        'mention_placeholder' => 'Mentiune (optional)',
        'panel_bg'            => '#3d3529',
        'panel_text'          => '#ffffff',
        'title_color'         => '#ffffff',
        'title_font_family'   => 'DM Sans',
        'title_font_size'     => '22',
        'title_line_height'   => '1.15',
        'icon_color'          => '#f5c518',
        'icon_url'            => '',
        'button_bg'           => '#f5c518',
        'button_text_color'   => '#2a2317',
        'selected_border'     => '#f5c518',
        'payment_note'        => 'Plățile sunt procesate de către Stripe.',
        'manage_label'        => 'Gestionează donația lunară',
        'manage_url'          => 'https://billing.stripe.com/p/login/9B600j9wM0pl6fK8OPfQI00',
    );
}

function kp_antiohia_map_saved_config( $saved ) {
    $map = array();
    if ( isset( $saved['title'] ) )               $map['title'] = $saved['title'];
    if ( isset( $saved['subtitle'] ) )            $map['subtitle'] = $saved['subtitle'];
    if ( isset( $saved['currency'] ) )            $map['currency'] = $saved['currency'];
    if ( isset( $saved['buttonLabel'] ) )         $map['button_text'] = $saved['buttonLabel'];
    if ( isset( $saved['amounts'] ) && is_array( $saved['amounts'] ) ) {
        $map['amounts'] = implode( ',', $saved['amounts'] );
    }
    if ( isset( $saved['tabOnceLabel'] ) )        $map['tab_once_label'] = $saved['tabOnceLabel'];
    if ( isset( $saved['tabMonthlyLabel'] ) )     $map['tab_monthly_label'] = $saved['tabMonthlyLabel'];
    if ( isset( $saved['customAmountLabel'] ) )   $map['custom_label'] = $saved['customAmountLabel'];
    if ( isset( $saved['mentionPlaceholder'] ) )  $map['mention_placeholder'] = $saved['mentionPlaceholder'];
    if ( isset( $saved['panelBg'] ) )             $map['panel_bg'] = $saved['panelBg'];
    if ( isset( $saved['panelTextColor'] ) )      $map['panel_text'] = $saved['panelTextColor'];
    if ( isset( $saved['titleColor'] ) )          $map['title_color'] = $saved['titleColor'];
    if ( isset( $saved['titleFontFamily'] ) )     $map['title_font_family'] = $saved['titleFontFamily'];
    if ( isset( $saved['titleFontSize'] ) )       $map['title_font_size'] = $saved['titleFontSize'];
    if ( isset( $saved['titleLineHeight'] ) )     $map['title_line_height'] = $saved['titleLineHeight'];
    if ( isset( $saved['iconColor'] ) )           $map['icon_color'] = $saved['iconColor'];
    if ( isset( $saved['iconUrl'] ) )             $map['icon_url'] = $saved['iconUrl'];
    if ( isset( $saved['buttonBg'] ) )            $map['button_bg'] = $saved['buttonBg'];
    if ( isset( $saved['buttonTextColor'] ) )     $map['button_text_color'] = $saved['buttonTextColor'];
    if ( isset( $saved['amountSelectedBorder'] ) ) $map['selected_border'] = $saved['amountSelectedBorder'];
    if ( isset( $saved['paymentNote'] ) )         $map['payment_note'] = $saved['paymentNote'];
    if ( isset( $saved['manageLabel'] ) )         $map['manage_label'] = $saved['manageLabel'];
    if ( isset( $saved['manageUrl'] ) )           $map['manage_url'] = $saved['manageUrl'];
    return $map;
}

function kp_antiohia_donation_form( $atts ) {
    // Merge: defaults < shortcode attributes < saved config (saved config wins)
    $defaults = kp_antiohia_get_donation_defaults();
    $saved = get_option( 'antiohia_donation_config', array() );
    $saved_mapped = kp_antiohia_map_saved_config( $saved );
    $atts = shortcode_atts( $defaults, $atts, 'antiohia_donation_form' );
    $atts = array_merge( $atts, $saved_mapped );

    $amounts = array_filter( array_map( 'trim', explode( ',', $atts['amounts'] ) ) );
    $uid = 'kp-df-' . wp_unique_id();
    $manage_class = $uid . '-manage';
    $title_font_family = ! empty( $atts['title_font_family'] ) ? sanitize_text_field( $atts['title_font_family'] ) : 'DM Sans';
    $title_font_size = isset( $atts['title_font_size'] ) ? max( 14, min( 48, floatval( $atts['title_font_size'] ) ) ) : 22;
    $title_line_height = isset( $atts['title_line_height'] ) ? max( 0.9, min( 1.8, floatval( $atts['title_line_height'] ) ) ) : 1.15;

    // Icon: custom image or default SVG
    $icon_html = '';
    if ( ! empty( $atts['icon_url'] ) ) {
        $icon_html = '<img class="kpdf-icon" src="' . esc_url($atts['icon_url']) . '" alt="Icon" style="object-fit:contain;">';
    } else {
        $icon_html = '<svg class="kpdf-icon" viewBox="0 0 24 24" fill="none" stroke="' . esc_attr($atts['icon_color']) . '" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">'
            . '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/>'
            . '<path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/>'
            . '<path d="m2 15 6 6"/>'
            . '<path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>'
            . '</svg>';
    }

    // Google Fonts — load selected title font + DM Sans
    $out = '<!-- antiohia v3.12.0 t=' . time() . ' -->';
    $font_family_encoded = str_replace(' ', '+', $title_font_family);
    $out .= '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=' . esc_attr($font_family_encoded) . ':wght@400;600;700;800&display=swap" rel="stylesheet">';

    // Powered by Stripe combined SVG (embedded inline to avoid any missing-file/CSP issues)
    $powered_by_stripe_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2331 359" width="2331" height="359" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;fill-rule:evenodd;clip-rule:evenodd"><defs><style type="text/css">.fil0{fill:#2B2A29}.fnt0{font-weight:normal;font-size:187.87px;font-family:Arial,sans-serif}</style></defs><g><path class="fil0" transform="translate(0 0)" d="M2229.83 185.96c0,-61.3 -29.69,-109.69 -86.46,-109.69 -56.98,0 -91.48,48.37 -91.48,109.2 0,72.08 40.71,108.48 99.13,108.48 28.5,0 50.05,-6.46 66.33,-15.56l0 -47.9c-16.28,8.15 -34.96,13.17 -58.67,13.17 -23.23,0 -43.82,-8.15 -46.46,-36.4l117.08 0.01c0,-3.13 0.48,-15.56 0.48,-21.31l0.03 0.01zm-118.2 -22.74c0,-27.06 16.52,-38.31 31.61,-38.31 14.6,0 30.18,11.25 30.18,38.31l-61.79 0zm-152.05 -86.93c-23.47,0 -38.54,11.01 -46.94,18.68l-3.13 -14.84 -52.78 -0 0 279.22 59.87 -12.69 0.24 -67.77c8.63,6.23 21.31,15.08 42.4,15.08 42.87,0 81.9,-34.37 81.9,-110.4 -0.24,-69.45 -39.75,-107.29 -81.67,-107.29l0.11 0.02zm-14.37 165c-14.13,0 -22.5,-5.03 -28.26,-11.25l-0.24 -88.85c6.23,-6.95 14.84,-11.73 28.5,-11.73 21.79,0 36.87,24.43 36.87,55.79 0,32.08 -14.84,56.04 -36.87,56.04zm-170.83 -179.13l60.1 -12.92 0 -48.6 -60.1 12.69 0 48.83zm0 18.2l60.1 0 0 209.53 -60.1 0 0 -209.53zm-64.43 17.71l-3.83 -17.71 -51.73 0 0 209.56 59.86 0 0 -142.02c14.13,-18.44 38.07,-15.08 45.5,-12.45l0 -55.07c-7.67,-2.87 -35.68,-8.15 -49.81,17.71l0.01 -0.01zm-119.73 -69.79l-58.43 12.47 -0.24 191.81c0,35.44 26.58,61.54 62.02,61.54 19.63,0 34,-3.59 41.91,-7.92l0 -48.61c-7.67,3.13 -45.5,14.13 -45.5,-21.31l0 -84.89 45.5 0 0 -51.01 -45.52 0 0.26 -52.08zm-161.87 112.79c0,-9.34 7.67,-12.92 20.35,-12.92 20.69,0.43 41.06,5.69 59.38,15.32l-0.01 -56.16c-19.87,-7.92 -39.51,-11.01 -59.37,-11.01 -48.61,0 -80.94,25.39 -80.94,67.77 0,66.09 91,55.55 91,84.06 0,11.01 -9.58,14.6 -22.99,14.6 -19.87,0 -45.26,-8.15 -65.37,-19.17l0 56.98c22.27,9.58 44.79,13.54 65.37,13.54 49.81,0 84.06,-24.67 84.06,-67.53 -0.24,-71.35 -91.48,-58.67 -91.48,-85.49l-0.01 -0z"/><text x="0" y="255" class="fil0 fnt0" style="letter-spacing:18px;word-spacing:24px;">POWERED BY</text></g></svg>';

    $out .= '<style>
.' . $uid . '{border:2px solid ' . esc_attr($atts['panel_bg']) . ';border-radius:16px;overflow:hidden;max-width:600px;font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important}
@media(min-width:601px){.' . $uid . '{max-width:680px}}
.' . $uid . ' *{box-sizing:border-box;margin:0;padding:0;font-family:inherit !important}
.' . $uid . ' .kpdf-grid{display:grid;grid-template-columns:1fr 1.2fr}
@media(max-width:600px){.' . $uid . ' .kpdf-grid{grid-template-columns:1fr}.' . $uid . ' .kpdf-panel{align-items:center;text-align:center}.' . $uid . ' .kpdf-panel-content{align-items:center;text-align:center}.' . $uid . ' .kpdf-icon{width:56px !important;height:56px !important}.' . $uid . ' .kpdf-stripe-badge{right:12px;left:auto;transform:none}.' . $uid . ' .kpdf-stripe-badge svg{display:none !important}.' . $uid . ' .kpdf-stripe-badge .kpdf-stripe-fallback{display:inline-flex !important;align-items:center;gap:6px;font-family:Arial,sans-serif;line-height:1;color:currentColor}.' . $uid . ' .kpdf-stripe-badge .kpdf-stripe-fallback .kpdf-pb{font-size:9px;letter-spacing:1.4px;word-spacing:3px;font-weight:400;transform:translateY(3px)}.' . $uid . ' .kpdf-stripe-badge .kpdf-stripe-fallback .kpdf-s{font-size:17px;font-weight:700;letter-spacing:-.5px;text-transform:lowercase}}
.' . $uid . ' .kpdf-panel{padding:28px;display:flex;flex-direction:column;position:relative;min-height:200px}
.' . $uid . ' .kpdf-panel .kpdf-panel-content{flex:1;display:flex;flex-direction:column;justify-content:center}
.' . $uid . ' .kpdf-panel h3{font-size:' . esc_attr( $title_font_size ) . 'px;font-weight:800;line-height:' . esc_attr( $title_line_height ) . ';margin-top:0;margin-bottom:6px;font-family:' . esc_attr( $title_font_family ) . ',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important}
.' . $uid . ' .kpdf-panel p{font-size:14px;opacity:.7;line-height:1.4}
.' . $uid . ' .kpdf-icon{width:48px;height:48px;margin-bottom:6px;display:block}
.' . $uid . ' .kpdf-form{padding:28px;background:#fff}
.' . $uid . ' .kpdf-tabs{display:flex;background:#f3f4f6;border-radius:8px;padding:2px;margin-bottom:20px}
.' . $uid . ' .kpdf-tab{flex:1;padding:8px;text-align:center;font-size:12px;font-weight:500;border-radius:6px;border:0;cursor:pointer;background:transparent;color:#6b7280;transition:all .2s}
.' . $uid . ' .kpdf-tab.active{background:#fff;color:#1a1a1a;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.' . $uid . ' .kpdf-amounts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:16px}
.' . $uid . ' .kpdf-amt{padding:10px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid #e5e7eb;background:#fff;cursor:pointer;transition:all .2s;text-align:center}
.' . $uid . ' .kpdf-amt.selected{border-color:' . esc_attr($atts['selected_border']) . ';background:' . esc_attr($atts['selected_border']) . '11}
.' . $uid . ' .kpdf-input{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;margin-bottom:12px;outline:none}
.' . $uid . ' .kpdf-input:focus{border-color:' . esc_attr($atts['selected_border']) . '}
.' . $uid . ' .kpdf-textarea{width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;resize:none;margin-bottom:16px;outline:none;min-height:80px}
.' . $uid . ' .kpdf-btn{width:100%;padding:12px;border:0;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .2s}
.' . $uid . ' .kpdf-btn:hover{opacity:.9}
.' . $uid . ' .kpdf-payment-note{text-align:center;font-size:10px;color:#9ca3af;margin-top:8px}
.' . $uid . ' .kpdf-custom-input{display:none}
.' . $uid . ' .kpdf-custom-input.visible{display:block}
.' . $uid . ' .kpdf-tab-content{position:relative}
.' . $uid . ' .kpdf-once{visibility:visible}
.' . $uid . ' .kpdf-monthly{position:absolute;top:0;left:0;width:100%;visibility:hidden}
.' . $uid . '.monthly .kpdf-once{visibility:hidden;position:absolute;top:0;left:0;width:100%}
.' . $uid . '.monthly .kpdf-monthly{position:relative;visibility:visible}
.' . $manage_class . '{display:block !important;width:100% !important;max-width:680px !important;clear:both !important;text-align:center !important;margin:12px auto 0 auto !important;padding:0 !important;background:transparent !important;border:none !important;line-height:1 !important}
.' . $manage_class . ',.' . $manage_class . ' *{font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important;box-shadow:none !important;text-shadow:none !important}
.' . $manage_class . ' a{all:unset !important;display:inline-flex !important;align-items:center !important;justify-content:center !important;gap:4px !important;font-size:13px !important;color:#6b7280 !important;text-decoration:none !important;font-weight:400 !important;line-height:1.4 !important;letter-spacing:normal !important;text-transform:none !important;cursor:pointer !important}
.' . $manage_class . ' a:link,.' . $manage_class . ' a:visited,.' . $manage_class . ' a:hover,.' . $manage_class . ' a:active{color:#6b7280 !important;text-decoration:none !important}
.' . $manage_class . ' a:hover{color:#1a1a1a !important}
.' . $manage_class . ' a svg{width:12px !important;height:12px !important;flex-shrink:0 !important;display:block !important}
.' . $uid . ' .kpdf-stripe-badge{position:absolute;bottom:10px;right:16px;left:auto;display:flex;align-items:center;line-height:1;color:rgba(255,255,255,.5)}
.' . $uid . ' .kpdf-stripe-badge .kpdf-stripe-fallback{display:none}
.' . $uid . ' .kpdf-stripe-badge svg{height:16px !important;width:auto !important;display:block !important;max-width:none !important;overflow:visible !important}
.' . $uid . ' .kpdf-stripe-badge svg *{fill:currentColor !important;stroke:currentColor !important}
.' . $uid . ' .kpdf-stripe-badge img{display:none !important;height:16px !important;width:auto !important;max-width:none !important;filter:brightness(0) invert(1) !important;opacity:1 !important}
@media(max-width:600px){.' . $uid . ' .kpdf-stripe-badge .kpdf-stripe-fallback{display:inline-flex !important;align-items:center !important;gap:6px !important;font-family:Arial,sans-serif !important;line-height:1 !important;color:currentColor !important}.' . $uid . ' .kpdf-stripe-badge svg{display:none !important}}
</style>';

    $out .= '<div class="' . $uid . '" id="' . $uid . '">';
    $out .= '<div class="kpdf-grid">';

    // Left panel
    $out .= '<div class="kpdf-panel" style="background:' . esc_attr($atts['panel_bg']) . ';color:' . esc_attr($atts['panel_text']) . '">';
    $out .= '<div class="kpdf-panel-content">';
    $out .= $icon_html;
    $out .= '<h3 style="color:' . esc_attr($atts['title_color']) . '">' . esc_html($atts['title']) . '</h3>';
    $out .= '<p>' . esc_html($atts['subtitle']) . '</p>';
    $out .= '</div>';
    // Stripe badge
    $out .= '<div class="kpdf-stripe-badge"><span class="kpdf-stripe-fallback" aria-hidden="true"><span class="kpdf-pb">POWERED BY</span><span class="kpdf-s">stripe</span></span>' . $powered_by_stripe_svg . '</div>';
    $out .= '</div>';

    // Right panel (form)
    $out .= '<div class="kpdf-form">';

    // Tabs
    $out .= '<div class="kpdf-tabs">';
    $out .= '<button class="kpdf-tab active" onclick="(function(el){var w=document.getElementById(\'' . $uid . '\');w.classList.remove(\'monthly\');w.querySelectorAll(\'.kpdf-tab\').forEach(function(t){t.classList.remove(\'active\')});el.classList.add(\'active\')})(this)">' . esc_html($atts['tab_once_label']) . '</button>';
    $out .= '<button class="kpdf-tab" onclick="(function(el){var w=document.getElementById(\'' . $uid . '\');w.classList.add(\'monthly\');w.querySelectorAll(\'.kpdf-tab\').forEach(function(t){t.classList.remove(\'active\')});el.classList.add(\'active\')})(this)">' . esc_html($atts['tab_monthly_label']) . '</button>';
    $out .= '</div>';

    // Tab content wrapper
    $out .= '<div class="kpdf-tab-content">';

    // Once tab content
    $out .= '<div class="kpdf-once">';
    $out .= '<div class="kpdf-amounts">';
    foreach ( $amounts as $i => $amount ) {
        $default_sel = ( $i == 1 || ( count($amounts) == 1 && $i == 0 ) );
        $out .= '<button class="kpdf-amt' . ($default_sel ? ' selected' : '') . '" onclick="(function(el){var w=document.getElementById(\'' . $uid . '\');el.closest(\'.kpdf-amounts\').querySelectorAll(\'.kpdf-amt\').forEach(function(b){b.classList.remove(\'selected\')});el.classList.add(\'selected\');w.querySelector(\'.kpdf-custom-input\').classList.remove(\'visible\')})(this)">' . esc_html($amount . ' ' . $atts['currency']) . '</button>';
    }
    $out .= '<button class="kpdf-amt" onclick="(function(el){var w=document.getElementById(\'' . $uid . '\');el.closest(\'.kpdf-amounts\').querySelectorAll(\'.kpdf-amt\').forEach(function(b){b.classList.remove(\'selected\')});el.classList.add(\'selected\');w.querySelector(\'.kpdf-custom-input\').classList.add(\'visible\')})(this)">' . esc_html($atts['custom_label']) . '</button>';
    $out .= '</div>';
    $out .= '<input type="text" inputmode="numeric" pattern="[0-9]*" class="kpdf-input kpdf-custom-input" placeholder="Suma (' . esc_attr($atts['currency']) . ')" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')">';
    $out .= '</div>';

    // Monthly tab content
    $out .= '<div class="kpdf-monthly">';
    $out .= '<input type="text" inputmode="numeric" pattern="[0-9]*" class="kpdf-input" placeholder="Suma lunara (' . esc_attr($atts['currency']) . ')" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')">';
    $out .= '</div>';

    $out .= '</div>'; // .kpdf-tab-content

    // Common fields
    $out .= '<textarea class="kpdf-textarea" placeholder="' . esc_attr($atts['mention_placeholder']) . '"></textarea>';
    $out .= '<button class="kpdf-btn kpdf-donate-btn" style="background:' . esc_attr($atts['button_bg']) . ';color:' . esc_attr($atts['button_text_color']) . '">' . esc_html($atts['button_text']) . '</button>';
    if ( ! empty( $atts['payment_note'] ) ) {
        $out .= '<p class="kpdf-payment-note">' . esc_html($atts['payment_note']) . '</p>';
    }

    $out .= '</div>'; // .kpdf-form
    $out .= '</div>'; // .kpdf-grid
    $out .= '</div>'; // card wrapper

    // Manage monthly donation link - OUTSIDE the card (Variant A)
    if ( ! empty( $atts['manage_url'] ) ) {
        $out .= '<div class="kpdf-manage ' . esc_attr( $manage_class ) . '"><a href="' . esc_url($atts['manage_url']) . '" target="_blank" rel="noopener noreferrer">' . esc_html($atts['manage_label']) . ' <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a></div>';
    }

    // Stripe JS — mobile-safe load + click binding
    $stripe_key = defined('STRIPE_PUBLISHABLE_KEY') ? esc_js(STRIPE_PUBLISHABLE_KEY) : '';
    $stripe_api_url = esc_url_raw( rest_url( 'antiohia/v1/create-checkout-session' ) );
    $out .= '<script>
(function(){
  var uid = "' . $uid . '";
  var stripeKey = "' . $stripe_key . '";
  var apiUrl = "' . esc_js( $stripe_api_url ) . '";
  var stripeInstance = null;
  var stripeLoader = null;

  function getStripe() {
    if (stripeInstance) return Promise.resolve(stripeInstance);
    if (stripeLoader) return stripeLoader;

    stripeLoader = new Promise(function(resolve, reject) {
      if (!stripeKey) {
        reject(new Error("STRIPE_PUBLISHABLE_KEY not defined in wp-config.php"));
        return;
      }

      function bootStripe() {
        try {
          if (typeof Stripe === "undefined") {
            reject(new Error("Stripe.js not loaded"));
            return;
          }
          stripeInstance = Stripe(stripeKey);
          resolve(stripeInstance);
        } catch (e) {
          reject(e);
        }
      }

      if (typeof Stripe !== "undefined") {
        bootStripe();
        return;
      }

      var existing = document.querySelector("script[data-antiohia-stripe=\"1\"]");
      if (existing) {
        existing.addEventListener("load", bootStripe, { once: true });
        existing.addEventListener("error", function() { reject(new Error("Stripe.js failed to load")); }, { once: true });
        return;
      }

      var s = document.createElement("script");
      s.src = "https://js.stripe.com/v3/";
      s.async = true;
      s.setAttribute("data-antiohia-stripe", "1");
      s.onload = bootStripe;
      s.onerror = function() { reject(new Error("Stripe.js failed to load")); };
      document.head.appendChild(s);
    });

    return stripeLoader;
  }

  var wrapper = document.getElementById(uid);
  if (!wrapper) return;
  var btn = wrapper.querySelector(".kpdf-donate-btn");
  if (!btn || btn.dataset.antiohiaBound === "1") return;
  btn.dataset.antiohiaBound = "1";

  btn.addEventListener("click", function(e) {
    e.preventDefault();

    var isMonthly = wrapper.classList.contains("monthly");
    var amount = 0;
    var note = "";
    var textarea = wrapper.querySelector(".kpdf-textarea");
    if (textarea) note = textarea.value;

    if (isMonthly) {
      var monthlyInput = wrapper.querySelector(".kpdf-monthly .kpdf-input");
      amount = monthlyInput ? parseInt(monthlyInput.value, 10) || 0 : 0;
    } else {
      var customInput = wrapper.querySelector(".kpdf-once .kpdf-custom-input.visible");
      if (customInput && customInput.value) {
        amount = parseInt(customInput.value, 10) || 0;
      } else {
        var selectedBtn = wrapper.querySelector(".kpdf-once .kpdf-amt.selected");
        if (selectedBtn) {
          var txt = selectedBtn.textContent.replace(/[^0-9]/g, "");
          amount = parseInt(txt, 10) || 0;
        }
      }
    }

    if (amount <= 0) {
      alert("Te rugăm selectează sau introdu o sumă.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se procesează...";

    getStripe()
      .then(function(stripe) {
        return fetch(apiUrl, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({type: isMonthly ? "monthly" : "once", amount_ron: amount, note: note})
        }).then(function(res) {
          return res.json().then(function(data) { return {ok: res.ok, data: data, stripe: stripe}; });
        });
      })
      .then(function(result) {
        if (!result.ok) {
          throw new Error(result.data.error || result.data.message || "Server error");
        }
        return result.stripe.redirectToCheckout({ sessionId: result.data.session_id });
      })
      .then(function(redirectResult) {
        if (redirectResult && redirectResult.error) {
          throw new Error(redirectResult.error.message);
        }
      })
      .catch(function(err) {
        console.error("Antiohia Stripe error:", err);
        alert("Eroare: " + err.message);
        btn.disabled = false;
        btn.textContent = "' . esc_js($atts['button_text']) . '";
      });
  });
})();
</script>';

    return $out;
}
add_shortcode( 'antiohia_donation_form', 'kp_antiohia_donation_form' );

function kp_antiohia_plugin_list( $atts ) {
    $atts = shortcode_atts( array(
        'title'        => 'PDF Gallery',
        'description'  => 'Showcase your documents in modern gallery layouts.',
        'button_text'  => 'Find out more',
        'button_link'  => '#',
        'rating'       => '4.9',
        'downloads'    => '25,000+',
        'active_users' => '12,000+',
    ), $atts, 'antiohia_plugin_list' );

    $out  = '<div style="border:1px solid #e5e7eb;border-radius:16px;padding:20px;max-width:760px;background:#fff;">';
    $out .= '<h3 style="margin:0 0 8px;font-size:22px;">' . esc_html( $atts['title'] ) . '</h3>';
    $out .= '<p style="margin:0 0 12px;color:#6b7280;">' . esc_html( $atts['description'] ) . '</p>';
    $out .= '<p style="margin:0 0 14px;font-size:14px;color:#374151;">&#11088; ' . esc_html( $atts['rating'] ) . ' &middot; &#11015; ' . esc_html( $atts['downloads'] ) . ' &middot; &#128101; ' . esc_html( $atts['active_users'] ) . '</p>';
    $out .= '<a href="' . esc_url( $atts['button_link'] ) . '" style="display:inline-block;background:#111827;color:#fff;border-radius:10px;padding:10px 14px;text-decoration:none;font-weight:600;">' . esc_html( $atts['button_text'] ) . '</a>';
    $out .= '</div>';
    return $out;
}
add_shortcode( 'antiohia_plugin_list', 'kp_antiohia_plugin_list' );

function kp_antiohia_social_proof( $atts ) {
    $atts = shortcode_atts( array(
        'user_count'   => '65,000+',
        'user_label'   => 'Happy Users',
        'rating'       => '4.8',
        'rating_label' => 'Rating',
        'prefix_text'  => '',
    ), $atts, 'antiohia_social_proof' );

    $out  = '<div style="display:flex;gap:16px;align-items:center;border:1px solid #e5e7eb;border-radius:16px;padding:16px 20px;max-width:760px;background:#fff;">';
    $out .= '<div>';
    if ( ! empty( $atts['prefix_text'] ) ) {
        $out .= '<div style="font-size:12px;color:#6b7280;">' . esc_html( $atts['prefix_text'] ) . '</div>';
    }
    $out .= '<div style="font-weight:700;font-size:24px;">' . esc_html( $atts['user_count'] ) . '</div>';
    $out .= '<div style="font-size:13px;color:#6b7280;">' . esc_html( $atts['user_label'] ) . '</div>';
    $out .= '</div>';
    $out .= '<div style="width:1px;height:48px;background:#e5e7eb;"></div>';
    $out .= '<div>';
    $out .= '<div style="font-weight:700;font-size:24px;">' . esc_html( $atts['rating'] ) . '/5</div>';
    $out .= '<div style="font-size:13px;color:#6b7280;">' . esc_html( $atts['rating_label'] ) . '</div>';
    $out .= '</div>';
    $out .= '</div>';
    return $out;
}
add_shortcode( 'antiohia_social_proof', 'kp_antiohia_social_proof' );

/* ── Service Countdown shortcode ─────────────────── */

function kp_antiohia_get_countdown_defaults() {
    return array(
        'icon'             => 'CalendarDays',
        'icon_color'       => '#6366f1',
        'header_label'     => 'Următorul serviciu',
        'bg_color'         => '#ffffff',
        'text_color'       => '#1a1a1a',
        'digit_color'      => '#1a1a1a',
        'separator_color'  => '#d4d4d4',
        'label_color'      => '#737373',
        'show_border'      => '1',
        'header_scale'     => '1',
    );
}

function kp_antiohia_service_countdown( $atts ) {
    $defaults = kp_antiohia_get_countdown_defaults();
    $saved = get_option( 'antiohia_countdown_config', array() );

    // Map saved camelCase keys to shortcode snake_case
    $saved_mapped = array();
    if ( isset( $saved['icon'] ) )            $saved_mapped['icon'] = $saved['icon'];
    if ( isset( $saved['iconColor'] ) )       $saved_mapped['icon_color'] = $saved['iconColor'];
    if ( isset( $saved['headerLabel'] ) )     $saved_mapped['header_label'] = $saved['headerLabel'];
    if ( isset( $saved['bgColor'] ) )         $saved_mapped['bg_color'] = $saved['bgColor'];
    if ( isset( $saved['textColor'] ) )       $saved_mapped['text_color'] = $saved['textColor'];
    if ( isset( $saved['digitColor'] ) )      $saved_mapped['digit_color'] = $saved['digitColor'];
    if ( isset( $saved['separatorColor'] ) )  $saved_mapped['separator_color'] = $saved['separatorColor'];
    if ( isset( $saved['labelColor'] ) )      $saved_mapped['label_color'] = $saved['labelColor'];
    if ( isset( $saved['showBorder'] ) )      $saved_mapped['show_border'] = $saved['showBorder'] ? '1' : '0';
    if ( isset( $saved['headerScale'] ) )     $saved_mapped['header_scale'] = floatval( $saved['headerScale'] );

    $atts = shortcode_atts( $defaults, $atts, 'antiohia_service_countdown' );
    $atts = array_merge( $atts, $saved_mapped );

    // Schedules from saved config or defaults
    $schedules = array(
        array( 'day' => 0, 'hour' => 10, 'minute' => 0, 'title' => 'Slujba de duminică dimineața cu Masa Domnului' ),
        array( 'day' => 0, 'hour' => 18, 'minute' => 0, 'title' => 'Slujba de duminică seara' ),
        array( 'day' => 4, 'hour' => 18, 'minute' => 0, 'title' => 'Slujba de joi seara' ),
    );
    if ( isset( $saved['schedules'] ) && is_array( $saved['schedules'] ) ) {
        $schedules = $saved['schedules'];
    }

    $special_events = array();
    $had_past = false;
    if ( isset( $saved['specialEvents'] ) && is_array( $saved['specialEvents'] ) ) {
        $now = time();
        foreach ( $saved['specialEvents'] as $ev ) {
            $ev_time = strtotime( $ev['date'] . ' ' . sprintf('%02d:%02d', $ev['hour'], $ev['minute']) );
            if ( $ev_time > $now ) {
                $special_events[] = $ev;
            } else {
                $had_past = true;
            }
        }
        // Auto-clean past events from saved config
        if ( $had_past ) {
            $saved['specialEvents'] = $special_events;
            update_option( 'antiohia_countdown_config', $saved );
        }
    }

    // Icon SVGs
    $icons = array(
        'CalendarDays' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
        'Church' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 22V5l-6-3-6 3v17"/><path d="M12 7v5M10 9h4"/></svg>',
        'Clock' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        'Heart' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        'BookOpen' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        'Bell' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
        'Flame' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        'Cross' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-7h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>',
        'Star' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    );

    $icon_name = $atts['icon'];
    $icon_svg = isset( $icons[ $icon_name ] ) ? $icons[ $icon_name ] : $icons['CalendarDays'];

    $uid = 'kp-sc-' . wp_unique_id();
    $border_style = $atts['show_border'] === '1' ? '1px solid #e5e7eb' : 'none';
    $header_scale = isset( $atts['header_scale'] ) ? max( 0.5, min( 2, floatval( $atts['header_scale'] ) ) ) : 1;

    // JSON encode schedules and special events for JS
    $schedules_json = wp_json_encode( $schedules );
    $special_events_json = wp_json_encode( $special_events );

    $out = '<!-- antiohia countdown v3.13.0 hs=' . $header_scale . ' t=' . time() . ' -->';
    $out .= '<style>
.' . $uid . '{width:100%;border-radius:16px;padding:32px;text-align:center;font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important;box-sizing:border-box}
.' . $uid . ' *{box-sizing:border-box;margin:0;padding:0;font-family:inherit !important}
.' . $uid . ' .kpsc-header{display:flex;align-items:center;justify-content:center;gap:' . round(10 * $header_scale) . 'px !important;margin-bottom:6px;flex-wrap:wrap}
.' . $uid . ' .kpsc-icon{width:' . round(28 * $header_scale) . 'px !important;height:' . round(28 * $header_scale) . 'px !important;flex-shrink:0}
.' . $uid . ' .kpsc-header-label{font-size:' . round(18 * $header_scale) . 'px !important;font-weight:600}
.' . $uid . ' .kpsc-header-date{font-size:' . round(18 * $header_scale) . 'px !important}
.' . $uid . ' .kpsc-title{font-size:' . round(18 * $header_scale) . 'px !important;font-style:italic;margin-top:4px;margin-bottom:32px}
.' . $uid . ' .kpsc-digits{display:flex;justify-content:center;align-items:center}
.' . $uid . ' .kpsc-unit-wrap{display:flex;align-items:center}
.' . $uid . ' .kpsc-unit{display:flex;flex-direction:column;align-items:center;width:clamp(72px,18vw,120px)}
.' . $uid . ' .kpsc-digit{font-size:clamp(48px,8vw,72px);font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
.' . $uid . ' .kpsc-label{font-size:clamp(10px,1.5vw,12px);text-transform:uppercase;letter-spacing:.05em;margin-top:8px}
.' . $uid . ' .kpsc-sep{font-size:clamp(30px,5vw,48px);font-weight:300;margin-top:-16px;flex-shrink:0;width:16px;text-align:center}
</style>';

    $out .= '<div class="' . $uid . '" id="' . $uid . '" style="background:' . esc_attr( $atts['bg_color'] ) . ';border:' . esc_attr( $border_style ) . '">';

    // Header
    $out .= '<div class="kpsc-header">';
    $out .= '<span class="kpsc-icon" style="color:' . esc_attr( $atts['icon_color'] ) . '">' . $icon_svg . '</span>';
    $out .= '<span class="kpsc-header-label" style="color:' . esc_attr( $atts['text_color'] ) . '">' . esc_html( $atts['header_label'] ) . ':</span>';
    $out .= '<span class="kpsc-header-date" id="' . $uid . '-date" style="color:' . esc_attr( $atts['label_color'] ) . '"></span>';
    $out .= '</div>';

    // Title
    $out .= '<p class="kpsc-title" id="' . $uid . '-title" style="color:' . esc_attr( $atts['label_color'] ) . '"></p>';

    // Digits
    $labels = array( 'Zile', 'Ore', 'Minute', 'Secunde' );
    $ids = array( 'days', 'hours', 'minutes', 'seconds' );
    $out .= '<div class="kpsc-digits">';
    for ( $i = 0; $i < 4; $i++ ) {
        $out .= '<div class="kpsc-unit-wrap">';
        $out .= '<div class="kpsc-unit">';
        $out .= '<span class="kpsc-digit" id="' . $uid . '-' . $ids[$i] . '" style="color:' . esc_attr( $atts['digit_color'] ) . '">00</span>';
        $out .= '<span class="kpsc-label" style="color:' . esc_attr( $atts['label_color'] ) . '">' . $labels[$i] . '</span>';
        $out .= '</div>';
        if ( $i < 3 ) {
            $out .= '<span class="kpsc-sep" style="color:' . esc_attr( $atts['separator_color'] ) . '">:</span>';
        }
        $out .= '</div>';
    }
    $out .= '</div>';
    $out .= '</div>';

    // JavaScript countdown
    $out .= '<script>
(function(){
  var uid = "' . esc_js( $uid ) . '";
  var schedules = ' . $schedules_json . ';
  var specialEvents = ' . $special_events_json . ';
  var dayNames = ["Duminică","Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă"];
  var monthNames = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];

  function pad(n){ return n < 10 ? "0" + n : "" + n; }

  function getNext(){
    var now = new Date();
    var nearest = Infinity, nearestDate = "", nearestTitle = "";

    for (var i = 0; i < specialEvents.length; i++){
      var ev = specialEvents[i];
      var parts = ev.date.split("-");
      var t = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]), ev.hour, ev.minute, 0, 0);
      var ms = t.getTime() - now.getTime();
      if (ms > 0 && ms < nearest){
        nearest = ms;
        nearestDate = dayNames[t.getDay()] + ", " + t.getDate() + " " + monthNames[t.getMonth()] + " " + t.getFullYear() + ", Ora " + pad(ev.hour) + ":" + pad(ev.minute);
        nearestTitle = ev.title;
      }
    }

    for (var j = 0; j < schedules.length; j++){
      var s = schedules[j];
      var target = new Date(now);
      target.setHours(s.hour, s.minute, 0, 0);
      var diff = ((s.day - now.getDay() + 7) % 7);
      target.setDate(now.getDate() + diff);
      if (target <= now) target.setDate(target.getDate() + 7);
      var ms2 = target.getTime() - now.getTime();
      if (ms2 < nearest){
        nearest = ms2;
        nearestDate = dayNames[target.getDay()] + ", " + target.getDate() + " " + monthNames[target.getMonth()] + " " + target.getFullYear() + ", Ora " + pad(s.hour) + ":" + pad(s.minute);
        nearestTitle = s.title;
      }
    }
    return { ms: nearest, date: nearestDate, title: nearestTitle };
  }

  function tick(){
    var n = getNext();
    var totalSec = Math.max(0, Math.floor(n.ms / 1000));
    var d = Math.floor(totalSec / 86400);
    var h = Math.floor((totalSec % 86400) / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;

    document.getElementById(uid + "-days").textContent = pad(d);
    document.getElementById(uid + "-hours").textContent = pad(h);
    document.getElementById(uid + "-minutes").textContent = pad(m);
    document.getElementById(uid + "-seconds").textContent = pad(s);
    document.getElementById(uid + "-date").textContent = n.date;
    var titleEl = document.getElementById(uid + "-title");
    if (titleEl) titleEl.textContent = n.title;
  }

  tick();
  setInterval(tick, 1000);
})();
</script>';

    return $out;
}
add_shortcode( 'antiohia_service_countdown', 'kp_antiohia_service_countdown' );

/* ── Live Schedule shortcode ─────────────────────── */

function kp_antiohia_get_live_schedule_defaults() {
    return array(
        'show_top_divider'    => '0',
        'show_bottom_divider' => '0',
        'icon_color'          => '#374151',
        'day_color'           => '#9ca3af',
        'time_color'          => '#111827',
        'title_color'         => '#111827',
        'subtitle_color'      => '#6b7280',
        'divider_color'       => '#e5e7eb',
        'size_scale'          => '1',
        'vertical_spacing'    => '1',
    );
}

function kp_antiohia_live_schedule_icons() {
    return array(
        'Sun'       => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
        'Moon'      => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        'HandHeart' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/></svg>',
        'PrayingHands' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21V8.5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6.2c0 .5-.2 1-.55 1.36L4.2 17.76A2 2 0 0 0 5.62 21H11Z"/><path d="M13 21V8.5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v6.2c0 .5.2 1 .55 1.36l2.25 1.7A2 2 0 0 1 18.38 21H13Z"/><path d="M12 6.5V21"/><path d="M9 6.8a3 3 0 0 1 3-2.8 3 3 0 0 1 3 2.8"/></svg>',
        'BookOpen'  => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        'Church'    => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 22V5l-6-3-6 3v17"/><path d="M12 7v5M10 9h4"/></svg>',
        'Cross'     => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-7h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>',
        'Heart'     => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
        'Calendar'  => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
        'Clock'     => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        'Bell'      => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
        'Flame'     => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        'Star'      => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'Mic'       => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        'Users'     => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    );
}

function kp_antiohia_live_schedule( $atts ) {
    $defaults = kp_antiohia_get_live_schedule_defaults();
    $saved = get_option( 'antiohia_live_schedule_config', array() );

    $saved_mapped = array();
    if ( isset( $saved['showTopDivider'] ) )    $saved_mapped['show_top_divider']    = $saved['showTopDivider'] ? '1' : '0';
    if ( isset( $saved['showBottomDivider'] ) ) $saved_mapped['show_bottom_divider'] = $saved['showBottomDivider'] ? '1' : '0';
    if ( isset( $saved['iconColor'] ) )         $saved_mapped['icon_color']     = $saved['iconColor'];
    if ( isset( $saved['dayColor'] ) )          $saved_mapped['day_color']      = $saved['dayColor'];
    if ( isset( $saved['timeColor'] ) )         $saved_mapped['time_color']     = $saved['timeColor'];
    if ( isset( $saved['titleColor'] ) )        $saved_mapped['title_color']    = $saved['titleColor'];
    if ( isset( $saved['subtitleColor'] ) )     $saved_mapped['subtitle_color'] = $saved['subtitleColor'];
    if ( isset( $saved['dividerColor'] ) )      $saved_mapped['divider_color']  = $saved['dividerColor'];
    if ( isset( $saved['sizeScale'] ) )         $saved_mapped['size_scale']        = (string) $saved['sizeScale'];
    if ( isset( $saved['verticalSpacing'] ) )   $saved_mapped['vertical_spacing']  = (string) $saved['verticalSpacing'];

    $atts = shortcode_atts( $defaults, $atts, 'antiohia_live_schedule' );
    $atts = array_merge( $atts, $saved_mapped );

    $services = array(
        array( 'icon' => 'Sun',       'day' => 'Duminică', 'time' => '10:00', 'title' => 'Slujba de duminică dimineața', 'subtitle' => 'cu Masa Domnului' ),
        array( 'icon' => 'Moon',      'day' => 'Duminică', 'time' => '18:00', 'title' => 'Slujba de duminică seara',     'subtitle' => '(program interactiv)' ),
        array( 'icon' => 'PrayingHands', 'day' => 'Joi',   'time' => '18:00', 'title' => 'Slujba de joi seara',          'subtitle' => 'cu predică și rugăciune' ),
    );
    if ( isset( $saved['services'] ) && is_array( $saved['services'] ) && ! empty( $saved['services'] ) ) {
        $services = $saved['services'];
    }

    $icons = kp_antiohia_live_schedule_icons();
    $uid = 'kp-ls-' . wp_unique_id();
    $top_border    = $atts['show_top_divider']    === '1' ? '1px solid ' . esc_attr( $atts['divider_color'] ) : 'none';
    $bottom_border = $atts['show_bottom_divider'] === '1' ? '1px solid ' . esc_attr( $atts['divider_color'] ) : 'none';
    $sc = is_numeric( $atts['size_scale'] ) ? floatval( $atts['size_scale'] ) : 1;
    $vs = is_numeric( $atts['vertical_spacing'] ) ? floatval( $atts['vertical_spacing'] ) : 1;
    if ( $sc <= 0 ) $sc = 1;
    if ( $vs <= 0 ) $vs = 1;

    $out  = '<!-- antiohia live_schedule v3.14.2 -->';
    $out .= '<style>
.' . $uid . '{display:grid;grid-template-columns:1fr;gap:' . ( 32 * $vs ) . 'px;padding:' . ( 32 * $vs ) . 'px 0;font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif !important;box-sizing:border-box}
.' . $uid . ' *{box-sizing:border-box;margin:0;padding:0;font-family:inherit !important}
.' . $uid . ' .kpls-item{text-align:center;padding:0 16px}
.' . $uid . ' .kpls-icon{width:' . ( 32 * $sc ) . 'px;height:' . ( 32 * $sc ) . 'px;margin:0 auto ' . ( 12 * $vs ) . 'px;display:block}
.' . $uid . ' .kpls-icon svg{width:100%;height:100%;display:block}
.' . $uid . ' .kpls-day{font-size:' . ( 12 * $sc ) . 'px;text-transform:uppercase;letter-spacing:.2em;margin-bottom:' . ( 8 * $vs ) . 'px}
.' . $uid . ' .kpls-time{font-size:' . ( 24 * $sc ) . 'px;margin-bottom:' . ( 12 * $vs ) . 'px;font-variant-numeric:tabular-nums;font-family:Georgia,"Times New Roman",serif !important}
.' . $uid . ' .kpls-rule{width:' . ( 32 * $sc ) . 'px;height:1px;margin:0 auto ' . ( 12 * $vs ) . 'px}
.' . $uid . ' .kpls-title{font-size:' . ( 16 * $sc ) . 'px;font-weight:600;line-height:1.25}
.' . $uid . ' .kpls-subtitle{font-size:' . ( 14 * $sc ) . 'px;font-style:italic;margin-top:' . ( 4 * $vs ) . 'px}
@media (min-width:768px){.' . $uid . '{grid-template-columns:repeat(' . count( $services ) . ',minmax(0,1fr))}}
</style>';

    $out .= '<div class="' . $uid . '" style="border-top:' . $top_border . ';border-bottom:' . $bottom_border . '">';
    foreach ( $services as $s ) {
        $icon_name = isset( $s['icon'] ) ? $s['icon'] : 'Sun';
        $icon_svg  = isset( $icons[ $icon_name ] ) ? $icons[ $icon_name ] : $icons['Sun'];
        $out .= '<div class="kpls-item">';
        $out .= '<div class="kpls-icon" style="color:' . esc_attr( $atts['icon_color'] ) . '">' . $icon_svg . '</div>';
        $out .= '<div class="kpls-day" style="color:' . esc_attr( $atts['day_color'] ) . '">' . esc_html( isset( $s['day'] ) ? $s['day'] : '' ) . '</div>';
        $out .= '<div class="kpls-time" style="color:' . esc_attr( $atts['time_color'] ) . '">' . esc_html( isset( $s['time'] ) ? $s['time'] : '' ) . '</div>';
        $out .= '<div class="kpls-rule" style="background:' . esc_attr( $atts['divider_color'] ) . '"></div>';
        $out .= '<h3 class="kpls-title" style="color:' . esc_attr( $atts['title_color'] ) . '">' . esc_html( isset( $s['title'] ) ? $s['title'] : '' ) . '</h3>';
        if ( ! empty( $s['subtitle'] ) ) {
            $out .= '<p class="kpls-subtitle" style="color:' . esc_attr( $atts['subtitle_color'] ) . '">' . esc_html( $s['subtitle'] ) . '</p>';
        }
        $out .= '</div>';
    }
    $out .= '</div>';
    return $out;
}
add_shortcode( 'antiohia_live_schedule', 'kp_antiohia_live_schedule' );

/* ── Sermon Importer ───────────────────────────── */

function kp_antiohia_get_sermon_importer_defaults() {
    return array(
        'apiKey'         => '',
        'playlistId'     => '',
        'slug'           => 'predici',
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

function kp_antiohia_get_sermon_importer_config() {
    $saved = get_option( 'antiohia_sermon_importer_config', array() );
    return array_merge( kp_antiohia_get_sermon_importer_defaults(), is_array( $saved ) ? $saved : array() );
}

/**
 * HTTP GET with automatic retry + exponential backoff.
 * Retries on WP_Error (network), HTTP 429, 500, 502, 503, 504, and on YouTube quota errors (403 with reason quotaExceeded/rateLimitExceeded/userRateLimitExceeded).
 * Returns the final wp_remote response (or WP_Error). Logs each retry attempt to error_log.
 */
function kp_antiohia_http_get_retry( $url, $args = array(), $max_attempts = 4 ) {
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
            error_log( '[Antiohia] HTTP retry exhausted after ' . $attempt . ' attempts (' . $reason . '): ' . $url );
            return $resp;
        }
        $wait = isset( $delays[ $attempt - 1 ] ) ? $delays[ $attempt - 1 ] : 30;
        error_log( '[Antiohia] HTTP retry ' . $attempt . '/' . $max_attempts . ' in ' . $wait . 's (' . $reason . '): ' . $url );
        sleep( $wait );
    }
    return $resp;
}

/**
 * Per-step stage tracker. The dashboard polls this transient while a step
 * is in flight so the user sees what the server is doing right now
 * (fetching transcript, AI processing, creating article, etc.).
 */
function kp_antiohia_set_stage( $stage, $detail = '' ) {
    set_transient( 'antiohia_sermon_current_stage', array(
        'stage'  => (string) $stage,
        'detail' => (string) $detail,
        'ts'     => time(),
    ), 5 * MINUTE_IN_SECONDS );
}
function kp_antiohia_clear_stage() {
    delete_transient( 'antiohia_sermon_current_stage' );
}

/* Custom Post Type with configurable rewrite slug */
function kp_antiohia_register_sermon_cpt() {
    $cfg  = kp_antiohia_get_sermon_importer_config();
    $slug = ! empty( $cfg['slug'] ) ? sanitize_title( $cfg['slug'] ) : 'predici';
    register_post_type( 'antiohia_predica', array(
        'labels' => array(
            'name'          => 'Predici',
            'singular_name' => 'Predică',
            'add_new_item'  => 'Adaugă predică',
            'edit_item'     => 'Editează predică',
            'menu_name'     => 'Predici',
        ),
        'public'        => true,
        'show_ui'       => true,
        'show_in_menu'  => true,
        'menu_position' => 32,
        'menu_icon'     => 'dashicons-microphone',
        'has_archive'   => $slug,
        'rewrite'       => array( 'slug' => $slug, 'with_front' => false ),
        'supports'      => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest'  => true,
        'taxonomies'    => array( 'antiohia_sermon_tag' ),
    ) );

    register_taxonomy( 'antiohia_sermon_tag', 'antiohia_predica', array(
        'labels'            => array(
            'name'          => 'Etichete predici',
            'singular_name' => 'Etichetă predică',
            'menu_name'     => 'Etichete',
            'all_items'     => 'Toate etichetele',
            'add_new_item'  => 'Adaugă etichetă',
        ),
        'public'            => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'hierarchical'      => false,
        'rewrite'           => array( 'slug' => 'eticheta-predica' ),
    ) );
}
add_action( 'init', 'kp_antiohia_register_sermon_cpt' );

/* Keep the public sermon archive out of page caches so toolbar/grid JS is never served stale. */
function kp_antiohia_sermon_archive_no_cache() {
    if ( ! is_post_type_archive( 'antiohia_predica' ) ) return;
    if ( ! defined( 'DONOTCACHEPAGE' ) ) define( 'DONOTCACHEPAGE', true );
    if ( ! defined( 'DONOTCACHEOBJECT' ) ) define( 'DONOTCACHEOBJECT', true );
    if ( ! defined( 'DONOTCACHEDB' ) ) define( 'DONOTCACHEDB', true );
    nocache_headers();
}
add_action( 'template_redirect', 'kp_antiohia_sermon_archive_no_cache', 0 );

/* Force 20 posts per page on the sermon archive (rest are loaded client-side). */
function kp_antiohia_sermon_archive_pre_get_posts( $q ) {
    if ( is_admin() || ! $q->is_main_query() ) return;
    if ( $q->is_post_type_archive( 'antiohia_predica' ) ) {
        $q->set( 'posts_per_page', 20 );
    }
}
add_action( 'pre_get_posts', 'kp_antiohia_sermon_archive_pre_get_posts' );

/* Clean archive title + hide empty post meta on /predici/ archive */
function kp_antiohia_sermon_archive_title( $title ) {
    if ( is_post_type_archive( 'antiohia_predica' ) ) {
        $cfg = kp_antiohia_get_sermon_importer_config();
        if ( ! empty( $cfg['archiveTitle'] ) ) {
            return esc_html( $cfg['archiveTitle'] );
        }
        $obj = get_post_type_object( 'antiohia_predica' );
        return $obj && ! empty( $obj->labels->name ) ? esc_html( $obj->labels->name ) : 'Predici';
    }
    return $title;
}
add_filter( 'get_the_archive_title', 'kp_antiohia_sermon_archive_title' );

/* SEO meta title + description for the sermon archive */
function kp_antiohia_sermon_archive_document_title( $parts ) {
    if ( is_post_type_archive( 'antiohia_predica' ) ) {
        $cfg = kp_antiohia_get_sermon_importer_config();
        if ( ! empty( $cfg['archiveMetaTitle'] ) ) {
            $parts['title'] = $cfg['archiveMetaTitle'];
        }
    }
    return $parts;
}
add_filter( 'document_title_parts', 'kp_antiohia_sermon_archive_document_title', 999 );

function kp_antiohia_sermon_archive_pre_document_title( $title ) {
    if ( is_post_type_archive( 'antiohia_predica' ) ) {
        $cfg = kp_antiohia_get_sermon_importer_config();
        if ( ! empty( $cfg['archiveMetaTitle'] ) ) {
            return $cfg['archiveMetaTitle'];
        }
    }
    return $title;
}
add_filter( 'pre_get_document_title', 'kp_antiohia_sermon_archive_pre_document_title', 999 );
add_filter( 'wp_title', 'kp_antiohia_sermon_archive_pre_document_title', 999 );

function kp_antiohia_sermon_archive_meta_description() {
    if ( ! is_post_type_archive( 'antiohia_predica' ) ) return;
    $cfg = kp_antiohia_get_sermon_importer_config();
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
add_action( 'wp_head', 'kp_antiohia_sermon_archive_meta_description', 1 );

function kp_antiohia_sermon_archive_css() {
    if ( ! is_post_type_archive( 'antiohia_predica' ) ) return;
    echo '<style id="kp-antiohia-archive-css">'
        . '.post-type-archive-antiohia_predica .entry-meta,'
        . '.post-type-archive-antiohia_predica .post-meta,'
        . '.post-type-archive-antiohia_predica .byline,'
        . '.post-type-archive-antiohia_predica .posted-on,'
        . '.post-type-archive-antiohia_predica .author,'
        . '.post-type-archive-antiohia_predica .posted-by,'
        . '.post-type-archive-antiohia_predica .entry-date,'
        . '.post-type-archive-antiohia_predica .updated,'
        . '.post-type-archive-antiohia_predica .page-header hr,'
        . '.post-type-archive-antiohia_predica .archive-header hr,'
        . '.post-type-archive-antiohia_predica .entry-header hr,'
        . '.post-type-archive-antiohia_predica main hr,'
        . '.post-type-archive-antiohia_predica .site-main hr,'
        . '.post-type-archive-antiohia_predica .content-area hr {display:none !important;}'
        . '.post-type-archive-antiohia_predica .entry-header,'
        . '.post-type-archive-antiohia_predica .page-header,'
        . '.post-type-archive-antiohia_predica .archive-header {border-top:0 !important;border-bottom:0 !important;}'
        . '.post-type-archive-antiohia_predica .archive-heading {border-top:0 !important;border-bottom:0 !important;padding-top:0 !important;padding-bottom:0 !important;margin-top:0 !important;margin-bottom:.35rem !important;}'
        . '.post-type-archive-antiohia_predica .archive-heading > hr,'
        . '.post-type-archive-antiohia_predica .archive-heading::before,'
        . '.post-type-archive-antiohia_predica .archive-heading::after {display:none !important;border:0 !important;}'
        . '</style>';
}
add_action( 'wp_head', 'kp_antiohia_sermon_archive_css', 99 );

/* Inject the archive page title into the theme's empty <h2 class="archive-heading"> */
function kp_antiohia_sermon_archive_title_js() {
    if ( ! is_post_type_archive( 'antiohia_predica' ) ) return;
    $cfg = kp_antiohia_get_sermon_importer_config();
    $title = ! empty( $cfg['archiveTitle'] ) ? $cfg['archiveTitle'] : '';
    if ( $title === '' ) {
        $obj = get_post_type_object( 'antiohia_predica' );
        $title = $obj && ! empty( $obj->labels->name ) ? $obj->labels->name : 'Predici';
    }
    $title_js = wp_json_encode( $title );
    echo '<script id="kp-antiohia-archive-title-js">(function(){function run(){var els=document.querySelectorAll(".archive-heading");for(var i=0;i<els.length;i++){var el=els[i];el.innerHTML="";var h1=document.createElement("h1");h1.textContent=' . $title_js . ';h1.style.margin="0";h1.style.padding="0";h1.style.border="0";h1.style.fontWeight="700";el.appendChild(h1);el.style.border="0";el.style.padding="0";}}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",run);}else{run();}})();</script>';
}
add_action( 'wp_footer', 'kp_antiohia_sermon_archive_title_js', 99 );

/* ── Weekly YouTube views refresh ─────────────── */
function kp_antiohia_refresh_sermon_views() {
    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) ) return;
    $posts = get_posts( array(
        'post_type'      => 'antiohia_predica',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'meta_query'     => array(
            array( 'key' => '_antiohia_yt_video_id', 'compare' => 'EXISTS' ),
        ),
    ) );
    if ( empty( $posts ) ) return;
    $map = array();
    foreach ( $posts as $pid ) {
        $vid = get_post_meta( $pid, '_antiohia_yt_video_id', true );
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
                update_post_meta( $map[ $vid ], '_antiohia_yt_views', $views );
                update_post_meta( $map[ $vid ], '_antiohia_yt_views_updated', time() );
            }
        }
    }
}
add_action( 'antiohia_sermon_views_refresh_event', 'kp_antiohia_refresh_sermon_views' );

function kp_antiohia_schedule_views_refresh() {
    if ( ! wp_next_scheduled( 'antiohia_sermon_views_refresh_event' ) ) {
        wp_schedule_event( time() + 600, 'weekly', 'antiohia_sermon_views_refresh_event' );
    }
}
add_action( 'init', 'kp_antiohia_schedule_views_refresh' );

/* ── Archive Toolbar (search + sort + tag cloud) ─ */
function kp_antiohia_sermon_archive_toolbar() {
    if ( ! is_post_type_archive( 'antiohia_predica' ) ) return;
    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( empty( $cfg['archiveToolbarEnabled'] ) ) return;

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
                'taxonomy'   => 'antiohia_sermon_tag',
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
    echo '<style id="kp-antiohia-toolbar-css">'
        . '.post-type-archive-antiohia_predica .kp-sermon-toolbar{font-family:inherit !important;margin:-.85rem 0 2.25rem !important;padding-top:.75rem !important;--kp-tag-lines-desktop:' . $lines_desktop . ';--kp-tag-lines-mobile:' . $lines_mobile . ';overflow:visible !important;}'
        . '.kp-sermon-toolbar *{box-sizing:border-box;}'
        . '.kp-sermon-toolbar .kp-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;background:#ffffff;padding:.85rem 1rem;border:1px solid rgba(0,0,0,.08);border-radius:14px;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-toolbar{overflow:visible;}'
        . '.kp-sermon-toolbar .kp-search{flex:1 1 280px;min-width:0;}'
        . '.kp-sermon-toolbar .kp-search input{width:100%;padding:.55rem .85rem;font-size:.95rem;background:rgba(0,0,0,.04);border:0;border-radius:10px;color:#111;outline:none;font-family:inherit !important;}'
        . '.kp-sermon-toolbar .kp-search input::placeholder{color:rgba(0,0,0,.45);}'
        . '.kp-sermon-toolbar .kp-sort{display:flex;align-items:center;gap:.5rem;flex-shrink:0;}'
        . '.kp-sermon-toolbar .kp-sort label{font-size:.85rem;color:rgba(0,0,0,.55);font-weight:500;font-family:inherit !important;}'
        . '.kp-sermon-toolbar .kp-sort select{background:transparent;border:0;font-size:.9rem;font-weight:600;color:#111;cursor:pointer;outline:none;font-family:inherit !important;padding:.25rem .25rem .25rem 0;}'
        . '.kp-sermon-toolbar .kp-tags{display:flex;flex-wrap:wrap;align-content:flex-start;gap:.45rem;margin-top:.85rem;line-height:1;max-height:calc((1.625rem * var(--kp-tag-lines-desktop)) + (.45rem * (var(--kp-tag-lines-desktop) - 1)));overflow:hidden;}'
        . '@media (max-width:768px){.kp-sermon-toolbar .kp-tags{max-height:calc((1.625rem * var(--kp-tag-lines-mobile)) + (.45rem * (var(--kp-tag-lines-mobile) - 1)));}}'
        . '.kp-sermon-toolbar .kp-tag{display:inline-flex;align-items:center;height:1.625rem;padding:0 .8rem;background:#ffffff;border:1px solid rgba(0,0,0,.08);border-radius:9999px;font-size:.78rem;font-weight:500;color:rgba(0,0,0,.65);cursor:pointer;transition:all .15s ease;font-family:inherit !important;line-height:1;white-space:nowrap;}'
        . '.kp-sermon-toolbar .kp-tag:hover{border-color:rgba(0,0,0,.25);color:#111;}'
        . '.kp-sermon-toolbar .kp-tag.is-active{background:#111;border-color:#111;color:#fff;}'
        . '.post-type-archive-antiohia_predica .kp-hidden-by-toolbar{display:none !important;}'
        . '.post-type-archive-antiohia_predica .kp-slot-hidden{display:none !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card.kp-slot-hidden{display:none !important;}'
        . '.post-type-archive-antiohia_predica .kp-source-hidden,.post-type-archive-antiohia_predica .kp-source-hidden *{display:none !important;}'
        . '.post-type-archive-antiohia_predica .kp-archive-tail-hidden{display:none !important;margin:0 !important;padding:0 !important;border:0 !important;height:0 !important;}'
        . '.post-type-archive-antiohia_predica nav.pagination,.post-type-archive-antiohia_predica .navigation.pagination,.post-type-archive-antiohia_predica .pagination,.post-type-archive-antiohia_predica .paging-navigation,.post-type-archive-antiohia_predica .posts-navigation,.post-type-archive-antiohia_predica .post-navigation,.post-type-archive-antiohia_predica .nav-links,.post-type-archive-antiohia_predica .wp-pagenavi,.post-type-archive-antiohia_predica .page-numbers{display:none !important;}'
        // Once the synthetic grid exists, force-hide ANY original theme article outside it.
        // Prevents duplicates after wp_update_post date changes (repair tool) re-trigger theme renders.
        . 'body.post-type-archive-antiohia_predica:has(#kp-sermon-grid) article[id^="post-"]:not(#kp-sermon-grid article){display:none !important;}'
        // Hide native dividers/spacers that the theme renders between/after articles
        . 'body.post-type-archive-antiohia_predica:has(#kp-sermon-grid) hr,'
        . 'body.post-type-archive-antiohia_predica:has(#kp-sermon-grid) .post-separator,'
        . 'body.post-type-archive-antiohia_predica:has(#kp-sermon-grid) .entries-divider{display:none !important;}'
        // Remove bottom spacing left behind by theme list/pagination wrappers
        . 'body.post-type-archive-antiohia_predica:has(#kp-sermon-grid) .posts-wrapper,'
        . 'body.post-type-archive-antiohia_predica:has(#kp-sermon-grid) .blog-content,'
        . 'body.post-type-archive-antiohia_predica:has(#kp-sermon-grid) .entry-content-wrap{padding-bottom:0 !important;margin-bottom:0 !important;}'
        . '.post-type-archive-antiohia_predica #kp-sermon-load-more-wrap{display:flex;justify-content:center;margin:1.5rem 0 0 !important;padding:0 !important;border:0 !important;}'
        . '.post-type-archive-antiohia_predica #kp-sermon-load-more-wrap ~ *:not(#kp-sermon-load-more-wrap):not(#kp-sermon-toolbar):not(#kp-sermon-grid){display:none !important;margin:0 !important;padding:0 !important;border:0 !important;height:0 !important;}'
        // Also kill the theme's "entries divider" / pagination separator that
        // sits as the FIRST element after the grid (when load-more wrap is appended
        // outside the same parent in some themes).
        . '.post-type-archive-antiohia_predica #kp-sermon-grid ~ hr,'
        . '.post-type-archive-antiohia_predica #kp-sermon-grid ~ .entries-divider,'
        . '.post-type-archive-antiohia_predica #kp-sermon-grid ~ .post-separator,'
        . '.post-type-archive-antiohia_predica #kp-sermon-grid ~ .wp-block-separator{display:none !important;margin:0 !important;padding:0 !important;border:0 !important;height:0 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:2rem !important;margin:0 !important;width:100% !important;max-width:100% !important;clear:both !important;}'
        . '@media (max-width:768px){.post-type-archive-antiohia_predica .kp-sermon-grid{grid-template-columns:1fr !important;gap:1.5rem !important;}}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card{display:block !important;width:auto !important;max-width:none !important;min-width:0 !important;float:none !important;clear:none !important;margin:0 !important;padding:0 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card > article{display:block !important;margin:0 !important;padding:0 !important;border:0 !important;width:auto !important;max-width:none !important;float:none !important;clear:none !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid img{opacity:1 !important;visibility:visible !important;display:block !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card > article::before{display:none !important;}'
        // Cover image hover effect (lost when cloning into custom grid)
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-sermon-card a:has(img),'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-sermon-card .post-thumbnail,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-sermon-card .entry-thumbnail,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-sermon-card figure{display:block;overflow:hidden;border-radius:0 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-sermon-card img{transition:transform .45s ease, opacity .25s ease;border-radius:0 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-sermon-card:hover img{transform:scale(1.04);}'
        // Reduce spacing between date and title
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-meta{display:block !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid time,.post-type-archive-antiohia_predica .kp-sermon-grid .posted-on,.post-type-archive-antiohia_predica .kp-sermon-grid .entry-date,.post-type-archive-antiohia_predica .kp-sermon-grid .updated{display:inline !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-summary{display:block !important;margin-top:.75rem !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-summary p{margin:0 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-meta,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .posted-on,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-slot-date-wrap,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid time{margin:0 !important;padding:0 !important;line-height:1.05 !important;}'
         . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-meta + *,'
         . '.post-type-archive-antiohia_predica .kp-sermon-grid .posted-on + *,'
          . '.post-type-archive-antiohia_predica .kp-sermon-grid .kp-slot-date-wrap + *{margin-top:0 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid h1,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid h2,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid h3,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-title{margin:0 0 1rem 0 !important;padding:0 !important;line-height:1.2 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-title a{line-height:1.2 !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-title + .entry-summary,'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid .entry-title + *{margin-top:1rem !important;}'
        // Divider between rows
        . '.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card{padding-top:2.25rem !important;border-top:1px solid rgba(0,0,0,.08) !important;}'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card[data-kp-vis-pos="1"],'
        . '.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card[data-kp-vis-pos="2"]{padding-top:0 !important;border-top:0 !important;}'
        . '@media (max-width:768px){.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card[data-kp-vis-pos="2"]{padding-top:2.25rem !important;border-top:1px solid rgba(0,0,0,.08) !important;}}'
        . '@media (max-width:768px){.post-type-archive-antiohia_predica .kp-sermon-toolbar .kp-bar{border-color:rgba(0,0,0,.18) !important;}.post-type-archive-antiohia_predica .kp-sermon-toolbar .kp-tag{border-color:rgba(0,0,0,.18) !important;}.post-type-archive-antiohia_predica .kp-sermon-grid > .kp-sermon-card{border-top-color:rgba(0,0,0,.18) !important;}}'
        . '.kp-sermon-toolbar .kp-empty{padding:2rem 1rem;text-align:center;color:rgba(0,0,0,.55);font-size:.95rem;}'
        // Hide the theme's article divider on the first row (and hide all dividers when only one row is visible)
        . '.post-type-archive-antiohia_predica article[data-kp-vis-idx="0"],'
        . '.post-type-archive-antiohia_predica article[data-kp-vis-idx="1"]{border-top:0 !important;padding-top:0 !important;}'
        . '.post-type-archive-antiohia_predica article[data-kp-vis-idx="0"]::before,'
        . '.post-type-archive-antiohia_predica article[data-kp-vis-idx="1"]::before{display:none !important;}'
        . '.post-type-archive-antiohia_predica.kp-single-row article{border-top:0 !important;padding-top:0 !important;}'
        . '.post-type-archive-antiohia_predica.kp-single-row article::before{display:none !important;}'
        . '</style>';

    // Container — JS will move it just after the archive heading and wire up filtering
    $opts = array(
        'date_desc'  => 'Cele mai noi',
        'date_asc'   => 'Cele mai vechi',
        'views_desc' => 'Popularitate',
    );
    $sort_html = '';
    if ( $show_sort ) {
        $sort_html = '<div class="kp-sort"><label for="kp-sermon-sort">Sortare:</label><select id="kp-sermon-sort">';
        foreach ( $opts as $val => $label ) {
            $sel = $val === $default_sort ? ' selected' : '';
            $sort_html .= '<option value="' . esc_attr( $val ) . '"' . $sel . '>' . esc_html( $label ) . '</option>';
        }
        $sort_html .= '</select></div>';
    }
    $search_html = $show_search ? '<div class="kp-search"><input type="search" id="kp-sermon-search" placeholder="Caută predici..." autocomplete="off" /></div>' : '';
    $tags_html   = $show_tags ? '<div class="kp-tags" id="kp-sermon-tags"></div>' : '';
    $bar_html    = ( $search_html || $sort_html ) ? '<div class="kp-bar">' . $search_html . $sort_html . '</div>' : '';
    echo '<div id="kp-sermon-toolbar" class="kp-sermon-toolbar" data-tags=\'' . esc_attr( $tags_json ) . '\' data-default-sort="' . esc_attr( $default_sort ) . '" style="display:none">'
        . $bar_html
        . $tags_html
        . '</div>';
}
add_action( 'wp_footer', 'kp_antiohia_sermon_archive_toolbar', 100 );

function kp_antiohia_sermon_archive_toolbar_js() {
    if ( ! is_post_type_archive( 'antiohia_predica' ) ) return;
    // Build a JS map of post-id => { date, views, tags[] } for client-side sort/filter
    $q = new WP_Query( array(
        'post_type'      => 'antiohia_predica',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'date',
        'order'          => 'DESC',
        'fields'         => 'ids',
    ) );
    $data = array();
    foreach ( $q->posts as $pid ) {
        $terms = wp_get_object_terms( $pid, 'antiohia_sermon_tag', array( 'fields' => 'names' ) );
        if ( is_wp_error( $terms ) ) $terms = array();
        $thumb_id  = get_post_thumbnail_id( $pid );
        $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'large' ) : '';
        $thumb_srcset = $thumb_id ? wp_get_attachment_image_srcset( $thumb_id, 'large' ) : '';
        $thumb_alt = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
        $data[] = array(
            'id'    => $pid,
            'date'  => get_post_time( 'U', true, $pid ),
            'views' => intval( get_post_meta( $pid, '_antiohia_yt_views', true ) ),
            'tags'  => array_values( $terms ),
            'title' => html_entity_decode( get_the_title( $pid ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
            'url'   => get_permalink( $pid ),
            'date_str' => get_the_date( '', $pid ),
            'date_attr' => get_post_time( 'c', true, $pid ),
            'excerpt' => wp_strip_all_tags( get_the_excerpt( $pid ) ),
            'thumb' => $thumb_url ? $thumb_url : '',
            'srcset' => $thumb_srcset ? $thumb_srcset : '',
            'alt'   => $thumb_alt ? $thumb_alt : '',
        );
    }
    $data_json = wp_json_encode( $data );
    ?>
<script id="kp-antiohia-toolbar-js">
(function(){
  var DATA = <?php echo $data_json; ?>;
  var byId = {};
  DATA.forEach(function(d){ byId[d.id] = d; });
  var BATCH = 20;
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
    var grid = document.getElementById('kp-sermon-grid');
    if (grid) return Array.prototype.slice.call(grid.children).map(function(card){ return card.__kpArticle || card.querySelector('article'); }).filter(Boolean);
    return Array.prototype.slice.call(document.querySelectorAll('article[id^="post-"], .post-type-archive-antiohia_predica article'));
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

  var defaultSort = (document.getElementById('kp-sermon-toolbar') && document.getElementById('kp-sermon-toolbar').getAttribute('data-default-sort')) || 'date_desc';
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
      if (d.excerpt){ p.textContent = d.excerpt; summary.style.display = ''; }
      else { p.textContent = ''; summary.style.display = 'none'; }
    }
    // Thumbnail
    var thumbA = article.querySelector('.post-thumbnail, a:has(img), figure');
    if (thumbA){
      var link = thumbA.tagName === 'A' ? thumbA : (thumbA.querySelector('a') || thumbA.closest('a'));
      if (link && link.tagName === 'A') link.setAttribute('href', d.url || '#');
      var img = thumbA.querySelector('img') || article.querySelector('img');
      if (img){
        if (d.thumb){
          img.setAttribute('src', d.thumb);
          if (d.srcset) img.setAttribute('srcset', d.srcset); else img.removeAttribute('srcset');
          img.setAttribute('alt', d.alt || '');
          img.removeAttribute('data-src'); img.removeAttribute('data-lazy-src'); img.removeAttribute('data-srcset');
          img.classList.remove('lazyload','lazy');
          img.style.opacity = '1'; img.style.visibility = 'visible';
        }
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
    card.className = 'kp-sermon-card';
    var article;
    if (TEMPLATE_ARTICLE){
      article = TEMPLATE_ARTICLE.cloneNode(true);
    } else {
      article = document.createElement('article');
      article.className = 'post type-antiohia_predica';
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
    var grid = document.getElementById('kp-sermon-grid');
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
    var grid = document.getElementById('kp-sermon-grid');
    if (!grid) return 0;
    var have = loadedIds();
    var added = 0;
    var sentinel = document.getElementById('kp-sermon-sentinel');
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
    var btn = document.getElementById('kp-sermon-load-more');
    if (allLoaded){
      if (btn) btn.style.display = 'none';
    } else {
      if (btn) btn.style.display = '';
    }
  }

  function hideNativePagination(){
    Array.prototype.slice.call(document.querySelectorAll('nav.pagination,.navigation.pagination,.pagination,.paging-navigation,.posts-navigation,.post-navigation,.wp-pagenavi,.page-numbers')).forEach(function(el){
      if (el.id === 'kp-sermon-load-more' || (el.closest && el.closest('#kp-sermon-toolbar'))) return;
      el.style.setProperty('display', 'none', 'important');
    });
  }

  function hideArchiveTail(grid){
    if (!grid || !grid.parentNode) return;
    var afterLoadMore = false;
    Array.prototype.slice.call(grid.parentNode.children).forEach(function(el){
      if (el === grid || el.id === 'kp-sermon-load-more-wrap') { afterLoadMore = true; return; }
      if (!afterLoadMore) return;
      if (el.id === 'kp-sermon-toolbar' || el.id === 'kp-sermon-grid') return;
      // Hide EVERYTHING that comes after the load-more wrap. Themes can render
      // their own dividers, "older posts" links, ad slots, schema markup, etc.
      el.classList.add('kp-archive-tail-hidden');
    });
  }

  function setupLoadMore(grid){
    if (!grid || !grid.parentNode) return;
    if (document.getElementById('kp-sermon-load-more')) return;
    if (DATA.length <= Object.keys(loadedIds()).length) allLoaded = true;

    var wrap = document.createElement('div');
    wrap.id = 'kp-sermon-load-more-wrap';
    wrap.style.cssText = 'display:flex;justify-content:center;margin:1.5rem 0 0;padding:0;border:0;';
    var btn = document.createElement('button');
    btn.id = 'kp-sermon-load-more';
    btn.type = 'button';
    btn.textContent = 'Încarcă mai multe';
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
    var grid = document.getElementById('kp-sermon-grid');
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
    var gridEl = document.getElementById('kp-sermon-grid');
    if (gridEl){
      var pos = 0;
      Array.prototype.slice.call(gridEl.children).forEach(function(card){
        if (!card.classList.contains('kp-sermon-card')) return;
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
    var wrap = toolbar.querySelector('#kp-sermon-tags');
    if (!wrap || !tags.length){ if(wrap) wrap.style.display='none'; return; }
    var html = '<span class="kp-tag is-active" data-tag="">Toate</span>';
    tags.forEach(function(t){
      html += '<span class="kp-tag" data-tag="'+ String(t).replace(/"/g,'&quot;') +'">'+ String(t) +'</span>';
    });
    wrap.innerHTML = html;
    wrap.addEventListener('click', function(e){
      var el = e.target.closest('.kp-tag'); if (!el) return;
      var tag = el.getAttribute('data-tag') || '';
      if (tag === ''){
        // "Toate" clears all selections.
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
    var toolbar = document.getElementById('kp-sermon-toolbar');
    if (!toolbar) return;
    // Collect articles BEFORE moving anything around.
    var rawArticles = Array.prototype.slice.call(document.querySelectorAll('article[id^="post-"], .post-type-archive-antiohia_predica article'));
    var seen = {};
    var seenPid = {};
    rawArticles = rawArticles.filter(function(a){
      // Skip articles nested inside another article (theme decoration)
      if (a.parentNode && a.parentNode.closest && a.parentNode.closest('article[id^="post-"]')) return false;
      if (a.closest && a.closest('#kp-sermon-grid')) return false;
      var id = a.id || '';
      if (id) {
        if (seen[id]) return false;
        seen[id] = 1;
      }
      var pid = getPostId(a);
      if (pid) {
        if (seenPid[pid]) return false;
        seenPid[pid] = 1;
      } else {
        // No resolvable post id → likely a theme placeholder, drop it
        return false;
      }
      return true;
    });
    // Build a normalized grid from cloned article cards. This avoids theme
    // masonry/column placeholders that create random empty slots after filters.
    var grid = null;
    if (rawArticles.length){
      grid = document.createElement('div');
      grid.id = 'kp-sermon-grid';
      grid.className = 'kp-sermon-grid';
      // Capture the first theme-rendered article as a template so synthetic
      // cards inherit the theme's CSS classes/styling for date/excerpt/title.
      captureTemplate(rawArticles[0], byId[getPostId(rawArticles[0])]);
      // Build synthetic cards from DATA for the posts the theme rendered on this page.
      // Using one consistent DOM structure (instead of cloning theme markup) avoids
      // duplicate date/summary blocks with mismatched styling.
      rawArticles.forEach(function(a){
        var pid = getPostId(a);
        var d = byId[pid];
        if (!d) return;
        var card = buildSyntheticCard(d);
        hydrateMedia(card);
        grid.appendChild(card);
        getSlot(a).classList.add('kp-source-hidden');
      });
      var firstSlot = getSlot(rawArticles[0]);
      if (firstSlot && firstSlot.parentNode) firstSlot.parentNode.insertBefore(grid, firstSlot);
    }
    var placed = false;
    var anchor = findArchiveAnchor();
    if (anchor && anchor.parentNode && anchor.tagName && anchor.tagName.toLowerCase() !== 'main'){
      anchor.parentNode.insertBefore(toolbar, anchor.nextSibling);
      placed = true;
    }
    if (grid){
      if (!placed && grid.parentNode){
        grid.parentNode.insertBefore(toolbar, grid);
        placed = true;
      }
    }
    if (!placed){
      if (anchor && anchor.parentNode){
        // Insert AFTER the heading's parent block to stay outside the grid.
        var host = anchor.parentNode;
        host.parentNode ? host.parentNode.insertBefore(toolbar, host.nextSibling)
                        : host.appendChild(toolbar);
      }
    }
    if (grid && toolbar.parentNode) {
      toolbar.parentNode.insertBefore(grid, toolbar.nextSibling);
    }
    toolbar.style.display = '';
    buildTags(toolbar);
    var s = toolbar.querySelector('#kp-sermon-search');
    var so = toolbar.querySelector('#kp-sermon-sort');
    if (s) s.addEventListener('input', function(){ state.q = s.value; if (s.value) ensureAllLoaded(); apply(); });
    if (so) so.addEventListener('change', function(){ state.sort = so.value; apply(); updateLoadMoreUI(); });
    if (grid) { setupLoadMore(grid); hideArchiveTail(grid); }
    hideNativePagination();
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
</script>
    <?php
}
add_action( 'wp_footer', 'kp_antiohia_sermon_archive_toolbar_js', 101 );

/* ── AI-Assist for Sermon Importer ─────────────── */

/**
 * Returns existing tag names across all sermon posts. Cached 1h.
 */
function kp_antiohia_get_existing_sermon_tags() {
    $cached = get_transient( 'antiohia_sermon_existing_tags' );
    if ( is_array( $cached ) ) return $cached;
    $tags = get_terms( array(
        'taxonomy'   => 'antiohia_sermon_tag',
        'hide_empty' => false,
        'fields'     => 'names',
        'number'     => 200,
    ) );
    if ( is_wp_error( $tags ) ) $tags = array();
    set_transient( 'antiohia_sermon_existing_tags', $tags, HOUR_IN_SECONDS );
    return $tags;
}

/**
 * Resolve provider endpoint + headers + body shape.
 * Returns array( 'url', 'headers', 'body' ) or null.
 */
function kp_antiohia_ai_build_request( $cfg, $messages ) {
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
function kp_antiohia_ai_process_sermon( $cfg, $title, $description, $transcript, $existing_tags ) {
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

    $system = "Ești asistent editorial pentru o biserică creștină. " .
        "Returnează STRICT un obiect JSON valid cu cheile opționale: " .
        "\"description\" (string HTML simplu cu <p>), \"tags\" (array de string-uri scurte), " .
        "\"excerpt\" (string max 160 caractere), \"title\" (string). " .
        "Include doar cheile pe care utilizatorul ți le cere prin instrucțiuni. " .
        "Nu inventa citate biblice sau afirmații care nu apar în surse. " .
        "Răspunde în limba română.";

    $user = "=== INSTRUCȚIUNI ===\n" . $cfg['aiInstructions'] . "\n\n";
    if ( ! empty( $tags_list ) ) {
        if ( ! empty( $cfg['aiRestrictTags'] ) ) {
            $user .= "=== TAGURI EXISTENTE PE SITE (OBLIGATORIU: alege EXCLUSIV din această listă, scrise IDENTIC; NU crea taguri noi, NU modifica forma; dacă niciunul nu se potrivește, returnează \"tags\": []) ===\n" . $tags_list . "\n\n";
        } else {
            $user .= "=== TAGURI EXISTENTE PE SITE (folosește-le prioritar) ===\n" . $tags_list . "\n\n";
        }
    }
    $user .= "=== TITLU ACTUAL ===\n" . $title . "\n\n";
    $user .= "=== DESCRIERE CURENTĂ ===\n" . $description . "\n\n";
    if ( ! empty( $transcript ) ) {
        $user .= "=== TRANSCRIERE ===\n" . $transcript . "\n";
    }

    $req = kp_antiohia_ai_build_request( $cfg, array(
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
function kp_antiohia_add_sermon_cron_intervals( $schedules ) {
    $cfg = kp_antiohia_get_sermon_importer_config();
    $h   = max( 1, intval( $cfg['syncIntervalH'] ) );
    $schedules['antiohia_sermon_interval'] = array(
        'interval' => $h * HOUR_IN_SECONDS,
        'display'  => sprintf( 'Antiohia Sermon Sync (%dh)', $h ),
    );
    return $schedules;
}
add_filter( 'cron_schedules', 'kp_antiohia_add_sermon_cron_intervals' );

function kp_antiohia_schedule_sermon_cron() {
    $cfg = kp_antiohia_get_sermon_importer_config();
    $next = wp_next_scheduled( 'antiohia_sermon_sync_event' );
    if ( $cfg['enabled'] && ! empty( $cfg['apiKey'] ) && ! empty( $cfg['playlistId'] ) ) {
        if ( $next ) wp_unschedule_event( $next, 'antiohia_sermon_sync_event' );
        wp_schedule_event( time() + 60, 'antiohia_sermon_interval', 'antiohia_sermon_sync_event' );
    } else if ( $next ) {
        wp_unschedule_event( $next, 'antiohia_sermon_sync_event' );
    }
}
add_action( 'wp', 'kp_antiohia_maybe_schedule_sermon_cron' );
function kp_antiohia_maybe_schedule_sermon_cron() {
    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( $cfg['enabled'] && ! wp_next_scheduled( 'antiohia_sermon_sync_event' ) && ! empty( $cfg['apiKey'] ) && ! empty( $cfg['playlistId'] ) ) {
        wp_schedule_event( time() + 60, 'antiohia_sermon_interval', 'antiohia_sermon_sync_event' );
    }
}
add_action( 'antiohia_sermon_sync_event', 'kp_antiohia_run_sermon_sync' );

/* AJAX: Save / Load sermon importer config */
function kp_antiohia_ajax_load_sermon_importer_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    wp_send_json_success( kp_antiohia_get_sermon_importer_config() );
}
add_action( 'wp_ajax_antiohia_load_sermon_importer_config', 'kp_antiohia_ajax_load_sermon_importer_config' );

function kp_antiohia_ajax_save_sermon_importer_config() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $incoming = json_decode( stripslashes( $_POST['config'] ), true );
    if ( ! is_array( $incoming ) ) wp_send_json_error( 'Invalid config' );
    $current = kp_antiohia_get_sermon_importer_config();
    $merged  = array_merge( $current, array(
        'apiKey'        => isset( $incoming['apiKey'] ) ? sanitize_text_field( $incoming['apiKey'] ) : $current['apiKey'],
        'playlistId'    => isset( $incoming['playlistId'] ) ? sanitize_text_field( $incoming['playlistId'] ) : $current['playlistId'],
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
        'archiveShowSort'          => isset( $incoming['archiveShowSort'] ) ? (bool) $incoming['archiveShowSort'] : $current['archiveShowSort'],
        'archiveShowTags'          => isset( $incoming['archiveShowTags'] ) ? (bool) $incoming['archiveShowTags'] : $current['archiveShowTags'],
        'archiveDefaultSort'       => isset( $incoming['archiveDefaultSort'] ) && in_array( $incoming['archiveDefaultSort'], array( 'date_desc', 'date_asc', 'views_desc' ), true ) ? $incoming['archiveDefaultSort'] : $current['archiveDefaultSort'],
        'archiveTagCloudMode'         => isset( $incoming['archiveTagCloudMode'] ) && in_array( $incoming['archiveTagCloudMode'], array( 'random', 'manual' ), true ) ? $incoming['archiveTagCloudMode'] : ( isset( $current['archiveTagCloudMode'] ) ? $current['archiveTagCloudMode'] : 'random' ),
        'archiveTagCloudLinesDesktop' => isset( $incoming['archiveTagCloudLinesDesktop'] ) ? max( 1, intval( $incoming['archiveTagCloudLinesDesktop'] ) ) : ( isset( $current['archiveTagCloudLinesDesktop'] ) ? $current['archiveTagCloudLinesDesktop'] : 2 ),
        'archiveTagCloudLinesMobile'  => isset( $incoming['archiveTagCloudLinesMobile'] ) ? max( 1, intval( $incoming['archiveTagCloudLinesMobile'] ) ) : ( isset( $current['archiveTagCloudLinesMobile'] ) ? $current['archiveTagCloudLinesMobile'] : 4 ),
        'archiveTagCloudPool'         => isset( $incoming['archiveTagCloudPool'] ) ? max( 1, intval( $incoming['archiveTagCloudPool'] ) ) : $current['archiveTagCloudPool'],
        'archiveTagCloudManualTags'   => isset( $incoming['archiveTagCloudManualTags'] ) && is_array( $incoming['archiveTagCloudManualTags'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', $incoming['archiveTagCloudManualTags'] ) ) ) : ( isset( $current['archiveTagCloudManualTags'] ) ? $current['archiveTagCloudManualTags'] : array() ),
        'simpleInstructions' => isset( $incoming['simpleInstructions'] ) && is_array( $incoming['simpleInstructions'] ) ? kp_antiohia_sanitize_simple_instructions( $incoming['simpleInstructions'] ) : $current['simpleInstructions'],
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
        'aiTemplates'        => isset( $incoming['aiTemplates'] ) && is_array( $incoming['aiTemplates'] ) ? kp_antiohia_sanitize_ai_templates( $incoming['aiTemplates'] ) : ( isset( $current['aiTemplates'] ) ? $current['aiTemplates'] : array() ),
        'aiRestrictTags'     => isset( $incoming['aiRestrictTags'] ) ? (bool) $incoming['aiRestrictTags'] : ( isset( $current['aiRestrictTags'] ) ? (bool) $current['aiRestrictTags'] : true ),
        'aiUseAiExcerpt'     => isset( $incoming['aiUseAiExcerpt'] ) ? (bool) $incoming['aiUseAiExcerpt'] : ( isset( $current['aiUseAiExcerpt'] ) ? (bool) $current['aiUseAiExcerpt'] : true ),
    ) );
    update_option( 'antiohia_sermon_importer_config', $merged );
    // Refresh CPT slug + cron
    flush_rewrite_rules( false );
    $next = wp_next_scheduled( 'antiohia_sermon_sync_event' );
    if ( $next ) wp_unschedule_event( $next, 'antiohia_sermon_sync_event' );
    if ( $merged['enabled'] && ! empty( $merged['apiKey'] ) && ! empty( $merged['playlistId'] ) ) {
        wp_schedule_event( time() + 60, 'antiohia_sermon_interval', 'antiohia_sermon_sync_event' );
    }
    wp_send_json_success();
}
add_action( 'wp_ajax_antiohia_save_sermon_importer_config', 'kp_antiohia_ajax_save_sermon_importer_config' );

/* AJAX: Manual sync trigger */
function kp_antiohia_ajax_run_sermon_sync() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $result = kp_antiohia_run_sermon_sync( true );
    wp_send_json_success( $result );
}
add_action( 'wp_ajax_antiohia_run_sermon_sync', 'kp_antiohia_ajax_run_sermon_sync' );

/**
 * AJAX: backfill correct publishedAt + viewCount for already-imported sermons.
 * Fixes posts that were imported via the buggy playlistItems-only path
 * (where publishedAt was actually the date-added-to-playlist, and viewCount was 0).
 * Processes in batches of 50 (YouTube `videos` endpoint allows up to 50 IDs/call).
 * Accepts optional `offset` to resume across multiple AJAX calls for big libraries.
 */
function kp_antiohia_ajax_repair_sermon_metadata() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) ) wp_send_json_error( 'Lipsește API Key' );

    $offset = isset( $_POST['offset'] ) ? max( 0, intval( $_POST['offset'] ) ) : 0;
    $batch  = 50;

    // Pull a page of sermon posts (any status) that have a video_id meta.
    $q = new WP_Query( array(
        'post_type'      => 'antiohia_predica',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'posts_per_page' => $batch,
        'offset'         => $offset,
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'meta_query'     => array( array( 'key' => '_antiohia_yt_video_id', 'compare' => 'EXISTS' ) ),
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
        $vid = get_post_meta( $pid, '_antiohia_yt_video_id', true );
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
            update_post_meta( $pid, '_antiohia_yt_published', $published );
        }
        update_post_meta( $pid, '_antiohia_yt_views', $views );
        update_post_meta( $pid, '_antiohia_yt_views_updated', time() );
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
add_action( 'wp_ajax_antiohia_repair_sermon_metadata', 'kp_antiohia_ajax_repair_sermon_metadata' );

/**
 * AJAX: Diagnose transcript fetch for a single YouTube video.
 * Tries each InnerTube client and the watch-page scrape, returning what each
 * strategy found so the user can see exactly where YouTube is blocking us.
 */
function kp_antiohia_ajax_diagnose_transcript() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
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
        $tracks = kp_antiohia_discover_caption_tracks_innertube( $video_id, $client );
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

    $cfg = kp_antiohia_get_sermon_importer_config();

    // Lovable Cloud edge function probe
    $cloud_segments = kp_antiohia_fetch_youtube_transcript_cloud( $video_id, $lang );
    $report['strategies'][] = array(
        'name'   => 'Lovable Cloud (edge function)',
        'tracks' => $cloud_segments ? 1 : 0,
        'langs'  => array(),
        'note'   => $cloud_segments ? ( count( $cloud_segments ) . ' segmente' ) : 'no segments',
    );

    // OAuth probe with detailed HTTP info for diagnosis.
    $oauth_tracks = array();
    $oauth_note   = 'OAuth neconfigurat';
    if ( kp_antiohia_youtube_oauth_is_configured( $cfg ) ) {
        $token = kp_antiohia_youtube_oauth_access_token( $cfg );
        if ( ! $token ) {
            $oauth_note = 'OAuth: refresh token invalid (token endpoint a eșuat)';
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
                    $oauth_channel_label = 'niciun canal asociat tokenului';
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
                    $oauth_note = 'OAuth OK (HTTP 200) — ' . count( $oauth_tracks ) . ' track(uri) manuale';
                } elseif ( $hc >= 200 && $hc < 300 ) {
                    $oauth_note = 'OAuth OK (HTTP 200) — items=[]';
                    if ( $oauth_channel_label || $video_owner_label ) {
                        $oauth_note .= ' | Canal OAuth: ' . ( $oauth_channel_label ?: '?' ) . ' | Proprietar video: ' . ( $video_owner_label ?: '?' );
                        if ( $oauth_channel_id && $video_owner_id && $oauth_channel_id !== $video_owner_id ) {
                            $oauth_note .= ' ⚠ Token-ul OAuth NU aparține canalului video-ului — re-autentifică-te cu contul Google care deține canalul (atenție la Brand Accounts: trebuie selectat brandul la consimțământ).';
                        } elseif ( $oauth_channel_id && $video_owner_id ) {
                            $oauth_note .= ' ✓ Conturile coincid — video-ul probabil nu are subtitrări marcate disponibile prin Data API.';
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
                        $friendly = 'Quota Google depășită pentru azi (resetare ~10:00 ora României)';
                    } elseif ( $err_reason_code === 'rateLimitExceeded' || $err_reason_code === 'userRateLimitExceeded' ) {
                        $friendly = 'Rate limit Google atins — reîncearcă peste câteva minute';
                    } elseif ( $hc === 401 ) {
                        $friendly = 'Token OAuth expirat sau invalid — reconectează contul Google';
                    } elseif ( $hc === 403 && $err_reason_code === 'forbidden' ) {
                        $friendly = 'Acces refuzat — contul OAuth nu deține acest video';
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
    $segments = kp_antiohia_fetch_youtube_transcript( $video_id, $lang, $cfg );
    $report['final'] = array(
        'segments' => count( $segments ),
        'chars'    => array_sum( array_map( function( $s ) { return strlen( $s['text'] ); }, $segments ) ),
        'preview'  => $segments ? mb_substr( $segments[0]['text'], 0, 120 ) : '',
    );
    wp_send_json_success( $report );
}
add_action( 'wp_ajax_antiohia_diagnose_transcript', 'kp_antiohia_ajax_diagnose_transcript' );

/**
 * AJAX: Test a YouTube playlist — verify it's reachable with the configured API key
 * and return basic metadata (title, channel, item count, sample items).
 */
function kp_antiohia_ajax_test_playlist() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = kp_antiohia_get_sermon_importer_config();
    $api_key = isset( $cfg['apiKey'] ) ? $cfg['apiKey'] : '';
    if ( empty( $api_key ) ) wp_send_json_error( 'Lipsește YouTube API Key în setări.' );
    $raw = isset( $_POST['playlist'] ) ? trim( wp_unslash( $_POST['playlist'] ) ) : '';
    if ( $raw === '' ) wp_send_json_error( 'Introdu un ID sau un URL de playlist.' );
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
    if ( is_wp_error( $r ) ) wp_send_json_error( 'Eroare rețea: ' . $r->get_error_message() );
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
add_action( 'wp_ajax_antiohia_test_playlist', 'kp_antiohia_ajax_test_playlist' );

/**
 * Final safety net: lock in the YouTube publishedAt date for our CPT against any
 * third-party save_post hook that might overwrite it. Runs at very late priority.
 */
function kp_antiohia_lock_yt_date( $post_id, $post, $update ) {
    if ( wp_is_post_revision( $post_id ) ) return;
    if ( $post->post_type !== 'antiohia_predica' ) return;
    $published = get_post_meta( $post_id, '_antiohia_yt_published', true );
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
add_action( 'save_post_antiohia_predica', 'kp_antiohia_lock_yt_date', 99999, 3 );

/* ── YouTube OAuth: one-click connect flow ───────── */

function kp_antiohia_get_oauth_redirect_uri() {
    return admin_url( 'admin.php?page=antiohia-shortcodes&antiohia_oauth_callback=1' );
}

/**
 * AJAX: returns the redirect URI (for display in wizard) and starts the OAuth flow
 * by generating a CSRF state token and building the Google authorization URL.
 */
function kp_antiohia_ajax_start_oauth() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( empty( $cfg['youtubeOAuthClientId'] ) || empty( $cfg['youtubeOAuthClientSecret'] ) ) {
        wp_send_json_error( 'Lipsesc Client ID sau Client Secret.' );
    }
    $state = wp_generate_password( 32, false );
    set_transient( 'antiohia_oauth_state_' . $state, 1, 10 * MINUTE_IN_SECONDS );
    $url = add_query_arg( array(
        'client_id'     => $cfg['youtubeOAuthClientId'],
        'redirect_uri'  => kp_antiohia_get_oauth_redirect_uri(),
        'response_type' => 'code',
        'scope'         => 'https://www.googleapis.com/auth/youtube.force-ssl',
        'access_type'   => 'offline',
        'prompt'        => 'consent',
        'include_granted_scopes' => 'true',
        'state'         => $state,
    ), 'https://accounts.google.com/o/oauth2/v2/auth' );
    wp_send_json_success( array( 'auth_url' => $url, 'redirect_uri' => kp_antiohia_get_oauth_redirect_uri() ) );
}
add_action( 'wp_ajax_antiohia_start_oauth', 'kp_antiohia_ajax_start_oauth' );

function kp_antiohia_ajax_get_oauth_redirect_uri() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    wp_send_json_success( array( 'redirect_uri' => kp_antiohia_get_oauth_redirect_uri() ) );
}
add_action( 'wp_ajax_antiohia_get_oauth_redirect_uri', 'kp_antiohia_ajax_get_oauth_redirect_uri' );

/**
 * AJAX: disconnect — wipe stored refresh token, access token, channel name.
 */
function kp_antiohia_ajax_disconnect_oauth() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = kp_antiohia_get_sermon_importer_config();
    // Best-effort token revoke
    if ( ! empty( $cfg['youtubeOAuthRefreshToken'] ) ) {
        wp_remote_post( 'https://oauth2.googleapis.com/revoke', array(
            'timeout' => 10,
            'body'    => array( 'token' => $cfg['youtubeOAuthRefreshToken'] ),
        ) );
    }
    $cfg['youtubeOAuthRefreshToken'] = '';
    $cfg['youtubeChannelName'] = '';
    update_option( 'antiohia_sermon_importer_config', $cfg );
    delete_transient( 'antiohia_youtube_oauth_access_token' );
    wp_send_json_success();
}
add_action( 'wp_ajax_antiohia_disconnect_oauth', 'kp_antiohia_ajax_disconnect_oauth' );

/**
 * AJAX: test that the stored OAuth credentials still work by calling channels.list?mine=true.
 */
function kp_antiohia_ajax_test_oauth() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = kp_antiohia_get_sermon_importer_config();
    $token = kp_antiohia_youtube_oauth_access_token( $cfg );
    if ( ! $token ) wp_send_json_error( 'Nu am putut obține access token. Reconectează.' );
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
        update_option( 'antiohia_sermon_importer_config', $cfg );
    }
    wp_send_json_success( array( 'channel' => $name ) );
}
add_action( 'wp_ajax_antiohia_test_oauth', 'kp_antiohia_ajax_test_oauth' );

/**
 * Handles the OAuth callback redirect from Google. Triggered on admin_init when
 * Google redirects back with ?antiohia_oauth_callback=1&code=xxx&state=yyy.
 */
function kp_antiohia_handle_oauth_callback() {
    if ( empty( $_GET['antiohia_oauth_callback'] ) ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;

    $code  = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : '';
    $state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';
    $error = isset( $_GET['error'] ) ? sanitize_text_field( wp_unslash( $_GET['error'] ) ) : '';

    $base = admin_url( 'admin.php?page=antiohia-shortcodes' );

    if ( $error ) {
        wp_safe_redirect( add_query_arg( array( 'antiohia_oauth' => 'error', 'reason' => rawurlencode( $error ) ), $base ) );
        exit;
    }
    if ( ! $code || ! $state || ! get_transient( 'antiohia_oauth_state_' . $state ) ) {
        wp_safe_redirect( add_query_arg( array( 'antiohia_oauth' => 'error', 'reason' => 'invalid_state' ), $base ) );
        exit;
    }
    delete_transient( 'antiohia_oauth_state_' . $state );

    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( empty( $cfg['youtubeOAuthClientId'] ) || empty( $cfg['youtubeOAuthClientSecret'] ) ) {
        wp_safe_redirect( add_query_arg( array( 'antiohia_oauth' => 'error', 'reason' => 'missing_credentials' ), $base ) );
        exit;
    }

    $resp = wp_remote_post( 'https://oauth2.googleapis.com/token', array(
        'timeout' => 25,
        'body'    => array(
            'code'          => $code,
            'client_id'     => $cfg['youtubeOAuthClientId'],
            'client_secret' => $cfg['youtubeOAuthClientSecret'],
            'redirect_uri'  => kp_antiohia_get_oauth_redirect_uri(),
            'grant_type'    => 'authorization_code',
        ),
    ) );
    if ( is_wp_error( $resp ) ) {
        wp_safe_redirect( add_query_arg( array( 'antiohia_oauth' => 'error', 'reason' => rawurlencode( $resp->get_error_message() ) ), $base ) );
        exit;
    }
    $json = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( empty( $json['refresh_token'] ) ) {
        $reason = isset( $json['error'] ) ? $json['error'] : 'no_refresh_token';
        wp_safe_redirect( add_query_arg( array( 'antiohia_oauth' => 'error', 'reason' => rawurlencode( $reason ) ), $base ) );
        exit;
    }
    $cfg['youtubeOAuthRefreshToken'] = sanitize_text_field( $json['refresh_token'] );
    if ( ! empty( $json['access_token'] ) ) {
        $ttl = ! empty( $json['expires_in'] ) ? max( 60, intval( $json['expires_in'] ) - 120 ) : 3300;
        set_transient( 'antiohia_youtube_oauth_access_token', $json['access_token'], $ttl );
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
    update_option( 'antiohia_sermon_importer_config', $cfg );

    wp_safe_redirect( add_query_arg( array( 'antiohia_oauth' => 'connected' ), $base ) );
    exit;
}
add_action( 'admin_init', 'kp_antiohia_handle_oauth_callback' );

/* ── Live progress sync: scan + step ─────────────── */

/**
 * Scan playlist: fetches all video IDs, stores them in an option as a queue,
 * and returns the total count for the progress UI.
 */
function kp_antiohia_ajax_scan_sermon_playlist() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    delete_transient( 'antiohia_sermon_sync_cancelled' );
    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) || empty( $cfg['playlistId'] ) ) {
        wp_send_json_error( 'Lipsește API Key sau Playlist ID' );
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
            'post_type'      => 'antiohia_predica',
            'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
            'meta_key'       => '_antiohia_yt_video_id',
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
    update_option( 'antiohia_sermon_sync_session', $session, false );

    wp_send_json_success( array(
        'total'       => $session['total'],
        'total_in_pl' => $session['total_in_pl'],
        'already'     => $session['already'],
    ) );
}
add_action( 'wp_ajax_antiohia_scan_sermon_playlist', 'kp_antiohia_ajax_scan_sermon_playlist' );

function kp_antiohia_ajax_cancel_sermon_sync() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    $cfg     = kp_antiohia_get_sermon_importer_config();
    $session = get_option( 'antiohia_sermon_sync_session', array() );
    $imported = isset( $session['imported'] ) && is_array( $session['imported'] ) ? $session['imported'] : array();

    if ( ! empty( $imported ) ) {
        kp_antiohia_log_sync( $cfg, 'error', sprintf( 'Întrerupt manual după %d importate', count( $imported ) ), $imported );
    }
    set_transient( 'antiohia_sermon_sync_cancelled', 1, 10 * MINUTE_IN_SECONDS );
    delete_option( 'antiohia_sermon_sync_session' );

    wp_send_json_success( array( 'cancelled' => true, 'imported' => count( $imported ) ) );
}
add_action( 'wp_ajax_antiohia_cancel_sermon_sync', 'kp_antiohia_ajax_cancel_sermon_sync' );

/**
 * Clear the sermon importer log (the "Recent imports" history shown in the widget).
 * Imported posts themselves are not touched.
 */
function kp_antiohia_ajax_clear_sermon_log() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $cfg = get_option( 'antiohia_sermon_importer_config', array() );
    if ( ! is_array( $cfg ) ) $cfg = array();
    $cfg['log'] = array();
    $cfg['totalImported'] = 0;
    update_option( 'antiohia_sermon_importer_config', $cfg );
    wp_send_json_success( array( 'cleared' => true ) );
}
add_action( 'wp_ajax_antiohia_clear_sermon_log', 'kp_antiohia_ajax_clear_sermon_log' );

/**
 * Step: process the next video from the queue. Returns the imported entry + remaining count.
 */
function kp_antiohia_ajax_step_sermon_sync() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

    if ( get_transient( 'antiohia_sermon_sync_cancelled' ) ) {
        delete_transient( 'antiohia_sermon_sync_cancelled' );
        delete_option( 'antiohia_sermon_sync_session' );
        wp_send_json_success( array( 'done' => true, 'cancelled' => true ) );
    }

    $cfg     = kp_antiohia_get_sermon_importer_config();
    $session = get_option( 'antiohia_sermon_sync_session', array() );
    if ( empty( $session ) || empty( $session['queue'] ) ) {
        // Done — finalize log + counters
        if ( ! empty( $session ) ) {
            $imported = isset( $session['imported'] ) ? $session['imported'] : array();
            $msg = sprintf( '%d importate', count( $imported ) );
            kp_antiohia_log_sync( $cfg, 'success', $msg, $imported );
            $cfg2 = kp_antiohia_get_sermon_importer_config();
            $cfg2['firstSyncDone'] = true;
            update_option( 'antiohia_sermon_importer_config', $cfg2 );
            delete_option( 'antiohia_sermon_sync_session' );
        }
        wp_send_json_success( array( 'done' => true ) );
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $video_id = array_shift( $session['queue'] );
    kp_antiohia_set_stage( 'starting', $video_id );
    $entry    = kp_antiohia_import_one_video( $cfg, $video_id );
    kp_antiohia_clear_stage();

    if ( $entry ) {
        $session['imported'][] = $entry;
    }

    if ( get_transient( 'antiohia_sermon_sync_cancelled' ) ) {
        delete_transient( 'antiohia_sermon_sync_cancelled' );
        delete_option( 'antiohia_sermon_sync_session' );
        wp_send_json_success( array( 'done' => true, 'cancelled' => true, 'entry' => $entry ) );
    }

    $remaining = count( $session['queue'] );
    $done      = $session['total'] - $remaining;

    // Persist session AFTER processing
    update_option( 'antiohia_sermon_sync_session', $session, false );

    // If done after this step, finalize immediately
    $is_finished = $remaining === 0;
    if ( $is_finished ) {
        $imported = $session['imported'];
        $msg = sprintf( '%d importate', count( $imported ) );
        kp_antiohia_log_sync( $cfg, 'success', $msg, $imported );
        $cfg2 = kp_antiohia_get_sermon_importer_config();
        $cfg2['firstSyncDone'] = true;
        update_option( 'antiohia_sermon_importer_config', $cfg2 );
        delete_option( 'antiohia_sermon_sync_session' );
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
            $rest_reason  = 'pauză lungă (la fiecare ' . $r_batch . ' video-uri)';
        } elseif ( $r_delay > 0 ) {
            $rest_seconds = $r_delay;
            $rest_reason  = 'pauză între video-uri';
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
add_action( 'wp_ajax_antiohia_step_sermon_sync', 'kp_antiohia_ajax_step_sermon_sync' );

/**
 * AJAX: poll the current per-video stage (used by the dashboard while a step
 * is in flight, so the user sees what the server is doing right now).
 */
function kp_antiohia_ajax_get_sermon_stage() {
    check_ajax_referer( 'antiohia_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );
    $st = get_transient( 'antiohia_sermon_current_stage' );
    if ( ! is_array( $st ) ) $st = array( 'stage' => '', 'detail' => '', 'ts' => 0 );
    $st['cancel_pending'] = (bool) get_transient( 'antiohia_sermon_sync_cancelled' );
    wp_send_json_success( $st );
}
add_action( 'wp_ajax_antiohia_get_sermon_stage', 'kp_antiohia_ajax_get_sermon_stage' );

/**
 * Import a single video by ID. Returns the imported entry array (or null on skip/error).
 * Extracted from kp_antiohia_run_sermon_sync so step endpoint can reuse it.
 */
function kp_antiohia_import_one_video( $cfg, $video_id ) {
    if ( empty( $video_id ) || empty( $cfg['apiKey'] ) ) return null;
    kp_antiohia_set_stage( 'starting', $video_id );

    // Dedup
    $existing = get_posts( array(
        'post_type'      => 'antiohia_predica',
        'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
        'meta_key'       => '_antiohia_yt_video_id',
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
    $resp = kp_antiohia_http_get_retry( $url, array( 'timeout' => 30 ) );
    if ( is_wp_error( $resp ) ) {
        error_log( '[Antiohia] videos endpoint failed for ' . $video_id . ': ' . $resp->get_error_message() );
        return null;
    }
    $code = wp_remote_retrieve_response_code( $resp );
    $body = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( $code >= 400 ) {
        $msg = isset( $body['error']['message'] ) ? $body['error']['message'] : ( 'HTTP ' . $code );
        error_log( '[Antiohia] videos endpoint HTTP ' . $code . ' for ' . $video_id . ': ' . $msg );
        return null;
    }
    $items = isset( $body['items'] ) ? $body['items'] : array();
    if ( empty( $items ) ) {
        error_log( '[Antiohia] videos endpoint returned no items for ' . $video_id );
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
        $description = kp_antiohia_clean_description( $description, $cfg['descriptionCleanup'] );
    }
    if ( ! empty( $cfg['simpleInstructions'] ) ) {
        $description = kp_antiohia_apply_simple_instructions( $description, $cfg['simpleInstructions'] );
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
        // kp_antiohia_fetch_youtube_transcript() already does its own retries
        // and fallbacks. An outer retry loop here turned a single video into
        // 60–120s of API thrashing, which often hit PHP max_execution_time
        // and dropped the transcript silently. A single call is correct.
        kp_antiohia_set_stage( 'fetching_transcript', $video_id );
        $transcript = kp_antiohia_fetch_youtube_transcript( $video_id, $tr_lang, $cfg );
    }

    // AI-Assist (optional): may rewrite description/title/excerpt and suggest tags
    $ai_tags    = array();
    $ai_excerpt = '';
    if ( ! empty( $cfg['aiEnabled'] ) ) {
        kp_antiohia_set_stage( 'ai_processing', $video_id );
        // Pre-compute speaker tag (from simple instructions) BEFORE asking AI,
        // so that a brand-new speaker is already included in the "existing tags"
        // list the AI must choose from.
        $pre_speaker_tags = kp_antiohia_extract_speaker_tags( $title, isset( $cfg['simpleInstructions'] ) ? $cfg['simpleInstructions'] : array() );
        $existing_tags    = kp_antiohia_get_existing_sermon_tags();
        if ( ! empty( $pre_speaker_tags ) ) {
            foreach ( $pre_speaker_tags as $st ) {
                if ( ! in_array( $st, $existing_tags, true ) ) $existing_tags[] = $st;
            }
        }
        $ai = kp_antiohia_ai_process_sermon( $cfg, $title, $description, $transcript, $existing_tags );
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
        $content .= "\n\n" . kp_antiohia_render_transcript_block( $transcript, $tdisplay );
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
    $final_excerpt  = $use_ai_excerpt ? $excerpt_source : wp_trim_words( $excerpt_source, 40, '…' );

    // CRITICAL: install a temporary filter that forces post_date/post_date_gmt for our
    // wp_insert_post call below. Other plugins (SEO, theme save_post hooks) sometimes
    // mutate post data after we set it; this filter runs inside wp_insert_post and is
    // the most robust way to make YouTube's publishedAt stick from the very first write.
    $kp_force_date = $published ? $post_date : '';
    $kp_date_filter = null;
    if ( $kp_force_date ) {
        $kp_date_filter = function( $data ) use ( $kp_force_date ) {
            if ( isset( $data['post_type'] ) && $data['post_type'] === 'antiohia_predica' ) {
                $data['post_date_gmt']     = $kp_force_date;
                $data['post_date']         = get_date_from_gmt( $kp_force_date );
                $data['post_modified_gmt'] = $kp_force_date;
                $data['post_modified']     = get_date_from_gmt( $kp_force_date );
            }
            return $data;
        };
        add_filter( 'wp_insert_post_data', $kp_date_filter, 9999 );
    }
    kp_antiohia_set_stage( 'creating_article', $title );
    $post_id = wp_insert_post( array(
        'post_title'    => wp_strip_all_tags( $title ),
        'post_content'  => $content,
        'post_excerpt'  => $final_excerpt,
        'post_status'   => 'draft',
        'post_type'     => 'antiohia_predica',
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
        update_post_meta( $post_id, '_antiohia_yt_published_local', $local_date );
    }

    update_post_meta( $post_id, '_antiohia_yt_video_id', $video_id );
    update_post_meta( $post_id, '_antiohia_yt_published', $published );
    update_post_meta( $post_id, '_antiohia_yt_views', $stats_views );
    update_post_meta( $post_id, '_antiohia_yt_views_updated', time() );

    // Always store transcript status + raw text as post meta (diagnostic + reuse).
    if ( ! empty( $cfg['fetchTranscript'] ) ) {
        if ( ! empty( $transcript ) && is_array( $transcript ) ) {
            $raw_lines = array();
            foreach ( $transcript as $seg ) {
                if ( ! empty( $seg['text'] ) ) $raw_lines[] = $seg['text'];
            }
            $raw_text = trim( implode( ' ', $raw_lines ) );
            update_post_meta( $post_id, '_antiohia_transcript', $raw_text );
            update_post_meta( $post_id, '_antiohia_transcript_status', 'ok:' . strlen( $raw_text ) . 'chars' );
        } else {
            update_post_meta( $post_id, '_antiohia_transcript_status', 'empty:no-captions' );
        }
    }

    if ( ! empty( $ai_tags ) ) {
        wp_set_object_terms( $post_id, $ai_tags, 'antiohia_sermon_tag', false );
        update_post_meta( $post_id, '_antiohia_ai_processed', 1 );
        delete_transient( 'antiohia_sermon_existing_tags' );
    } elseif ( ! empty( $cfg['aiEnabled'] ) ) {
        update_post_meta( $post_id, '_antiohia_ai_processed', 1 );
    }

    // Speaker → tag (extracted from title, append-only).
    $speaker_tags = kp_antiohia_extract_speaker_tags( $title, isset( $cfg['simpleInstructions'] ) ? $cfg['simpleInstructions'] : array() );
    if ( ! empty( $speaker_tags ) ) {
        wp_set_object_terms( $post_id, $speaker_tags, 'antiohia_sermon_tag', true );
        delete_transient( 'antiohia_sermon_existing_tags' );
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
function kp_antiohia_run_sermon_sync( $manual = false ) {
    $cfg = kp_antiohia_get_sermon_importer_config();
    if ( empty( $cfg['apiKey'] ) || empty( $cfg['playlistId'] ) ) {
        return kp_antiohia_log_sync( $cfg, 'error', 'Lipsește API Key sau Playlist ID', array() );
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
            return kp_antiohia_log_sync( $cfg, 'error', 'YouTube API: ' . $resp->get_error_message(), $imported );
        }
        $code = wp_remote_retrieve_response_code( $resp );
        $body = json_decode( wp_remote_retrieve_body( $resp ), true );
        if ( $code >= 400 ) {
            $msg = isset( $body['error']['message'] ) ? $body['error']['message'] : ( 'HTTP ' . $code );
            return kp_antiohia_log_sync( $cfg, 'error', 'YouTube API: ' . $msg, $imported );
        }

        $items = isset( $body['items'] ) ? $body['items'] : array();
        $hit_existing = false;

        foreach ( $items as $item ) {
            $sn       = isset( $item['snippet'] ) ? $item['snippet'] : array();
            $video_id = isset( $sn['resourceId']['videoId'] ) ? $sn['resourceId']['videoId'] : '';
            if ( ! $video_id ) continue;

            // Dedup
            $existing = get_posts( array(
                'post_type'      => 'antiohia_predica',
                'post_status'    => array( 'publish', 'draft', 'pending', 'private', 'future' ),
                'meta_key'       => '_antiohia_yt_video_id',
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
            $entry = kp_antiohia_import_one_video( $cfg, $video_id );
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
    $msg = sprintf( '%d importate, %d sărite', count( $imported ), $skipped );
    return kp_antiohia_log_sync( $cfg, 'success', $msg, $imported );
}

function kp_antiohia_log_sync( $cfg, $status, $msg, $imported ) {
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
    update_option( 'antiohia_sermon_importer_config', $cfg );
    return $entry;
}

/* ── YouTube transcript fetching ───────────────── */

/**
 * Remove user-defined boilerplate blocks from a YouTube description.
 * Blocks are separated by a line containing only "---". Whitespace-insensitive
 * (collapses runs of whitespace) so small formatting differences still match.
 */
function kp_antiohia_clean_description( $description, $cleanup_raw ) {
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
function kp_antiohia_sanitize_simple_instructions( $list ) {
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

function kp_antiohia_sanitize_ai_templates( $list ) {
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
function kp_antiohia_apply_simple_instructions( $description, $instructions ) {
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
function kp_antiohia_extract_speaker_tags( $title, $instructions ) {
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
function kp_antiohia_fetch_youtube_transcript( $video_id, $preferred_lang = 'ro', $cfg = null ) {
    if ( empty( $video_id ) ) return array();

    $preferred_lang = strtolower( $preferred_lang );

    // TIER 1 — try local extraction (InnerTube + watch-page scrape) from the
    // client's own server IP. Free, fast, no external dependency.
    // Try twice with a short pause between attempts to absorb transient
    // network blips / temporary InnerTube hiccups before falling through.
    $tracks = kp_antiohia_discover_caption_tracks( $video_id );
    if ( empty( $tracks ) ) {
        usleep( 600000 ); // 0.6s
        $tracks = kp_antiohia_discover_caption_tracks( $video_id );
    }
    if ( empty( $tracks ) ) {
        error_log( '[Antiohia] Tier 1 (local) found no caption tracks for ' . $video_id );
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
            $segments = kp_antiohia_parse_timedtext_xml( $body );
            if ( empty( $segments ) ) $segments = kp_antiohia_parse_timedtext_json( $body );
        }
        if ( ! empty( $segments ) ) return $segments;
    }

    if ( ! is_array( $cfg ) ) {
        $cfg = kp_antiohia_get_sermon_importer_config();
    }

    // TIER 2 — OAuth via YouTube Data API (most reliable when configured;
    // user owns the channel so quota is generous and there is no anti-bot wall).
    if ( kp_antiohia_youtube_oauth_is_configured( $cfg ) ) {
        error_log( '[Antiohia] Tier 1 empty, trying OAuth for ' . $video_id );
        $oauth = kp_antiohia_fetch_youtube_transcript_oauth( $video_id, $preferred_lang, $cfg );
        if ( ! empty( $oauth ) ) return $oauth;
        error_log( '[Antiohia] OAuth transcript empty for ' . $video_id . ', falling back to cloud' );
    } else {
        error_log( '[Antiohia] OAuth not configured for ' . $video_id );
    }

    // TIER 3 — Lovable Cloud edge function. Runs the same InnerTube/scrape
    // logic from a different IP pool, last-resort when both local & OAuth fail.
    if ( ! isset( $cfg['cloudTranscriptEnabled'] ) || ! empty( $cfg['cloudTranscriptEnabled'] ) ) {
        error_log( '[Antiohia] Trying cloud transcript for ' . $video_id );
        $cloud = kp_antiohia_fetch_youtube_transcript_cloud( $video_id, $preferred_lang );
        if ( ! empty( $cloud ) ) return $cloud;
        error_log( '[Antiohia] Cloud transcript also empty for ' . $video_id );
    }

    return array();
}

/**
 * TIER 2 — Ask the Lovable Cloud edge function for the transcript.
 * No auth required (the endpoint is public and verify_jwt=false).
 */
function kp_antiohia_fetch_youtube_transcript_cloud( $video_id, $preferred_lang ) {
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

function kp_antiohia_youtube_oauth_is_configured( $cfg ) {
    return is_array( $cfg )
        && ! empty( $cfg['youtubeOAuthClientId'] )
        && ! empty( $cfg['youtubeOAuthClientSecret'] )
        && ! empty( $cfg['youtubeOAuthRefreshToken'] );
}

function kp_antiohia_youtube_oauth_access_token( $cfg ) {
    if ( ! kp_antiohia_youtube_oauth_is_configured( $cfg ) ) return '';
    $cached = get_transient( 'antiohia_youtube_oauth_access_token' );
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
    set_transient( 'antiohia_youtube_oauth_access_token', $json['access_token'], $ttl );
    return $json['access_token'];
}

function kp_antiohia_youtube_api_caption_tracks( $video_id, $cfg ) {
    $token = kp_antiohia_youtube_oauth_access_token( $cfg );
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
        error_log( '[antiohia][oauth] captions.list wp_error: ' . $resp->get_error_message() );
        return array();
    }
    $code = wp_remote_retrieve_response_code( $resp );
    if ( $code < 200 || $code >= 300 ) {
        error_log( '[antiohia][oauth] captions.list HTTP ' . $code . ' body=' . substr( wp_remote_retrieve_body( $resp ), 0, 300 ) );
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

function kp_antiohia_fetch_youtube_transcript_oauth( $video_id, $preferred_lang, $cfg ) {
    $tracks = kp_antiohia_youtube_api_caption_tracks( $video_id, $cfg );
    if ( empty( $tracks ) ) return array();

    $preferred_lang = strtolower( $preferred_lang );
    $ordered = array();
    foreach ( $tracks as $tr ) if ( strpos( strtolower( $tr['lang'] ), $preferred_lang ) === 0 && strtoupper( $tr['kind'] ) !== 'ASR' ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( strpos( strtolower( $tr['lang'] ), 'en' ) === 0 && strtoupper( $tr['kind'] ) !== 'ASR' && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( strtoupper( $tr['kind'] ) !== 'ASR' && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( strpos( strtolower( $tr['lang'] ), $preferred_lang ) === 0 && ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;
    foreach ( $tracks as $tr ) if ( ! in_array( $tr, $ordered, true ) ) $ordered[] = $tr;

    $token = kp_antiohia_youtube_oauth_access_token( $cfg );
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
        $segments = kp_antiohia_parse_srt_captions( $body );
        if ( ! empty( $segments ) ) return $segments;
    }
    return array();
}

/**
 * Scrape the YouTube watch page to discover available caption tracks.
 * Returns array of [ 'lang', 'name', 'kind' ('asr'|''), 'baseUrl', 'translatable' ].
 */
function kp_antiohia_discover_caption_tracks( $video_id ) {
    // Strategy 1: youtubei/v1/player using ANDROID client — most reliable on
    // server IPs (no PoToken / consent wall). Web client is often blocked.
    // Order: IOS first (best track-discovery success rate in 2025), then ANDROID, then WEB.
    $tracks = kp_antiohia_discover_caption_tracks_innertube( $video_id, 'IOS' );
    if ( ! empty( $tracks ) ) return $tracks;
    $tracks = kp_antiohia_discover_caption_tracks_innertube( $video_id, 'ANDROID' );
    if ( ! empty( $tracks ) ) return $tracks;
    $tracks = kp_antiohia_discover_caption_tracks_innertube( $video_id, 'WEB' );
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

    return kp_antiohia_extract_caption_tracks_from_html( $html );
}

/**
 * Robust extraction of caption tracks from a YouTube watch-page HTML blob.
 * Tries (1) a direct regex on the "captionTracks":[...] array (handles
 * unicode-escaped baseUrls like \u0026), then (2) ytInitialPlayerResponse JSON.
 */
function kp_antiohia_extract_caption_tracks_from_html( $html ) {
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
function kp_antiohia_discover_caption_tracks_innertube( $video_id, $client = 'ANDROID' ) {
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
        error_log( '[Antiohia][innertube:' . $client . '] wp_error: ' . $resp->get_error_message() );
        return array();
    }
    $http_code = wp_remote_retrieve_response_code( $resp );
    if ( $http_code < 200 || $http_code >= 300 ) {
        error_log( '[Antiohia][innertube:' . $client . '] HTTP ' . $http_code );
        return array();
    }
    $body = wp_remote_retrieve_body( $resp );
    if ( ! $body ) return array();
    $json = json_decode( $body, true );
    if ( ! is_array( $json ) ) return array();
    $play_status = isset( $json['playabilityStatus']['status'] ) ? $json['playabilityStatus']['status'] : '';
    if ( $play_status && $play_status !== 'OK' ) {
        $reason = isset( $json['playabilityStatus']['reason'] ) ? $json['playabilityStatus']['reason'] : '';
        error_log( '[Antiohia][innertube:' . $client . '] playability=' . $play_status . ' reason=' . $reason );
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

function kp_antiohia_parse_timedtext_json( $body ) {
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

function kp_antiohia_parse_timedtext_xml( $xml_body ) {
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

function kp_antiohia_parse_srt_captions( $body ) {
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

function kp_antiohia_render_transcript_block( $segments, $mode = 'plain' ) {
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
        $html  = '<div class="antiohia-transcript-plain" style="margin-top:24px;">';
        $html .= '<h3 style="margin:0 0 12px 0;font-size:18px;font-weight:600;color:#1a1a1a;">Transcriere</h3>';
        $html .= '<div class="antiohia-transcript-body" style="line-height:1.7;color:#333;">';
        foreach ( $paragraphs as $p ) {
            $html .= '<p>' . esc_html( $p['text'] ) . '</p>';
        }
        $html .= '</div></div>';
        return $html;
    }

    // Default: details (collapsible)
    $html  = '<details class="antiohia-transcript" style="margin-top:24px;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;background:#fafafa;">';
    $html .= '<summary style="cursor:pointer;font-weight:600;color:#1a1a1a;list-style:none;">Transcriere</summary>';
    $html .= '<div class="antiohia-transcript-body" style="margin-top:12px;line-height:1.7;color:#333;">';
    foreach ( $paragraphs as $p ) {
        $html .= '<p><span class="antiohia-ts" style="color:#9ca3af;font-size:12px;font-family:monospace;margin-right:8px;">[' . esc_html( $fmt( $p['start'] ) ) . ']</span>' . esc_html( $p['text'] ) . '</p>';
    }
    $html .= '</div></details>';
    return $html;
}
