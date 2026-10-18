# -*- coding: utf-8 -*-
"""Generate custom branded Arabic GIF explainers for the INSAF landing page.
Design system: bg #F8F9FA / surface #F0F2F5 / primary #0E5B34 / deep #0A4427 /
gold #C09A4A / gold-light #E3CD94 / ink #15241C / muted #6B7280 / border #E5E7EB.
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

ROOT = Path(__file__).parent
FONTS = ROOT / "fonts"
OUT = ROOT.parent / "public" / "gifs"
OUT.mkdir(parents=True, exist_ok=True)

# ---------- design tokens ----------
BG = "#F8F9FA"
SURFACE = "#F0F2F5"
CARD = "#FFFFFF"
BORDER = "#E5E7EB"
INK = "#15241C"
MUTED = "#6B7280"
PRIMARY = "#0E5B34"
PRIMARY_DEEP = "#0A4427"
GOLD = "#C09A4A"
GOLD_LIGHT = "#E3CD94"
CORAL = "#F2665C"

W = H = 600
FPS = 15
DUR = int(1000 / FPS)

def font(weight="Regular", size=24):
    return ImageFont.truetype(str(FONTS / f"IBMPlexSansArabic-{weight}.ttf"), size)

def ar(text: str) -> str:
    """Shape + bidi Arabic text for PIL."""
    return get_display(arabic_reshaper.reshape(text))

def rtext(draw, xy, text, fnt, fill, anchor="ra"):
    """Right-aligned Arabic text."""
    draw.text(xy, ar(text), font=fnt, fill=fill, anchor=anchor)

def ctext(draw, xy, text, fnt, fill, anchor="ma"):
    """Centered Arabic text."""
    draw.text(xy, ar(text), font=fnt, fill=fill, anchor=anchor)

def lerp(a, b, t):
    return a + (b - a) * t

def ease_out(t):
    return 1 - (1 - t) ** 3

def ease_in_out(t):
    return t * t * (3 - 2 * t)

def clamp01(t):
    return max(0.0, min(1.0, t))

def seg(i, start, end):
    """Progress of frame i within [start,end] -> 0..1 eased."""
    return clamp01((i - start) / max(1, (end - start)))

def base_canvas():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    return img, d

def draw_app_card(d, x0=40, y0=40, x1=560, y1=560, radius=36):
    # soft shadow
    for k, alpha in ((10, "#e9ebee"), (5, "#f1f3f5")):
        d.rounded_rectangle([x0 - k // 2, y0 + k, x1 + k // 2, y1 + k], radius + k // 2, fill=alpha)
    d.rounded_rectangle([x0, y0, x1, y1], radius, fill=CARD, outline=BORDER, width=2)
    # header bar
    d.rounded_rectangle([x0, y0, x1, y0 + 64], radius, fill=SURFACE)
    d.rectangle([x0, y0 + 40, x1, y0 + 64], fill=SURFACE)
    d.line([x0, y0 + 64, x1, y0 + 64], fill=BORDER, width=2)
    # window dots (left side)
    for j, c in enumerate((CORAL, GOLD, PRIMARY)):
        d.ellipse([x0 + 24 + j * 26, y0 + 26, x0 + 38 + j * 26, y0 + 40], fill=c)
    # brand on the right
    rtext(d, (x1 - 24, y0 + 33), "إنصاف", font("Bold", 24), PRIMARY, anchor="rm")

def draw_check(d, cx, cy, r, progress, color=PRIMARY, width=10):
    """Animated circle + check."""
    p = ease_out(progress)
    if p <= 0:
        return
    # circle arc
    arc_p = min(1.0, p * 1.6)
    d.arc([cx - r, cy - r, cx + r, cy + r], start=-90, end=-90 + 360 * arc_p, fill=color, width=width)
    if p > 0.55:
        cp = (p - 0.55) / 0.45
        # check mark from (cx-0.45r, cy) -> (cx-0.12r, cy+0.33r) -> (cx+0.5r, cy-0.35r)
        p1 = (cx - 0.45 * r, cy + 0.02 * r)
        p2 = (cx - 0.10 * r, cy + 0.36 * r)
        p3 = (cx + 0.52 * r, cy - 0.38 * r)
        if cp < 0.5:
            t = cp / 0.5
            d.line([p1, (lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t))], fill=color, width=width)
        else:
            t = (cp - 0.5) / 0.5
            d.line([p1, p2], fill=color, width=width)
            d.line([p2, (lerp(p2[0], p3[0], t), lerp(p2[1], p3[1], t))], fill=color, width=width)

def save_gif(frames, name):
    frames[0].save(
        OUT / name, save_all=True, append_images=frames[1:],
        duration=DUR, loop=0, optimize=True, disposal=2,
    )
    size = (OUT / name).stat().st_size / 1024
    print(f"{name}: {len(frames)} frames, {size:.0f} KB")

# =====================================================================
# GIF 1 — Register account (سجّل حسابك)
# =====================================================================
def gif_step1():
    N = 60
    frames = []
    name_txt = "محمد العتيبي"
    phone_txt = "0555 123 456"
    for i in range(N):
        img, d = base_canvas()
        draw_app_card(d)

        # section title
        p_title = ease_out(seg(i, 0, 8))
        ty = lerp(140, 118, p_title)
        ctext(d, (300, ty), "إنشاء حساب جديد", font("Bold", 30), INK)

        # input field 1
        p_f1 = ease_out(seg(i, 4, 12))
        f1y = lerp(210, 190, p_f1)
        d.rounded_rectangle([90, f1y, 510, f1y + 62], 16, fill=SURFACE if p_f1 < 1 else CARD,
                            outline=BORDER if i < 34 else PRIMARY, width=2)
        # typing name (frames 12..24)
        typed = seg(i, 12, 24)
        n_chars = int(len(name_txt) * typed)
        if n_chars > 0:
            rtext(d, (492, f1y + 35), name_txt[:n_chars] + ("|" if typed < 1 and i % 2 == 0 else ""), font("SemiBold", 20), INK, anchor="rm")
        # field 1 label above
        rtext(d, (492, f1y - 14), "الاسم الكامل", font("SemiBold", 15), INK, anchor="rm")

        # input field 2
        p_f2 = ease_out(seg(i, 8, 16))
        f2y = lerp(300, 282, p_f2)
        d.rounded_rectangle([90, f2y, 510, f2y + 62], 16, fill=CARD, outline=BORDER, width=2)
        rtext(d, (492, f2y - 14), "رقم الجوال", font("SemiBold", 15), INK, anchor="rm")
        typed2 = seg(i, 22, 32)
        n2 = int(len(phone_txt) * typed2)
        if n2 > 0:
            rtext(d, (492, f2y + 31 + 4), phone_txt[:n2] + ("|" if typed2 < 1 and i % 2 == 0 else ""), font("SemiBold", 20), INK, anchor="rm")

        # remove duplicate inner label drawn earlier (kept simple): label inside when empty
        if n_chars == 0:
            rtext(d, (492, f1y + 31), "مثال: محمد العتيبي", font("Regular", 18), "#9CA3AF", anchor="rm")
        if n2 == 0:
            rtext(d, (492, f2y + 31), "05xxxxxxxx", font("Regular", 18), "#9CA3AF", anchor="rm")

        # button
        p_btn = ease_out(seg(i, 30, 38))
        press = 1.0
        if 38 <= i < 42:
            press = 0.96 if i % 2 == 0 else 1.0
        bw, bh = 420 * p_btn, 58
        bx0, by0 = 300 - bw / 2, 380
        d.rounded_rectangle([bx0, by0, bx0 + bw, by0 + bh * press], 29, fill=PRIMARY if p_btn > 0.2 else SURFACE)
        if p_btn > 0.6:
            ctext(d, (300, by0 + 29), "إنشاء الحساب", font("SemiBold", 20), CARD)

        # success overlay
        if i >= 44:
            p = seg(i, 44, 54)
            ov = ease_out(p)
            d.rounded_rectangle([90, 460, 510, 540], 20, fill=PRIMARY)
            draw_check(d, 470, 500, 22, p, color=CARD, width=7)
            if ov > 0.4:
                rtext(d, (430, 500), "تم التسجيل بنجاح", font("Bold", 22), CARD, anchor="rm")
        frames.append(img)
    save_gif(frames, "step-1-register.gif")

# =====================================================================
# GIF 2 — Browse opportunities (تصفح الفرص)
# =====================================================================
def gif_step2():
    N = 60
    frames = []
    cards = [
        ("قضية تجارية — الرياض", "عائد متوقع 14%", 0.68),
        ("قضية عمالية — جدة", "عائد متوقع 16%", 0.45),
        ("قضية عقارية — الدمام", "عائد متوقع 12%", 0.82),
    ]
    for i in range(N):
        img, d = base_canvas()
        draw_app_card(d)
        ctext(d, (300, 112), "الفرص المتاحة", font("Bold", 28), INK)

        selected = 1
        for idx, (title, ret, prog) in enumerate(cards):
            p = ease_out(seg(i, 2 + idx * 4, 10 + idx * 4))
            y = 150 + idx * 108 + (1 - p) * 40
            sel_p = seg(i, 20, 28) if idx == selected else 0
            lift = 4 * ease_in_out(sel_p)
            y -= lift
            outline = PRIMARY if sel_p > 0.5 else BORDER
            ow = 3 if sel_p > 0.5 else 2
            d.rounded_rectangle([80, y, 520, y + 92], 20, fill=CARD, outline=outline, width=ow)
            # badge
            badge_p = p
            if badge_p > 0:
                d.rounded_rectangle([92, y + 18, 178, y + 48], 15, fill="#0E5B341A" if False else "#EAF3EE")
                ctext(d, (135, y + 33), "تجاري" if idx == 0 else ("عمالية" if idx == 1 else "عقارية"), font("SemiBold", 14), PRIMARY)
            rtext(d, (502, y + 30), title, font("SemiBold", 19), INK, anchor="rm")
            rtext(d, (502, y + 58), ret, font("Regular", 15), GOLD if idx == selected else MUTED, anchor="rm")
            # progress
            bar_p = seg(i, 26, 44) if idx == selected else 1.0
            fillw = 420 * prog * ease_in_out(bar_p)
            d.rounded_rectangle([90, y + 70, 510, y + 80], 5, fill=SURFACE)
            if fillw > 0:
                d.rounded_rectangle([510 - fillw, y + 70, 510, y + 80], 5, fill=PRIMARY if idx == selected else GOLD)
            pct = int(prog * 100 * ease_in_out(bar_p))
            ctext(d, (106, y + 62), f"{pct}%", font("Bold", 13), PRIMARY)

        # CTA button appears on selected card
        p_cta = ease_out(seg(i, 46, 54))
        if p_cta > 0:
            bw = 240 * p_cta
            d.rounded_rectangle([300 - bw / 2, 496, 300 + bw / 2, 546], 25, fill=PRIMARY)
            if p_cta > 0.7:
                ctext(d, (300, 521), "عرض التفاصيل", font("SemiBold", 19), CARD)
        frames.append(img)
    save_gif(frames, "step-2-browse.gif")

# =====================================================================
# GIF 3 — Invest & earn (استثمر واربح)
# =====================================================================
def gif_step3():
    N = 60
    frames = []
    for i in range(N):
        img, d = base_canvas()
        draw_app_card(d)
        ctext(d, (300, 112), "استثمر واربح", font("Bold", 28), INK)

        # amount card
        p_card = ease_out(seg(i, 0, 8))
        y0 = lerp(170, 150, p_card)
        d.rounded_rectangle([80, y0, 520, y0 + 110], 22, fill=SURFACE, outline=BORDER, width=2)
        rtext(d, (496, y0 + 34), "مبلغ الاستثمار", font("SemiBold", 16), MUTED, anchor="rm")
        # counter 0 -> 25,000
        amt_p = ease_in_out(seg(i, 6, 24))
        amt = int(25000 * amt_p)
        rtext(d, (496, y0 + 76), f"{amt:,} ر.س", font("Bold", 34), PRIMARY_DEEP, anchor="rm")

        # funding progress
        p_lbl = seg(i, 22, 30)
        if p_lbl > 0:
            rtext(d, (496, 312), "اكتمال التمويل", font("SemiBold", 16), INK, anchor="rm")
        prog = 0.35 + 0.65 * ease_in_out(seg(i, 26, 46))
        d.rounded_rectangle([80, 330, 520, 354], 12, fill=SURFACE)
        fillw = 440 * prog
        d.rounded_rectangle([520 - fillw, 330, 520, 354], 12, fill=PRIMARY)
        ctext(d, (98, 342), f"{int(prog*100)}%", font("Bold", 14), CARD if prog > 0.12 else PRIMARY)

        # returns chip
        p_ret = ease_out(seg(i, 40, 50))
        if p_ret > 0:
            w_ = 300 * p_ret
            d.rounded_rectangle([300 - w_ / 2, 384, 300 + w_ / 2, 436], 26, fill=GOLD)
            if p_ret > 0.7:
                ctext(d, (300, 410), "العائد المتوقع +16%", font("Bold", 20), "#3d2f10")

        # coins burst
        burst = seg(i, 44, 58)
        if burst > 0:
            for k in range(7):
                ang = -90 + (k - 3) * 22
                rad = math.radians(ang)
                dist = 90 * ease_out(burst)
                cx = 300 + math.cos(rad) * dist
                cy = 480 - math.sin(rad) * dist * 0.55
                r = 13 + (k % 3) * 3
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOLD, outline=PRIMARY_DEEP, width=2)
                d.ellipse([cx - r / 2.4, cy - r / 2.4, cx + r / 2.4, cy + r / 2.4], outline=GOLD_LIGHT, width=2)
        # success check bottom
        if i >= 50:
            p = seg(i, 50, 58)
            d.rounded_rectangle([150, 496, 450, 548], 26, fill=PRIMARY)
            draw_check(d, 416, 522, 16, p, color=CARD, width=6)
            if p > 0.4:
                rtext(d, (392, 522), "تم الاستثمار", font("Bold", 19), CARD, anchor="rm")
        frames.append(img)
    save_gif(frames, "step-3-invest.gif")

if __name__ == "__main__":
    gif_step1()
    gif_step2()
    gif_step3()
