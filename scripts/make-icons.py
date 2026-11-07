# Store icon: a red disc with a white bar. CWS wants 96 px of art inside a 128 px canvas.
from PIL import Image, ImageDraw

RED, WHITE, S = (185, 28, 28, 255), (229, 229, 229, 255), 8  # draw at 8x, then shrink for clean edges

for size, art in [(128, 96), (48, 44), (16, 16)]:
    big, a = size * S, art * S
    img = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    o = (big - a) // 2
    d.ellipse([o, o, o + a, o + a], fill=RED)
    bw, bh = a * 0.62, a * 0.18  # bar: 62% of the disc wide, 18% tall
    c = big / 2
    d.rounded_rectangle([c - bw / 2, c - bh / 2, c + bw / 2, c + bh / 2], radius=bh * 0.2, fill=WHITE)
    img.resize((size, size), Image.LANCZOS).save(f'icons/icon-{size}.png')
