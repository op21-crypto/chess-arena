package com.chessarena.app;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import androidx.annotation.Nullable;
import androidx.core.graphics.PathParser;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * SplashChessboardView
 * Ultra-premium, hardware-accelerated tournament chessboard rendered natively.
 * Features:
 * - AMOLED Tournament Green & Cream luxury square colors
 * - Solid high-contrast ivory & obsidian Staunton pieces
 * - Realistic animated piece movements playing the Italian Game opening sequence
 * - Smooth slow-drifting floating chess silhouettes and ambient elements in the background
 */
public class SplashChessboardView extends View {

    public interface OnMoveListener {
        void onMovePlayed(String notation, String description);
    }

    private OnMoveListener onMoveListener;

    public void setOnMoveListener(OnMoveListener listener) {
        this.onMoveListener = listener;
    }

    // Piece types
    private static final int PIECE_NONE = 0;
    private static final int PIECE_PAWN = 1;
    private static final int PIECE_KNIGHT = 2;
    private static final int PIECE_BISHOP = 3;
    private static final int PIECE_ROOK = 4;
    private static final int PIECE_QUEEN = 5;
    private static final int PIECE_KING = 6;

    // Piece colors
    private static final int COLOR_NONE = 0;
    private static final int COLOR_WHITE = 1;
    private static final int COLOR_BLACK = 2;

    // SVG Path definitions (Staunton standard 45x45 viewBox)
    private static final String SVG_PAWN =
        "M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z";

    private static final String SVG_KNIGHT =
        "M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.95 1.23-1.5 1.5-1 0-2.06 1.15-2.5-.5-.45-1.69 1-3.69 2.5-4.5 2-1 3.5-3.5 3.5-6.5 0-2.8 1.5-5.5 3.5-7 2.5-2 5.5-2 7.5-1.5z";

    private static final String SVG_BISHOP =
        "M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z";

    private static final String SVG_ROOK =
        "M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5M34 14l-3 3H14l-3-3M31 17v12.5H14V17M31 29.5l1.5 2.5h-20l1.5-2.5M11 14h23";

    private static final String SVG_QUEEN =
        "M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-4-14-4.5 14-4.5-14-4 14-7-11 2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z";

    private static final String SVG_KING =
        "M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2-6 2s-3-2-5-2-4 2-5 3-3-3-5-3-5 2-5 2-2-3-6-2c-3 6 6 10.5 6 10.5v7z";

    // Standard starting position
    private static final int[][] INITIAL_PIECES = {
        { PIECE_ROOK, PIECE_KNIGHT, PIECE_BISHOP, PIECE_QUEEN, PIECE_KING, PIECE_BISHOP, PIECE_KNIGHT, PIECE_ROOK },
        { PIECE_PAWN, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN,  PIECE_PAWN, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN },
        { PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE,  PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE },
        { PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE,  PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE },
        { PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE,  PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE },
        { PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE,  PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE },
        { PIECE_PAWN, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN,  PIECE_PAWN, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN },
        { PIECE_ROOK, PIECE_KNIGHT, PIECE_BISHOP, PIECE_QUEEN, PIECE_KING, PIECE_BISHOP, PIECE_KNIGHT, PIECE_ROOK }
    };

    private static final int[][] INITIAL_COLORS = {
        { COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK },
        { COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK },
        { COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE },
        { COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE },
        { COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE },
        { COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE },
        { COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE },
        { COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE }
    };

    // Live mutable board state
    private final int[][] currentPieces = new int[8][8];
    private final int[][] currentColors = new int[8][8];

    // Move step model
    private static class MoveStep {
        final int fromR, fromC, toR, toC;
        final String notation;
        final String description;
        final boolean isCastle;
        final int rookFromR, rookFromC, rookToR, rookToC;

        MoveStep(int fr, int fc, int tr, int tc, String not, String desc) {
            this(fr, fc, tr, tc, not, desc, false, 0, 0, 0, 0);
        }

        MoveStep(int fr, int fc, int tr, int tc, String not, String desc, boolean isCastle, int rfr, int rfc, int rtr, int rtc) {
            this.fromR = fr; this.fromC = fc; this.toR = tr; this.toC = tc;
            this.notation = not; this.description = desc;
            this.isCastle = isCastle;
            this.rookFromR = rfr; this.rookFromC = rfc; this.rookToR = rtr; this.rookToC = rtc;
        }
    }

