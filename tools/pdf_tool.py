"""
tools/pdf_tool.py — PDF resume parser

Extracts plain text from an uploaded PDF file using PyPDF2.
Used by the Resume Analyzer Agent to read resume content.
"""
import io
from pathlib import Path

import PyPDF2


def extract_text_from_pdf(source) -> str:
    """
    Extract full text from a PDF file.

    Args:
        source: Either a file path (str/Path) or a file-like object
                (e.g. Streamlit's UploadedFile / BytesIO buffer).

    Returns:
        Extracted text as a single string.
    """
    text_parts = []

    if isinstance(source, (str, Path)):
        with open(source, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    else:
        # File-like object (Streamlit UploadedFile, BytesIO, etc.)
        reader = PyPDF2.PdfReader(io.BytesIO(source.read()))
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n".join(text_parts).strip()
