"""
rag/pipeline.py — RAG pipeline using ChromaDB + HuggingFace embeddings + Groq

Flow:
  1. Ingest documents (PDFs, text) → chunk → embed → store in ChromaDB
  2. On query: embed query → find similar chunks → pass as context to Groq LLM
"""
import os
from pathlib import Path
from typing import Optional

import chromadb
from chromadb.config import Settings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.output_parsers import StrOutputParser

from config import (
    GROQ_API_KEY,
    GROQ_MODEL,
    CHROMA_PERSIST_DIR,
    CHROMA_COLLECTION,
    EMBEDDING_MODEL,
)


class RAGPipeline:
    """
    Retrieval-Augmented Generation pipeline for JobPrep AI.
    Loads job descriptions, company info, or resume templates into ChromaDB,
    then answers queries using Groq LLM with retrieved context.
    """

    def __init__(self):
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

        # HuggingFace local embeddings — no API key needed
        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
        )

        # ChromaDB persistent store
        self.vectorstore = Chroma(
            collection_name=CHROMA_COLLECTION,
            embedding_function=self.embeddings,
            persist_directory=CHROMA_PERSIST_DIR,
        )

        # Text splitter — 500 chars with 50 overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
        )

        # Groq LLM
        self.llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model=GROQ_MODEL,
            temperature=0.3,
        )

        # RAG prompt template
        self.prompt = ChatPromptTemplate.from_template("""
You are an expert career advisor for Pakistani CS students and fresh graduates.
Use the following retrieved context to answer the question accurately.
If the context doesn't contain the answer, say so honestly.

Context:
{context}

Question: {question}

Answer:
""")
        # Build the LCEL RAG chain
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": 4})
        self.chain = (
            RunnableParallel(
                context=retriever | self._format_docs,
                question=RunnablePassthrough(),
            )
            | self.prompt
            | self.llm
            | StrOutputParser()
        )

    # ── Ingestion ─────────────────────────────────────────────────────────────

    def ingest_pdf(self, pdf_path: str) -> int:
        """Load a PDF, chunk it, embed it, store in ChromaDB. Returns chunk count."""
        loader = PyPDFLoader(pdf_path)
        docs   = loader.load()
        chunks = self.splitter.split_documents(docs)
        self.vectorstore.add_documents(chunks)
        return len(chunks)

    def ingest_text(self, text: str, metadata: Optional[dict] = None) -> int:
        """Ingest raw text string directly. Returns chunk count."""
        from langchain_core.documents import Document
        doc    = Document(page_content=text, metadata=metadata or {})
        chunks = self.splitter.split_documents([doc])
        self.vectorstore.add_documents(chunks)
        return len(chunks)

    def ingest_directory(self, directory: str, glob: str = "**/*.pdf") -> int:
        """Ingest all PDFs in a directory. Returns total chunk count."""
        total = 0
        for path in Path(directory).glob(glob):
            total += self.ingest_pdf(str(path))
        return total

    # ── Query ─────────────────────────────────────────────────────────────────

    def query(self, question: str) -> str:
        """Run a RAG query — returns the LLM answer string."""
        return self.chain.invoke(question)

    def get_context_chunks(self, question: str, k: int = 4) -> list[str]:
        """Return raw retrieved chunks for debugging / display."""
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": k})
        docs = retriever.invoke(question)
        return [d.page_content for d in docs]

    # ── Private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _format_docs(docs) -> str:
        return "\n\n".join(d.page_content for d in docs)
