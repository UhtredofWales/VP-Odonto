from PIL import Image
im = Image.open("public/logo.png").convert("RGBA")
a = im.split()[3].point(lambda v: 255 if v > 40 else 0)
im = im.crop(a.getbbox())
w, h = im.size
alpha = im.split()[3]
grad = Image.new("RGBA", (w, h))
c0, c1 = (230, 207, 157), (156, 127, 70)
px = grad.load()
for y in range(h):
    for x in range(w):
        t = (x / w + y / h) / 2
        px[x, y] = tuple(int(c0[i] + (c1[i] - c0[i]) * t) for i in range(3)) + (255,)
grad.putalpha(alpha)
grad.save("public/logo-gold.png")