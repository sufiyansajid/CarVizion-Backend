from pathlib import Path
import base64
import io
import os
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image, ImageOps
from transformers import pipeline


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="CarVizion SAM Service", version="0.1.0")


class RecolorRequest(BaseModel):
    image: str  # data URL or raw base64
    colors: Dict[str, str]


class RecolorResponse(BaseModel):
    resultImageUrl: str


_mask_generator = None


def get_mask_generator():
    global _mask_generator
    if _mask_generator is None:
        _mask_generator = pipeline("mask-generation", model="facebook/sam-vit-base")
    return _mask_generator


def _decode_image(data: str) -> Image.Image:
    if "," in data and data.strip().startswith("data:"):
        _, b64 = data.split(",", 1)
    else:
        b64 = data
    try:
        img_bytes = base64.b64decode(b64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {exc}") from exc

    try:
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {exc}") from exc

    return image


@app.post("/image/recolor", response_model=RecolorResponse)
def recolor_image(req: RecolorRequest):
    if not req.image:
        raise HTTPException(status_code=400, detail="image is required")

    image = _decode_image(req.image)

    if not req.colors:
        filename = "car_original.png"
        out_path = UPLOAD_DIR / filename
        image.save(out_path)
        return RecolorResponse(resultImageUrl=f"/uploads/{filename}")

    generator = get_mask_generator()
    masks = generator(image)
    if not masks:
        filename = "car_no_masks.png"
        out_path = UPLOAD_DIR / filename
        image.save(out_path)
        return RecolorResponse(resultImageUrl=f"/uploads/{filename}")

    def mask_area(segment) -> int:
        pil_mask: Optional[Image.Image] = segment.get("mask")
        if pil_mask is None:
            return 0
        gray = pil_mask.convert("L")
        histogram = gray.point(lambda v: 1 if v > 0 else 0).histogram()
        return histogram[1] if len(histogram) > 1 else 0

    body_color = req.colors.get("body")
    composed = image.copy()

    if body_color:
        largest = max(masks, key=mask_area)
        pil_mask = largest.get("mask")
        if pil_mask is not None:
            gray_mask = pil_mask.convert("L")
            colored = ImageOps.colorize(gray_mask, black="black", white=body_color)
            composed.paste(colored, mask=gray_mask)

    filename = f"car_recolored_{os.getpid()}.png"
    out_path = UPLOAD_DIR / filename
    composed.save(out_path)

    return RecolorResponse(resultImageUrl=f"/uploads/{filename}")


@app.get("/health")
def health():
    return {"status": "ok"}

