from google import genai
from google.genai import types
import os

XML_EXTENSIONS = {".xml",".xaml"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}
DOCUMENT_EXTENSIONS = {".docx", ".doc"}
PDF_EXTENSIONS = {".pdf"}
EXCEL_EXTENSIONS = {".xlsx", ".xls"}
CSV_EXTENSIONS = {".csv"}
TXT_EXTENSIONS = {".txt"}
JSON_EXTENSIONS = {".json"}
MARKDOWN_EXTENSIONS = {".md"}
XPDL_EXTENSIONS = {".xpdl"}
PEP_EXTENSIONS = {".pep"}
WSDL_EXTENSIONS = {".wsdl"}
JAVA_EXTENSIONS = {".java"}
WEB_EXTENSIONS = {".ts", ".css", ".html"}
TEXT_LIKE_EXTENSIONS = XML_EXTENSIONS | TXT_EXTENSIONS | MARKDOWN_EXTENSIONS | XPDL_EXTENSIONS | PEP_EXTENSIONS | WSDL_EXTENSIONS | JAVA_EXTENSIONS | WEB_EXTENSIONS
ALL_SUPPORTED_EXTENSIONS = DOCUMENT_EXTENSIONS | PDF_EXTENSIONS | EXCEL_EXTENSIONS | CSV_EXTENSIONS | JSON_EXTENSIONS | TEXT_LIKE_EXTENSIONS | VIDEO_EXTENSIONS

GOOGLE_VIDEO_KEY = os.getenv("GOOGLE_VIDEO_KEY")
def video_to_transcript(video_path):
    # Convert video to text using Google Gemini models
    try:
        video_bytes = open(video_path, 'rb').read()
        # Initialize the Gemini client (replace with your API key configuration)
        client = genai.Client(api_key=GOOGLE_VIDEO_KEY)
 
        response = client.models.generate_content(
                model='models/gemini-2.5-flash',
                contents=types.Content(
                    parts=[
                            types.Part(
                                inline_data=types.Blob(data=video_bytes, mime_type='video/mp4')
                            ),
                            types.Part(text='Create detailed sequence of steps describing what actions the user is doing in video. Dont show times, just create steps and any details like email address entries.')
                        ]
                    )
                )
        return response.text
    except Exception as e:
        raise RuntimeError(
                "Error during video to text conversion"
            ) from e

def read_docx(file_obj):
    from docx import Document
    doc = Document(file_obj)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def read_pdf(file_obj):
    import PyPDF2
    reader = PyPDF2.PdfReader(file_obj)
    full_text = []
    for page in reader.pages:
        full_text.append(page.extract_text())
    return '\n'.join(full_text)

def read_txt(file_obj):
    return file_obj.read().decode('utf-8', errors='ignore')

def read_excel(file_obj):
    import pandas as pd
    xls = pd.ExcelFile(file_obj)
    full_text = []
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        full_text.append(f"--- Sheet: {sheet_name} ---")
        full_text.append(df.to_string(index=False))
    return '\n'.join(full_text)

def read_csv(file_obj):
    import pandas as pd
    df = pd.read_csv(file_obj)
    return df.to_string(index=False)

def read_json(file_obj):
    import json
    data = json.load(file_obj)
    return json.dumps(data, indent=2)

def read_file_content(file_obj, filename):
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    if ext in DOCUMENT_EXTENSIONS:
        return read_docx(file_obj)
    elif ext in TXT_EXTENSIONS:
        return read_txt(file_obj)
    elif ext in PDF_EXTENSIONS:
        return read_pdf(file_obj)
    elif ext in EXCEL_EXTENSIONS:
        return read_excel(file_obj)
    elif ext in CSV_EXTENSIONS:
        return read_csv(file_obj)
    elif ext in JSON_EXTENSIONS:
        return read_json(file_obj)
    elif ext in TEXT_LIKE_EXTENSIONS:
        return read_txt(file_obj)
    elif ext in VIDEO_EXTENSIONS:
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(file_obj.read())
            tmp_path = tmp.name
        try:
            return video_to_transcript(tmp_path)
        finally:
            os.unlink(tmp_path)
    else:
        raise ValueError(f"Unsupported file extension: {ext}")