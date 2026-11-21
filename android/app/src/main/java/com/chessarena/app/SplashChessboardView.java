package com.chessarena.app;

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
import android.util.AttributeSet;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import androidx.annotation.Nullable;
import androidx.core.graphics.PathParser;

/**
 * SplashChessboardView
 * High-performance, hardware-accelerated tournament chessboard rendered natively.
 * Features Staunton vector chess pieces, Italian Game opening setup,
 * animated golden move highlights, coordinates, and luxury bevel styling.
 */
public class SplashChessboardView extends View {

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

    // Board position: Italian Game (1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5)
    // Ranks 8 down to 1 (indices 0 to 7), Files a to h (indices 0 to 7)
    private static final int[][] BOARD_PIECES = {
        { PIECE_ROOK, PIECE_NONE,   PIECE_BISHOP, PIECE_QUEEN, PIECE_KING, PIECE_BISHOP, PIECE_KNIGHT, PIECE_ROOK }, // rank 8 (Black)
        { PIECE_PAWN, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN,  PIECE_NONE, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN }, // rank 7
        { PIECE_NONE, PIECE_NONE,   PIECE_KNIGHT, PIECE_NONE,  PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE }, // rank 6 (Nc6)
        { PIECE_NONE, PIECE_NONE,   PIECE_BISHOP, PIECE_NONE,  PIECE_PAWN, PIECE_NONE,   PIECE_NONE,   PIECE_NONE }, // rank 5 (Bc5, e5)
        { PIECE_NONE, PIECE_NONE,   PIECE_BISHOP, PIECE_NONE,  PIECE_PAWN, PIECE_NONE,   PIECE_NONE,   PIECE_NONE }, // rank 4 (Bc4, e4)
        { PIECE_NONE, PIECE_NONE,   PIECE_NONE,   PIECE_NONE,  PIECE_NONE, PIECE_KNIGHT, PIECE_NONE,   PIECE_NONE }, // rank 3 (Nf3)
        { PIECE_PAWN, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN,  PIECE_NONE, PIECE_PAWN,   PIECE_PAWN,   PIECE_PAWN }, // rank 2 (White)
        { PIECE_ROOK, PIECE_KNIGHT, PIECE_NONE,   PIECE_QUEEN, PIECE_KING, PIECE_NONE,   PIECE_NONE,   PIECE_ROOK }  // rank 1
    };

    private static final int[][] BOARD_COLORS = {
        { COLOR_BLACK, COLOR_NONE,  COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK },
        { COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_BLACK, COLOR_NONE,  COLOR_BLACK, COLOR_BLACK, COLOR_BLACK },
        { COLOR_NONE,  COLOR_NONE,  COLOR_BLACK, COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE },
        { COLOR_NONE,  COLOR_NONE,  COLOR_BLACK, COLOR_NONE,  COLOR_BLACK, COLOR_NONE,  COLOR_NONE,  COLOR_NONE },
        { COLOR_NONE,  COLOR_NONE,  COLOR_WHITE, COLOR_NONE,  COLOR_WHITE, COLOR_NONE,  COLOR_NONE,  COLOR_NONE },
        { COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_NONE,  COLOR_WHITE, COLOR_NONE,  COLOR_NONE },
        { COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_NONE,  COLOR_WHITE, COLOR_WHITE, COLOR_WHITE },
        { COLOR_WHITE, COLOR_WHITE, COLOR_NONE,  COLOR_WHITE, COLOR_WHITE, COLOR_NONE,  COLOR_NONE,  COLOR_WHITE }
    };

    // Drawing paints
    private final Paint boardBorderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint lightSquarePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint darkSquarePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint highlightPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint whitePieceFillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint whitePieceStrokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint blackPieceFillPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint blackPieceStrokePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint goldAccentPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint coordTextPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint shadowPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    // Geometry & Paths
    private final RectF outerBorderRect = new RectF();
    private final RectF boardRect = new RectF();
    private final RectF squareRect = new RectF();
    private final Path[] parsedPaths = new Path[7];
    private final Matrix transformMatrix = new Matrix();

    // Pulse animation
    private ValueAnimator pulseAnimator;
    private float pulseValue = 0f;

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

