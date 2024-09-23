from fastapi import FastAPI, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse
from core.utils.pipeline import ValidationEngine
from pathlib import Path
import uuid
import shutil
import os

app = FastAPI()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = 'outputs'
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Function to clean up all files in the uploads and outputs directories
def clean_up_directories():
    print("(here)")
    try:
        # Clear all files from the UPLOAD_DIR
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        # Clear all files from the OUTPUT_DIR
        for filename in os.listdir(OUTPUT_DIR):
            file_path = os.path.join(OUTPUT_DIR, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
        print("Cleanup of uploads and outputs directories complete")
    except Exception as e:
        print(f"Error during cleanup: {str(e)}")

@app.post("/process-file/")
def process_file(file: UploadFile = File(...)):
    # Check if the file is received
    if file is None:
        return {"error": "No file uploaded"}

    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    base = ValidationEngine(file_location)
    headers = {
        "X-Validation-Status": "Success" if base.res else "Failure",
    }

    file_location = Path(f"outputs/{file.filename.split(".")[0]}.txt")
    print(file_location)
    print(file.filename)
    return FileResponse(str(file_location), media_type='application/octet-stream', filename=file_location.name)

@app.post("/process-files/")
async def process_files(
    background_tasks: BackgroundTasks,  # Add background tasks
    description: str = Form(...),
    imageFile: UploadFile = File(...),
    pdfFile: UploadFile = File(...),
):
    try:
        # Generate unique file names to avoid overwriting
        image_filename = f"{uuid.uuid4()}_{imageFile.filename}"
        pdf_filename = f"{uuid.uuid4()}_{pdfFile.filename}"

        # Save image file to uploads directory
        image_content = await imageFile.read()
        if imageFile.content_type in ["image/jpeg", "image/png", "image/gif"]:
            try:
                image_path = os.path.join(UPLOAD_DIR, image_filename)
                with open(image_path, "wb") as image_f:
                    image_f.write(image_content)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error saving image: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Invalid image file type")

        # Save PDF file to uploads directory without processing
        pdf_content = await pdfFile.read()
        if pdfFile.content_type == "application/pdf":
            try:
                pdf_path = os.path.join(UPLOAD_DIR, pdf_filename)
                with open(pdf_path, "wb") as pdf_f:
                    pdf_f.write(pdf_content)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error saving PDF: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Invalid PDF file type")

        # Run validation engine
        base = ValidationEngine(pdf_path, image_path, description)
        headers = {
        "X-Validation-Status": "Failure" if base.res else "Failure",
        }
        output_filename = f"{pdf_filename.split('.')[0]}.txt"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        print(output_filename, output_path)

        # Add cleanup task to run after the response is sent
        background_tasks.add_task(clean_up_directories)

        # Return the text file as the response
        return FileResponse(output_path, media_type='application/octet-stream', filename=output_filename,headers=headers)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000,reload=True)