    // Italian Game (Giuoco Piano) Opening Sequence
    private static final MoveStep[] MOVES_ROSTER = {
        new MoveStep(6, 4, 4, 4, "1. e4", "King's Pawn Opening"),
        new MoveStep(1, 4, 3, 4, "1... e5", "Open Game Defense"),
        new MoveStep(7, 6, 5, 5, "2. Nf3", "Developing Knight & Attacking e5"),
        new MoveStep(0, 1, 2, 2, "2... Nc6", "Knight Defending Central Pawn"),
        new MoveStep(7, 5, 4, 2, "3. Bc4", "Italian Game • Classical Bishop"),
        new MoveStep(0, 5, 3, 2, "3... Bc5", "Giuoco Piano • Quiet Game"),
        new MoveStep(6, 2, 5, 2, "4. c3", "Preparing Central Breakthrough"),
        new MoveStep(0, 6, 2, 5, "4... Nf6", "Counter-Attacking White's e4"),
        new MoveStep(7, 4, 7, 6, "5. O-O", "Grandmaster Kingside Castling", true, 7, 7, 7, 5)
    };

    // Floating background particle model
    private static class FloatingParticle {
        float x, y;
        float vx, vy;
        float size;
        float rotation;
        float rotSpeed;
        float swayPhase;
        float swaySpeed;
        int color;
        int pieceType;
    }

    private final List<FloatingParticle> particles = new ArrayList<>();
    private final Random random = new Random();

    // Drawing paints
    private final Paint boardBorderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint lightSquarePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint darkSquarePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint highlightFromPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint highlightToPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint whitePieceFillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint whitePieceStrokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint blackPieceFillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint blackPieceStrokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint goldAccentPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint coordTextPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint shadowPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint particlePaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    // Geometry & Paths
    private final RectF outerBorderRect = new RectF();
    private final RectF boardRect = new RectF();
    private final RectF squareRect = new RectF();
    private final Path[] parsedPaths = new Path[7];
    private final Matrix transformMatrix = new Matrix();

    // Move animation state
    private int currentMoveIndex = 0;
    private boolean isPieceMoving = false;
    private float moveProgress = 0f;
    private MoveStep activeMove = null;
    private int movingPieceType = PIECE_NONE;
    private int movingPieceColor = COLOR_NONE;
    private int movingRookType = PIECE_NONE;
    private int movingRookColor = COLOR_NONE;

    private ValueAnimator moveAnimator;
    private final Handler moveHandler = new Handler(Looper.getMainLooper());
    private Runnable nextMoveRunnable;

    // Background continuous animation timer
    private ValueAnimator ambientLoopAnimator;

    public SplashChessboardView(Context context) {
        super(context);
        init();
    }

    public SplashChessboardView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public SplashChessboardView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void resetBoardToStart() {
        for (int r = 0; r < 8; r++) {
            System.arraycopy(INITIAL_PIECES[r], 0, currentPieces[r], 0, 8);
            System.arraycopy(INITIAL_COLORS[r], 0, currentColors[r], 0, 8);
        }
        currentMoveIndex = 0;
        isPieceMoving = false;
        activeMove = null;
    }

