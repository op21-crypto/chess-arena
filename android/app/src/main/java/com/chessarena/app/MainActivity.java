package com.chessarena.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.util.Locale;

public class MainActivity extends AppCompatActivity implements TextToSpeech.OnInitListener {

    private static final String APP_URL = "https://chess-arena-three-indol.vercel.app";
    private static final int PERMISSION_REQUEST_CODE = 1001;

    private WebView webView;
    private PermissionRequest pendingPermissionRequest;
    private TextToSpeech textToSpeech;
    private boolean isTtsInitialized = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Dark immersive status bar & navigation bar
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#0c1b3d"));
        window.setNavigationBarColor(Color.parseColor("#0c1b3d"));

        // Initialize Native Android Text-To-Speech engine
        initTextToSpeech();

        webView = new WebView(this);
        setContentView(webView);

        configureWebView();
        checkAndRequestPermissions();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(APP_URL);
        }
    }

    private void initTextToSpeech() {
        try {
            textToSpeech = new TextToSpeech(this, this);
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
                    textToSpeech.setLanguage(Locale.getDefault());
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
            } catch (Exception e) {
                isTtsInitialized = false;
            }
        }
    }

    // JavaScript Bridge interface exposed to WebView as window.AndroidTTS
    public class AndroidTTSBridge {
        @JavascriptInterface
        public boolean isAvailable() {
            return isTtsInitialized && textToSpeech != null;
        }

        @JavascriptInterface
        public void speak(String text) {
            speakWithRate(text, 1.0f, 1.05f);
        }

        @JavascriptInterface
        public void speakWithRate(String text, float rate, float pitch) {
            if (text == null || text.trim().isEmpty()) return;
            if (textToSpeech != null && isTtsInitialized) {
                try {
                    textToSpeech.setSpeechRate(rate > 0 ? rate : 1.0f);
                    textToSpeech.setPitch(pitch > 0 ? pitch : 1.05f);
                    String utteranceId = "sensei_" + System.currentTimeMillis();
                    textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId);
                } catch (Exception e) {
                    // Fail silently or ignore
                }
            }
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
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);

        // Expose Native Android Text-To-Speech bridge to JavaScript
        webView.addJavascriptInterface(new AndroidTTSBridge(), "AndroidTTS");

        // Improve performance
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setBackgroundColor(Color.parseColor("#090d16"));

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    // Stay inside WebView if on the app domain
                    if (url.contains("chess-arena-three-indol.vercel.app") || url.contains("localhost")) {
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
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
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
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
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
    protected void onDestroy() {
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
                textToSpeech.shutdown();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}
