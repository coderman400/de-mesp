from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from core.utils.pipeline import ValidationEngine
from pathlib import Path
import shutil
import os

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/process-file/")
def process_file(file: UploadFile = File(...)):
    # Check if the file is received
    if file is None:
        return {"error": "No file uploaded"}

    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    base = ValidationEngine(file_location)
    print(base.res)

    file_location = Path(f"outputs/{file.filename.split(".")[0]}.txt")
    print(file_location)
    print(file.filename)
    return FileResponse(str(file_location), media_type='application/octet-stream', filename=file_location.name)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)