    private void init() {
        // Parse piece paths
        try {
            parsedPaths[PIECE_PAWN] = PathParser.createPathFromPathData(SVG_PAWN);
            parsedPaths[PIECE_KNIGHT] = PathParser.createPathFromPathData(SVG_KNIGHT);
            parsedPaths[PIECE_BISHOP] = PathParser.createPathFromPathData(SVG_BISHOP);
            parsedPaths[PIECE_ROOK] = PathParser.createPathFromPathData(SVG_ROOK);
            parsedPaths[PIECE_QUEEN] = PathParser.createPathFromPathData(SVG_QUEEN);
            parsedPaths[PIECE_KING] = PathParser.createPathFromPathData(SVG_KING);
        } catch (Throwable ignored) {
            // Fallback will render simple glyphs if path parsing fails
        }

        // Configure paints
        boardBorderPaint.setStyle(Paint.Style.FILL);

        lightSquarePaint.setStyle(Paint.Style.FILL);
        lightSquarePaint.setColor(Color.parseColor("#F8FAFC")); // Crisp tournament porcelain ivory

        darkSquarePaint.setStyle(Paint.Style.FILL);
        darkSquarePaint.setColor(Color.parseColor("#475569")); // High-contrast clean tournament slate

        highlightPaint.setStyle(Paint.Style.FILL);

        goldAccentPaint.setStyle(Paint.Style.STROKE);
        goldAccentPaint.setColor(Color.parseColor("#F59E0B"));
        goldAccentPaint.setStrokeWidth(3.5f);

        whitePieceFillPaint.setStyle(Paint.Style.FILL);
        whitePieceFillPaint.setColor(Color.parseColor("#FFFFFF")); // Pure brilliant luminous ivory

        whitePieceStrokePaint.setStyle(Paint.Style.STROKE);
        whitePieceStrokePaint.setColor(Color.parseColor("#D97706")); // Warm royal amber-gold contour
        whitePieceStrokePaint.setStrokeWidth(2.5f);
        whitePieceStrokePaint.setStrokeCap(Paint.Cap.ROUND);
        whitePieceStrokePaint.setStrokeJoin(Paint.Join.ROUND);

        blackPieceFillPaint.setStyle(Paint.Style.FILL);
        blackPieceFillPaint.setColor(Color.parseColor("#E0F2FE")); // High-contrast radiant celestial ice / light silver-blue

        blackPieceStrokePaint.setStyle(Paint.Style.STROKE);
        blackPieceStrokePaint.setColor(Color.parseColor("#0284C7")); // Royal cyan-blue contour (no dark black blob)
        blackPieceStrokePaint.setStrokeWidth(2.5f);
        blackPieceStrokePaint.setStrokeCap(Paint.Cap.ROUND);
        blackPieceStrokePaint.setStrokeJoin(Paint.Join.ROUND);

        coordTextPaint.setColor(Color.parseColor("#CBD5E1"));
        coordTextPaint.setTextSize(22f);
        coordTextPaint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        coordTextPaint.setTextAlign(Paint.Align.CENTER);

        shadowPaint.setStyle(Paint.Style.FILL);
        shadowPaint.setColor(Color.parseColor("#50000000"));

        // Setup smooth pulsing animation
        pulseAnimator = ValueAnimator.ofFloat(0.2f, 0.75f);
        pulseAnimator.setDuration(1300);
        pulseAnimator.setRepeatMode(ValueAnimator.REVERSE);
        pulseAnimator.setRepeatCount(ValueAnimator.INFINITE);
        pulseAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        pulseAnimator.addUpdateListener(anim -> {
            pulseValue = (float) anim.getAnimatedValue();
            postInvalidateOnAnimation();
        });
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (pulseAnimator != null && !pulseAnimator.isRunning()) {
            pulseAnimator.start();
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        if (pulseAnimator != null) {
            pulseAnimator.cancel();
        }
        super.onDetachedFromWindow();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int height = MeasureSpec.getSize(heightMeasureSpec);
        // Keep board perfectly square, adapting to screen dimensions
        int size = Math.min(width, height);
        if (size <= 0) size = 300;
        setMeasuredDimension(size, size);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        float w = getWidth();
        float h = getHeight();
        if (w <= 0 || h <= 0) return;

        float padding = Math.min(w, h) * 0.035f;
        outerBorderRect.set(padding, padding, w - padding, h - padding);

        // 1. Draw outer luxury beveled board border
        boardBorderPaint.setShader(new LinearGradient(
            outerBorderRect.left, outerBorderRect.top,
            outerBorderRect.right, outerBorderRect.bottom,
            Color.parseColor("#0d1526"), Color.parseColor("#1e293b"),
            Shader.TileMode.CLAMP
        ));
        canvas.drawRoundRect(outerBorderRect, 20f, 20f, boardBorderPaint);

        // Gold rim around entire board frame
        canvas.drawRoundRect(outerBorderRect, 20f, 20f, goldAccentPaint);

        // 2. Inner chessboard area (with coordinate border)
        float coordMargin = Math.min(w, h) * 0.045f;
        boardRect.set(
            outerBorderRect.left + coordMargin,
            outerBorderRect.top + coordMargin,
            outerBorderRect.right - coordMargin,
            outerBorderRect.bottom - coordMargin
        );

        float sqSize = boardRect.width() / 8f;

        // 3. Draw 64 squares & pieces
        for (int r = 0; r < 8; r++) {
            for (int c = 0; c < 8; c++) {
                float left = boardRect.left + c * sqSize;
                float top = boardRect.top + r * sqSize;
                squareRect.set(left, top, left + sqSize, top + sqSize);

                // Base square color
                boolean isLight = (r + c) % 2 == 0;
                canvas.drawRect(squareRect, isLight ? lightSquarePaint : darkSquarePaint);

                // Highlight key tactical squares (Italian Game: e4, e5, c4, f3, c5, c6)
                if ((r == 4 && c == 4) || (r == 3 && c == 4) || (r == 5 && c == 5) || (r == 4 && c == 2)) {
                    int alpha = (int) (pulseValue * 220);
                    highlightPaint.setColor(Color.argb(alpha, 245, 158, 11)); // Amber gold pulse
                    canvas.drawRect(squareRect, highlightPaint);
                }

                // Draw piece on this square
                int piece = BOARD_PIECES[r][c];
                int color = BOARD_COLORS[r][c];
                if (piece != PIECE_NONE && color != COLOR_NONE) {
                    drawPiece(canvas, squareRect, piece, color == COLOR_WHITE);
                }
            }
        }

        // Subtle inner golden border around squares
        canvas.drawRect(boardRect, goldAccentPaint);

        // 4. File labels (a-h) on bottom border
        float textY = outerBorderRect.bottom - (coordMargin * 0.28f);
        String[] files = {"a", "b", "c", "d", "e", "f", "g", "h"};
        for (int c = 0; c < 8; c++) {
            float textX = boardRect.left + c * sqSize + (sqSize / 2f);
            canvas.drawText(files[c], textX, textY, coordTextPaint);
        }

        // Rank labels (1-8) on left border
        for (int r = 0; r < 8; r++) {
            float labelY = boardRect.top + r * sqSize + (sqSize * 0.62f);
            float labelX = outerBorderRect.left + (coordMargin * 0.5f);
            canvas.drawText(String.valueOf(8 - r), labelX, labelY, coordTextPaint);
        }
    }

    private void drawPiece(Canvas canvas, RectF square, int pieceType, boolean isWhite) {
        Path path = (pieceType >= 0 && pieceType < parsedPaths.length) ? parsedPaths[pieceType] : null;

        if (path != null) {
            // Staunton SVG path standard dimension is 45x45
            float scale = (square.width() * 0.78f) / 45f;
            float dx = square.left + (square.width() - 45f * scale) / 2f;
            float dy = square.top + (square.height() - 45f * scale) / 2f;

            canvas.save();
            transformMatrix.reset();
            transformMatrix.postScale(scale, scale);
            transformMatrix.postTranslate(dx, dy);
            canvas.concat(transformMatrix);

            // Piece drop shadow
            canvas.save();
            canvas.translate(1.5f, 2.5f);
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
            // Robust geometric fallback in case PathParser fails on legacy targets
            float cx = square.centerX();
            float cy = square.centerY();
            float radius = square.width() * 0.25f;

            Paint fill = isWhite ? whitePieceFillPaint : blackPieceFillPaint;
            Paint stroke = isWhite ? whitePieceStrokePaint : blackPieceStrokePaint;

            canvas.drawCircle(cx, cy, radius, fill);
            canvas.drawCircle(cx, cy, radius, stroke);
        }
    }
}
