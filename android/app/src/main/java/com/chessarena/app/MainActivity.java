package com.chessarena.app;

import android.Manifest;
import android.accounts.Account;
import android.accounts.AccountManager;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.AppCompatButton;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.Locale;

public class MainActivity extends AppCompatActivity implements TextToSpeech.OnInitListener {

    private static final String APP_URL = "https://chess-arena-three-indol.vercel.app";
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int RC_CHOOSE_GOOGLE_ACCOUNT = 2002;

    private WebView webView;
    private View splashOverlay;
    private TextView splashStatusText;
    private TextView splashQuoteText;
    private AppCompatButton splashRetryButton;

    private PermissionRequest pendingPermissionRequest;
    private TextToSpeech textToSpeech;
    private boolean isTtsInitialized = false;
    private boolean isAppLoaded = false;

    private Handler statusHandler;
    private Runnable statusRunnable;
    private int statusIndex = 0;

    private final String[] statusMessages = {
        "⚔️ Setting up tournament board...",
        "♟️ Preparing pieces and clock...",
        "🧠 Initializing Stockfish engine...",
        "👑 Entering the Arena..."
    };

    private final String[] quoteMessages = {
        "\"Every pawn is a potential queen.\" — Proverb",
        "\"Tactics is knowing what to do when there is something to do.\" — Tartakower",
        "\"The move is there, but you must see it.\" — Tartakower",
        "\"Play the opening like a book, the endgame like a machine.\" — Spielmann"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Clean white luxury status bar & navigation bar for initial cold launch splash
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#FFFFFF"));
        window.setNavigationBarColor(Color.parseColor("#FFFFFF"));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            View decor = window.getDecorView();
            decor.setSystemUiVisibility(decor.getSystemUiVisibility() | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }

        // Inflate layout containing WebView and native instant splash overlay
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        splashOverlay = findViewById(R.id.splashOverlay);
        splashStatusText = findViewById(R.id.splashStatusText);
        splashQuoteText = findViewById(R.id.splashQuoteText);
        splashRetryButton = findViewById(R.id.splashRetryButton);

        // Connect SplashChessboardView opening moves to live status text
        SplashChessboardView splashChessboard = findViewById(R.id.splashChessboard);
        if (splashChessboard != null) {
            splashChessboard.setOnMoveListener((notation, description) -> {
                runOnUiThread(() -> {
                    if (splashStatusText != null && !isAppLoaded) {
                        splashStatusText.setText("⚔️ " + notation + " • " + description);
                    }
                });
            });
        }

        // Initialize Native Android Text-To-Speech engine
        initTextToSpeech();

        // Setup dynamic status rotator and retry trigger
        initSplashController();

        configureWebView();
        // NOTE: Permissions are requested politely 4 seconds after home screen opens, never during splash!

        Intent startIntent = getIntent();
        Uri startData = startIntent != null ? startIntent.getData() : null;
        if (startData != null && (startData.toString().startsWith("http://") || startData.toString().startsWith("https://"))) {
            webView.loadUrl(startData.toString());
        } else if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.getData() != null && webView != null) {
            Uri data = intent.getData();
            if (data != null && (data.toString().startsWith("http://") || data.toString().startsWith("https://"))) {
                webView.loadUrl(data.toString());
            }
        }
    }

    private void initSplashController() {
        if (splashRetryButton != null) {
            splashRetryButton.setOnClickListener(v -> {
                splashRetryButton.setVisibility(View.GONE);
                if (splashStatusText != null) {
                    splashStatusText.setText("Reconnecting to Arena...");
                }
                if (webView != null) {
                    webView.reload();
                }
            });
        }

        // Cycle status messages smoothly every 1300ms
        statusHandler = new Handler(Looper.getMainLooper());
        statusRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isAppLoaded) {
                    statusIndex = (statusIndex + 1) % statusMessages.length;
                    if (splashStatusText != null) {
                        splashStatusText.setText(statusMessages[statusIndex]);
                    }
                    if (splashQuoteText != null && statusIndex < quoteMessages.length) {
                        splashQuoteText.setText(quoteMessages[statusIndex]);
                    }
                    if (statusHandler != null) {
                        statusHandler.postDelayed(this, 1300);
                    }
                }
            }
        };
        statusHandler.postDelayed(statusRunnable, 1300);

        if (splashOverlay != null) {
            splashOverlay.setOnClickListener(v -> hideSplashScreen());
        }

        // Fallback safety: if loading takes longer than 9 seconds, offer tap to retry
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (!isAppLoaded) {
                if (splashRetryButton != null) {
                    splashRetryButton.setVisibility(View.VISIBLE);
                }
                if (splashStatusText != null) {
                    splashStatusText.setText("Connecting taking longer than usual... Tap to retry");
                }
            }
        }, 9000);
    }

    public void hideSplashScreen() {
        if (isAppLoaded || splashOverlay == null) return;
        isAppLoaded = true;

        if (statusHandler != null && statusRunnable != null) {
            statusHandler.removeCallbacks(statusRunnable);
        }

        // Silky 400ms alpha fade-out into the already-rendered home screen
        splashOverlay.animate()
            .alpha(0f)
            .setDuration(400)
            .withEndAction(() -> {
                if (splashOverlay != null) {
                    splashOverlay.setVisibility(View.GONE);
                }
                // Smoothly transition status bar and navigation bar to app's dark luxury theme
                try {
                    Window window = getWindow();
                    window.setStatusBarColor(Color.parseColor("#070b19"));
                    window.setNavigationBarColor(Color.parseColor("#070b19"));
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        View decor = window.getDecorView();
                        decor.setSystemUiVisibility(decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
                    }
                } catch (Exception ignored) {}

                // Politely request permissions 4 seconds AFTER app is completely open and user is on home screen
                new Handler(Looper.getMainLooper()).postDelayed(MainActivity.this::checkAndRequestPermissions, 4000);
            })
            .start();
    }

    private void initTextToSpeech() {
        try {
            textToSpeech = new TextToSpeech(getApplicationContext(), this);
        } catch (Exception e) {
            isTtsInitialized = false;
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && textToSpeech != null) {
            try {
                int langResult = textToSpeech.setLanguage(Locale.US);
                if (langResult == TextToSpeech.LANG_MISSING_DATA || langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                    langResult = textToSpeech.setLanguage(Locale.ENGLISH);
                    if (langResult == TextToSpeech.LANG_MISSING_DATA || langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                        textToSpeech.setLanguage(Locale.getDefault());
                    }
                }
                textToSpeech.setSpeechRate(1.0f);
                textToSpeech.setPitch(1.05f);

                textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String utteranceId) {
                        runOnUiThread(() -> {
                            if (webView != null) {
                                webView.evaluateJavascript(
                                    "window.__nativeTtsOnStart && window.__nativeTtsOnStart('" + utteranceId + "');",
                                    null
                                );
                            }
                        });
                    }

                    @Override
                    public void onDone(String utteranceId) {
                        runOnUiThread(() -> {
                            if (webView != null) {
                                webView.evaluateJavascript(
                                    "window.__nativeTtsOnDone && window.__nativeTtsOnDone('" + utteranceId + "');",
                                    null
                                );
                            }
                        });
                    }

                    @Override
                    public void onError(String utteranceId) {
                        runOnUiThread(() -> {
                            if (webView != null) {
                                webView.evaluateJavascript(
                                    "window.__nativeTtsOnError && window.__nativeTtsOnError('" + utteranceId + "');",
                                    null
                                );
                            }
                        });
                    }
                });

                isTtsInitialized = true;
                runOnUiThread(() -> {
                    if (webView != null) {
                        webView.evaluateJavascript("window.__nativeTtsReady && window.__nativeTtsReady();", null);
                    }
                });
            } catch (Exception e) {
                isTtsInitialized = false;
            }
        } else {
            isTtsInitialized = false;
        }
    }

    // JavaScript Bridge interface exposed to WebView as window.AndroidBridge
    public class AndroidBridge {
        @JavascriptInterface
        public void onAppReady() {
            runOnUiThread(MainActivity.this::hideSplashScreen);
        }

        @JavascriptInterface
        public boolean openGoogleAccountPicker() {
            try {
                Intent intent = AccountManager.newChooseAccountIntent(
                        null,
                        null,
                        new String[]{"com.google"},
                        null,
                        null,
                        null,
                        null
                );
                startActivityForResult(intent, RC_CHOOSE_GOOGLE_ACCOUNT);
                return true;
            } catch (ActivityNotFoundException e) {
                return false;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public boolean share(String title, String text, String url) {
            try {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_SUBJECT, title != null ? title : "Chess Arena");
                String content = (text != null ? text + " " : "") + (url != null ? url : "");
                intent.putExtra(Intent.EXTRA_TEXT, content.trim());
                Intent chooser = Intent.createChooser(intent, title != null ? title : "Share with Friends");
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(chooser);
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public boolean copyToClipboard(String text) {
            try {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (clipboard != null && text != null) {
                    ClipData clip = ClipData.newPlainText("Chess Arena", text);
                    clipboard.setPrimaryClip(clip);
                    return true;
                }
            } catch (Exception ignored) {}
            return false;
        }

        @JavascriptInterface
        public void vibrate(long milliseconds) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    long duration = Math.max(5, Math.min(milliseconds, 500));
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(duration);
                    }
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public boolean isAndroidApp() {
            return true;
        }

        @JavascriptInterface
        public String getAppVersion() {
            return "1.0.0";
        }
    }

    // JavaScript Bridge interface exposed to WebView as window.AndroidTTS
    public class AndroidTTSBridge {
        @JavascriptInterface
        public boolean isAvailable() {
            return isTtsInitialized && textToSpeech != null;
        }

        @JavascriptInterface
        public void onAppReady() {
            runOnUiThread(MainActivity.this::hideSplashScreen);
        }

        @JavascriptInterface
        public boolean speak(String text) {
            return speakWithRate(text, 1.0f, 1.05f);
        }

        @JavascriptInterface
        public boolean speakWithRate(String text, float rate, float pitch) {
            if (text == null || text.trim().isEmpty()) return false;
            if (textToSpeech != null && isTtsInitialized) {
                try {
                    textToSpeech.setSpeechRate(rate > 0 ? rate : 1.0f);
                    textToSpeech.setPitch(pitch > 0 ? pitch : 1.05f);
                    String utteranceId = "sensei_" + System.currentTimeMillis();
                    int res;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        Bundle params = new Bundle();
                        params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);
                        res = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
                    } else {
                        java.util.HashMap<String, String> map = new java.util.HashMap<>();
                        map.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
                        res = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, map);
                    }
                    return res == TextToSpeech.SUCCESS;
                } catch (Exception e) {
                    return false;
                }
            } else if (!isTtsInitialized && textToSpeech == null) {
                initTextToSpeech();
            }
            return false;
        }

        @JavascriptInterface
        public void stop() {
            if (textToSpeech != null) {
                try {
                    textToSpeech.stop();
                } catch (Exception ignored) {}
            }
        }
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // Enable popup and multi-window support for Google Sign-In & OAuth
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);

        // Standard mobile Chrome user agent to allow Google Auth and all web capabilities
        String defaultUa = settings.getUserAgentString();
        if (defaultUa != null) {
            String cleanUa = defaultUa.replace("; wv", "").replaceAll("Version/[0-9.]+\\s*", "");
            settings.setUserAgentString(cleanUa);
        }

        // Cookies and cross-site cookies for OAuth
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // Expose JavaScript bridges
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
        webView.addJavascriptInterface(new AndroidTTSBridge(), "AndroidTTS");

        // Handle file and PGN downloads
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setData(Uri.parse(url));
                startActivity(i);
            } catch (Exception ignored) {}
        });

        // Performance & background: white background matches splash so there is zero black flash
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setBackgroundColor(Color.WHITE);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // NOTE: Splash overlay remains visible and smoothly crossfades ONLY when React signals onAppReady()!
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    runOnUiThread(() -> {
                        if (splashRetryButton != null) {
                            splashRetryButton.setVisibility(View.VISIBLE);
                        }
                        if (splashStatusText != null) {
                            splashStatusText.setText("Unable to connect. Tap retry below.");
                        }
                    });
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    // Stay inside WebView for app and Firebase OAuth authentication domains
                    if (url.contains("chess-arena-three-indol.vercel.app") ||
                        url.contains("localhost") ||
                        url.contains("arena-e49f1.firebaseapp.com") ||
                        url.contains("accounts.google.com") ||
                        url.contains("firebaseapp.com")) {
                        return false;
                    }
                }

                // External intents (e.g. WhatsApp, Telegram, share links)
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                WebView newWebView = new WebView(view.getContext());
                WebSettings newSettings = newWebView.getSettings();
                newSettings.setJavaScriptEnabled(true);
                newSettings.setDomStorageEnabled(true);
                newSettings.setSupportMultipleWindows(true);
                newSettings.setJavaScriptCanOpenWindowsAutomatically(true);

                CookieManager.getInstance().setAcceptThirdPartyCookies(newWebView, true);

                newWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                        String u = req.getUrl().toString();
                        if (u.contains("chess-arena-three-indol.vercel.app") ||
                            u.contains("accounts.google.com") ||
                            u.contains("firebaseapp.com")) {
                            return false;
                        }
                        return false;
                    }
                });

                ((WebView.WebViewTransport) resultMsg.obj).setWebView(newWebView);
                resultMsg.sendToTarget();
                return true;
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // Grant microphone and audio capture for WebRTC voice calls
                for (String res : request.getResources()) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) {
                        pendingPermissionRequest = request;
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                                == PackageManager.PERMISSION_GRANTED) {
                            request.grant(request.getResources());
                            pendingPermissionRequest = null;
                        } else {
                            ActivityCompat.requestPermissions(
                                    MainActivity.this,
                                    new String[]{Manifest.permission.RECORD_AUDIO},
                                    PERMISSION_REQUEST_CODE
                            );
                        }
                        return;
                    }
                }
                request.grant(request.getResources());
            }
        });
    }

    private void checkAndRequestPermissions() {
        if (isFinishing() || isDestroyed()) return;
        java.util.List<String> neededPermissions = new java.util.ArrayList<>();

        // 1. Audio Recording for in-game WebRTC voice chat
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.RECORD_AUDIO);
        }

        // 2. Notifications for game challenges & match alerts (Android 13+ / API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!neededPermissions.isEmpty()) {
            ActivityCompat.requestPermissions(
                    this,
                    neededPermissions.toArray(new String[0]),
                    PERMISSION_REQUEST_CODE
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.grant(pendingPermissionRequest.getResources());
                    pendingPermissionRequest = null;
                }
            } else {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.deny();
                    pendingPermissionRequest = null;
                }
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_CHOOSE_GOOGLE_ACCOUNT) {
            if (resultCode == RESULT_OK && data != null) {
                String accountName = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
                if (accountName != null && !accountName.trim().isEmpty()) {
                    final String safeEmail = accountName.trim().replace("'", "\\'");
                    runOnUiThread(() -> {
                        if (webView != null) {
                            webView.evaluateJavascript(
                                    "window.__onNativeGoogleAccountSelected && window.__onNativeGoogleAccountSelected('" + safeEmail + "');",
                                    null
                            );
                        }
                    });
                }
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                "(function() { if (window.__onAndroidBackPressed && window.__onAndroidBackPressed()) { return true; } return false; })()",
                value -> {
                    if (!"true".equals(value)) {
                        runOnUiThread(() -> {
                            if (webView.canGoBack()) {
                                webView.goBack();
                            } else {
                                super.onBackPressed();
                            }
                        });
                    }
                }
            );
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
            webView.evaluateJavascript("if (typeof window !== 'undefined' && window.__onAppBackgrounded) { window.__onAppBackgrounded(); }", null);
        }
        if (textToSpeech != null && textToSpeech.isSpeaking()) {
            try { textToSpeech.stop(); } catch (Exception ignored) {}
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
            webView.evaluateJavascript("if (typeof window !== 'undefined' && window.__onAppForegrounded) { window.__onAppForegrounded(); }", null);
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
            webView.evaluateJavascript("if (typeof window !== 'undefined' && window.__onAppBackgrounded) { window.__onAppBackgrounded(); }", null);
        }
        if (textToSpeech != null && textToSpeech.isSpeaking()) {
            try { textToSpeech.stop(); } catch (Exception ignored) {}
        }
    }

    @Override
    protected void onDestroy() {
        if (statusHandler != null && statusRunnable != null) {
            statusHandler.removeCallbacks(statusRunnable);
        }
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
                textToSpeech.shutdown();
            } catch (Exception ignored) {}
        }
        if (webView != null) {
            try {
                webView.evaluateJavascript("if (typeof window !== 'undefined' && window.__onAppBackgrounded) { window.__onAppBackgrounded(); }", null);
            } catch (Exception ignored) {}
            webView.destroy();
        }
        super.onDestroy();
    }
}