    private void init() {
        resetBoardToStart();

        // Parse piece paths
        try {
            parsedPaths[PIECE_PAWN] = PathParser.createPathFromPathData(SVG_PAWN);
            parsedPaths[PIECE_KNIGHT] = PathParser.createPathFromPathData(SVG_KNIGHT);
            parsedPaths[PIECE_BISHOP] = PathParser.createPathFromPathData(SVG_BISHOP);
            parsedPaths[PIECE_ROOK] = PathParser.createPathFromPathData(SVG_ROOK);
            parsedPaths[PIECE_QUEEN] = PathParser.createPathFromPathData(SVG_QUEEN);
            parsedPaths[PIECE_KING] = PathParser.createPathFromPathData(SVG_KING);
        } catch (Throwable ignored) {
            // Fallback geometric glyphs if SVG parsing unavailable
        }

        // Configure paints: AMOLED Tournament Green & Cream luxury color palette
        boardBorderPaint.setStyle(Paint.Style.FILL);

        // Light Squares: Crisp porcelain ivory tournament cream
        lightSquarePaint.setStyle(Paint.Style.FILL);
        lightSquarePaint.setColor(Color.parseColor("#F4F7EE"));

        // Dark Squares: Rich AMOLED luxury tournament green
        darkSquarePaint.setStyle(Paint.Style.FILL);
        darkSquarePaint.setColor(Color.parseColor("#2E6B3A"));

        // Move highlights
        highlightFromPaint.setStyle(Paint.Style.FILL);
        highlightFromPaint.setColor(Color.argb(90, 245, 158, 11)); // Soft amber glow on departure

        highlightToPaint.setStyle(Paint.Style.FILL);
        highlightToPaint.setColor(Color.argb(140, 245, 158, 11)); // Vibrant gold on landing

        // Outer gold bevel accent rim
        goldAccentPaint.setStyle(Paint.Style.STROKE);
        goldAccentPaint.setColor(Color.parseColor("#F59E0B"));
        goldAccentPaint.setStrokeWidth(3.5f);

        // White Pieces: Pure solid ivory white with crisp slate contour for razor-sharp definition
        whitePieceFillPaint.setStyle(Paint.Style.FILL);
        whitePieceFillPaint.setColor(Color.parseColor("#FFFFFF"));

        whitePieceStrokePaint.setStyle(Paint.Style.STROKE);
        whitePieceStrokePaint.setColor(Color.parseColor("#1E293B")); // Dark slate contour
        whitePieceStrokePaint.setStrokeWidth(2.2f);
        whitePieceStrokePaint.setStrokeCap(Paint.Cap.ROUND);
        whitePieceStrokePaint.setStrokeJoin(Paint.Join.ROUND);

        // Black Pieces: Deep AMOLED obsidian charcoal with crisp titanium silver-white contour
        blackPieceFillPaint.setStyle(Paint.Style.FILL);
        blackPieceFillPaint.setColor(Color.parseColor("#151E18"));

        blackPieceStrokePaint.setStyle(Paint.Style.STROKE);
        blackPieceStrokePaint.setColor(Color.parseColor("#F1F5F9")); // Titanium silver-white contour
        blackPieceStrokePaint.setStrokeWidth(2.2f);
        blackPieceStrokePaint.setStrokeCap(Paint.Cap.ROUND);
        blackPieceStrokePaint.setStrokeJoin(Paint.Join.ROUND);

        // Board Coordinates
        coordTextPaint.setColor(Color.parseColor("#FDE68A")); // Royal amber gold lettering
        coordTextPaint.setTextSize(22f);
        coordTextPaint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        coordTextPaint.setTextAlign(Paint.Align.CENTER);

        // Drop shadow for pieces
        shadowPaint.setStyle(Paint.Style.FILL);
        shadowPaint.setColor(Color.argb(80, 0, 0, 0));

        // Particle paint for background floating elements
        particlePaint.setStyle(Paint.Style.FILL);

        // Setup 12 ambient floating particles
        initParticles();

        // Ambient background animation loop (runs continuously at 60fps)
        ambientLoopAnimator = ValueAnimator.ofFloat(0f, 1f);
        ambientLoopAnimator.setDuration(1000);
        ambientLoopAnimator.setRepeatCount(ValueAnimator.INFINITE);
        ambientLoopAnimator.addUpdateListener(anim -> {
            updateParticles();
            postInvalidateOnAnimation();
        });

        // Initialize move sequence runner
        setupMoveRunner();
    }

