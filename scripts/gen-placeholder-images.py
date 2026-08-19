#!/usr/bin/env python3
# Genereert nep-foto's en -schetsen (met wat lijnen/tekst) als base64 PNG's,
# puur om de PDF-preview realistisch te laten ogen (foto-achtige verhouding
# 4:3, schets-achtige brede/lage verhouding zoals de canvas in de app: 300px
# hoog, volle breedte).

import base64
import io
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent / "dummy-images.json"


def to_data_url(img, fmt="PNG"):
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    mime = "image/png" if fmt == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{b64}"


def maak_foto(label, kleur):
    w, h = 800, 600
    img = Image.new("RGB", (w, h), kleur)
    d = ImageDraw.Draw(img)
    for i in range(0, w, 40):
        d.line([(i, 0), (i, h)], fill=(255, 255, 255, 40), width=1)
    d.rectangle([20, 20, w - 20, h - 20], outline="white", width=4)
    d.text((40, h // 2 - 10), label, fill="white")
    return img


def maak_schets(label):
    w, h = 1200, 300
    img = Image.new("RGB", (w, h), "white")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w - 1, h - 1], outline="#B69148", width=3)
    d.line([(150, 60), (150, 240)], fill="black", width=3)
    d.line([(1050, 60), (1050, 240)], fill="black", width=3)
    d.line([(150, 240), (1050, 240)], fill="black", width=3)
    d.line([(150, 150), (1050, 150)], fill="#B69148", width=2)
    d.text((160, 100), f"{label} (schets-voorbeeld)", fill="black")
    return img


data = {
    "fotoAchterBuiten": to_data_url(maak_foto("Achtergevel buiten", "#4a6d8c")),
    "fotoAchterBinnen": to_data_url(maak_foto("Achtergevel binnen", "#6d4a8c")),
    "fotoKruipruimte": to_data_url(maak_foto("Kruipruimte", "#4a8c5f")),
    "fotoBereikbaarheid": to_data_url(maak_foto("Bereikbaarheid", "#8c6d4a")),
    "schetsMaatvoering": to_data_url(maak_schets("Maatvoering")),
    "schetsKozijn1": to_data_url(maak_schets("Kozijn 1")),
    "schetsKozijn2": to_data_url(maak_schets("Kozijn 2")),
    "schetsKozijn3": to_data_url(maak_schets("Kozijn 3")),
    "schetsEinstallatie": to_data_url(maak_schets("Elektra installatie")),
    "schetsWinstallatie": to_data_url(maak_schets("Water/CV installatie")),
}

OUT.write_text(json.dumps(data))
print(f"geschreven: {OUT} ({OUT.stat().st_size} bytes)")
