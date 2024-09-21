from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import shutil
import os

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process-file/")
async def process_file(file: UploadFile = File(...)):
    # Check if the file is received
    if file is None:
        return {"error": "No file uploaded"}

    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process the file (you can modify this as needed)
    return FileResponse(file_location, media_type='application/octet-stream', filename=file.filename)