    private void initParticles() {
        particles.clear();
        int[] palette = {
            Color.argb(20, 46, 107, 58),   // AMOLED Tournament green glow
            Color.argb(24, 245, 158, 11),  // Amber gold glow
            Color.argb(18, 56, 189, 248),  // Sky celestial blue glow
            Color.argb(16, 15, 23, 42)     // Slate dark silhouette
        };
        int[] pieces = {
            PIECE_KING, PIECE_QUEEN, PIECE_ROOK, PIECE_BISHOP, PIECE_KNIGHT, PIECE_PAWN
        };

        for (int i = 0; i < 14; i++) {
            FloatingParticle p = new FloatingParticle();
            p.x = random.nextFloat() * 1000f;
            p.y = random.nextFloat() * 1000f;
            p.vx = (random.nextFloat() - 0.5f) * 0.4f;
            p.vy = 0.35f + random.nextFloat() * 0.55f; // Gentle upward drift
            p.size = 28f + random.nextFloat() * 45f;
            p.rotation = random.nextFloat() * 360f;
            p.rotSpeed = (random.nextFloat() - 0.5f) * 0.35f;
            p.swayPhase = random.nextFloat() * (float) Math.PI * 2f;
            p.swaySpeed = 0.015f + random.nextFloat() * 0.02f;
            p.color = palette[random.nextInt(palette.length)];
            p.pieceType = pieces[random.nextInt(pieces.length)];
            particles.add(p);
        }
    }

    private void updateParticles() {
        float w = getWidth();
        float h = getHeight();
        if (w <= 0 || h <= 0) return;

        for (FloatingParticle p : particles) {
            p.y -= p.vy;
            p.swayPhase += p.swaySpeed;
            p.x += p.vx + (float) Math.sin(p.swayPhase) * 0.65f;
            p.rotation += p.rotSpeed;

            // Screen boundary wrap-around
            if (p.y < -p.size) {
                p.y = h + p.size;
                p.x = random.nextFloat() * w;
            }
            if (p.x < -p.size) {
                p.x = w + p.size;
            } else if (p.x > w + p.size) {
                p.x = -p.size;
            }
        }
    }

    private void setupMoveRunner() {
        nextMoveRunnable = new Runnable() {
            @Override
            public void run() {
                if (currentMoveIndex < MOVES_ROSTER.length) {
                    playMove(MOVES_ROSTER[currentMoveIndex]);
                } else {
                    // Sequence finished: brief pause, reset to opening board, and loop
                    moveHandler.postDelayed(() -> {
                        resetBoardToStart();
                        if (onMoveListener != null) {
                            onMoveListener.onMovePlayed("Setup", "Standard Starting Position");
                        }
                        postInvalidateOnAnimation();
                        moveHandler.postDelayed(nextMoveRunnable, 1400);
                    }, 2200);
                }
            }
        };
    }

    private void playMove(MoveStep move) {
        activeMove = move;
        movingPieceType = currentPieces[move.fromR][move.fromC];
        movingPieceColor = currentColors[move.fromR][move.fromC];

        // Lift piece off the starting square
        currentPieces[move.fromR][move.fromC] = PIECE_NONE;
        currentColors[move.fromR][move.fromC] = COLOR_NONE;

        if (move.isCastle) {
            movingRookType = currentPieces[move.rookFromR][move.rookFromC];
            movingRookColor = currentColors[move.rookFromR][move.rookFromC];
            currentPieces[move.rookFromR][move.rookFromC] = PIECE_NONE;
            currentColors[move.rookFromR][move.rookFromC] = COLOR_NONE;
        }

        isPieceMoving = true;

        if (onMoveListener != null) {
            onMoveListener.onMovePlayed(move.notation, move.description);
        }

        if (moveAnimator != null) {
            moveAnimator.cancel();
        }

        // Smooth parabolic glide: 750ms duration with organic easing
        moveAnimator = ValueAnimator.ofFloat(0f, 1f);
        moveAnimator.setDuration(750);
        moveAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        moveAnimator.addUpdateListener(anim -> {
            moveProgress = (float) anim.getAnimatedValue();
            postInvalidateOnAnimation();
        });
        moveAnimator.addListener(new AnimatorListenerAdapter() {
            @Override
            public void end(Animator animation) {
                // Land piece on destination square
                currentPieces[move.toR][move.toC] = movingPieceType;
                currentColors[move.toR][move.toC] = movingPieceColor;

                if (move.isCastle) {
                    currentPieces[move.rookToR][move.rookToC] = movingRookType;
                    currentColors[move.rookToR][move.rookToC] = movingRookColor;
                }

                isPieceMoving = false;
                currentMoveIndex++;
                postInvalidateOnAnimation();

                // Wait 1000ms before playing the next move in sequence
                moveHandler.postDelayed(nextMoveRunnable, 1000);
            }
        });
        moveAnimator.start();
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (ambientLoopAnimator != null && !ambientLoopAnimator.isRunning()) {
            ambientLoopAnimator.start();
        }
        // Start move sequence after initial settle delay
        moveHandler.postDelayed(nextMoveRunnable, 800);
    }

    @Override
    protected void onDetachedFromWindow() {
        if (ambientLoopAnimator != null) {
            ambientLoopAnimator.cancel();
        }
        if (moveAnimator != null) {
            moveAnimator.cancel();
        }
        moveHandler.removeCallbacksAndMessages(null);
        super.onDetachedFromWindow();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int height = MeasureSpec.getSize(heightMeasureSpec);
        // Fill full available space so ambient particles can drift around the central board
        if (width <= 0) width = 300;
        if (height <= 0) height = 300;
        setMeasuredDimension(width, height);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        float w = getWidth();
        float h = getHeight();
        if (w <= 0 || h <= 0) return;

        // 1. Draw smooth floating background particles
        drawAmbientBackground(canvas);

        // 2. Calculate centered chessboard geometry
        float boardSize = Math.min(w, h) * 0.94f;
        float boardLeft = (w - boardSize) / 2f;
        float boardTop = (h - boardSize) / 2f;
        outerBorderRect.set(boardLeft, boardTop, boardLeft + boardSize, boardTop + boardSize);

        // 3. Draw outer luxury beveled board frame (Deep AMOLED Forest Green)
        boardBorderPaint.setShader(new LinearGradient(
            outerBorderRect.left, outerBorderRect.top,
            outerBorderRect.right, outerBorderRect.bottom,
            Color.parseColor("#0A1C12"), Color.parseColor("#163924"),
            Shader.TileMode.CLAMP
        ));
        canvas.drawRoundRect(outerBorderRect, 22f, 22f, boardBorderPaint);

        // Outer gold accent rim
        canvas.drawRoundRect(outerBorderRect, 22f, 22f, goldAccentPaint);

        // 4. Inner chessboard coordinate margin & playing area
        float coordMargin = boardSize * 0.045f;
        boardRect.set(
            outerBorderRect.left + coordMargin,
            outerBorderRect.top + coordMargin,
            outerBorderRect.right - coordMargin,
            outerBorderRect.bottom - coordMargin
        );

        float sqSize = boardRect.width() / 8f;

        // 5. Draw 64 squares with move highlights
        for (int r = 0; r < 8; r++) {
            for (int c = 0; c < 8; c++) {
                float left = boardRect.left + c * sqSize;
                float top = boardRect.top + r * sqSize;
                squareRect.set(left, top, left + sqSize, top + sqSize);

                // Base square color
                boolean isLight = (r + c) % 2 == 0;
                canvas.drawRect(squareRect, isLight ? lightSquarePaint : darkSquarePaint);

                // Highlight active move squares
                if (activeMove != null) {
                    if (r == activeMove.fromR && c == activeMove.fromC) {
                        canvas.drawRect(squareRect, highlightFromPaint);
                    } else if (r == activeMove.toR && c == activeMove.toC) {
                        canvas.drawRect(squareRect, highlightToPaint);
                    }
                }

                // Draw stationary pieces
                int piece = currentPieces[r][c];
                int color = currentColors[r][c];
                if (piece != PIECE_NONE && color != COLOR_NONE) {
                    drawPieceAt(canvas, squareRect.left, squareRect.top, sqSize, piece, color == COLOR_WHITE, 0f);
                }
            }
        }

        // 6. Draw moving piece(s) smoothly gliding across the board with realistic parabolic lift
        if (isPieceMoving && activeMove != null && movingPieceType != PIECE_NONE) {
            float startX = boardRect.left + activeMove.fromC * sqSize;
            float startY = boardRect.top + activeMove.fromR * sqSize;
            float targetX = boardRect.left + activeMove.toC * sqSize;
            float targetY = boardRect.top + activeMove.toR * sqSize;

            float curX = (1f - moveProgress) * startX + moveProgress * targetX;
            float curY = (1f - moveProgress) * startY + moveProgress * targetY;

            // Parabolic lift arc: piece elevates as if picked up by hand
            float lift = (float) Math.sin(moveProgress * Math.PI) * (sqSize * 0.28f);

            drawPieceAt(canvas, curX, curY - lift, sqSize, movingPieceType, movingPieceColor == COLOR_WHITE, lift);

            // Handle castling rook movement
            if (activeMove.isCastle && movingRookType != PIECE_NONE) {
                float rStartX = boardRect.left + activeMove.rookFromC * sqSize;
                float rStartY = boardRect.top + activeMove.rookFromR * sqSize;
                float rTargetX = boardRect.left + activeMove.rookToC * sqSize;
                float rTargetY = boardRect.top + activeMove.rookToR * sqSize;

                float rCurX = (1f - moveProgress) * rStartX + moveProgress * rTargetX;
                float rCurY = (1f - moveProgress) * rStartY + moveProgress * rTargetY;

                drawPieceAt(canvas, rCurX, rCurY, sqSize, movingRookType, movingRookColor == COLOR_WHITE, 0f);
            }
        }

        // Inner gold border around squares
        canvas.drawRect(boardRect, goldAccentPaint);

        // 7. File labels (a-h) on bottom frame
        float textY = outerBorderRect.bottom - (coordMargin * 0.28f);
        String[] files = {"a", "b", "c", "d", "e", "f", "g", "h"};
        for (int c = 0; c < 8; c++) {
            float textX = boardRect.left + c * sqSize + (sqSize / 2f);
            canvas.drawText(files[c], textX, textY, coordTextPaint);
        }

        // Rank labels (1-8) on left frame
        for (int r = 0; r < 8; r++) {
            float labelY = boardRect.top + r * sqSize + (sqSize * 0.62f);
            float labelX = outerBorderRect.left + (coordMargin * 0.5f);
            canvas.drawText(String.valueOf(8 - r), labelX, labelY, coordTextPaint);
        }
    }

    private void drawAmbientBackground(Canvas canvas) {
        for (FloatingParticle p : particles) {
            Path path = (p.pieceType >= 0 && p.pieceType < parsedPaths.length) ? parsedPaths[p.pieceType] : null;
            if (path != null) {
                canvas.save();
                canvas.translate(p.x, p.y);
                canvas.rotate(p.rotation);

                float scale = p.size / 45f;
                canvas.scale(scale, scale);
                canvas.translate(-22.5f, -22.5f);

                particlePaint.setColor(p.color);
                canvas.drawPath(path, particlePaint);
                canvas.restore();
            }
        }
    }

    private void drawPieceAt(Canvas canvas, float left, float top, float sqSize, int pieceType, boolean isWhite, float lift) {
        Path path = (pieceType >= 0 && pieceType < parsedPaths.length) ? parsedPaths[pieceType] : null;

        if (path != null) {
            float scale = (sqSize * 0.78f) / 45f;
            float dx = left + (sqSize - 45f * scale) / 2f;
            float dy = top + (sqSize - 45f * scale) / 2f;

            canvas.save();
            transformMatrix.reset();
            transformMatrix.postScale(scale, scale);
            transformMatrix.postTranslate(dx, dy);
            canvas.concat(transformMatrix);

            // Piece drop shadow: scales and shifts when lifted
            canvas.save();
            float shadowOffset = 2.5f + (lift * 0.4f);
            canvas.translate(shadowOffset, shadowOffset * 1.5f);
            canvas.drawPath(path, shadowPaint);
            canvas.restore();

            // Piece body fill & stroke
            if (isWhite) {
                canvas.drawPath(path, whitePieceFillPaint);
                canvas.drawPath(path, whitePieceStrokePaint);
            } else {
                canvas.drawPath(path, blackPieceFillPaint);
                canvas.drawPath(path, blackPieceStrokePaint);
            }

            canvas.restore();
        } else {
            // Robust geometric fallback
            float cx = left + sqSize / 2f;
            float cy = top + sqSize / 2f;
            float radius = sqSize * 0.25f;

            Paint fill = isWhite ? whitePieceFillPaint : blackPieceFillPaint;
            Paint stroke = isWhite ? whitePieceStrokePaint : blackPieceStrokePaint;

            canvas.drawCircle(cx, cy, radius, fill);
            canvas.drawCircle(cx, cy, radius, stroke);
        }
    }
}
