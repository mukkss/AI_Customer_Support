from pathlib import Path
from typing import List
from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document
from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
    RecursiveCharacterTextSplitter,
)
import os




def load_and_split_markdown(
    folder_path: str,
    doc_type: str,
    chunk_size: int,
    chunk_overlap: int
) -> List[Document]:

    folder = Path(folder_path)
    if not folder.exists():
        raise RuntimeError(f"Data folder not found: {folder}")

    all_chunks: List[Document] = []

    header_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[
            ("##", "section"),
            ("###", "subsection"),
        ]
    )

    chunk_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""],
    )

    for md_file in folder.glob("*.md"):
        try:
            loader = TextLoader(
                file_path=str(md_file),
                encoding="utf-8"
            )
            docs = loader.load()

            full_text = "\n".join(d.page_content for d in docs).strip()
            if not full_text:
                print(f"[WARN] No text extracted from {md_file}")
                continue

            header_docs = header_splitter.split_text(full_text)

            for doc in header_docs:
                doc.metadata.update({
                    "source_file": md_file.name,
                    "doc_type": doc_type,
                    "section": doc.metadata.get("section"),
                })

            chunks = chunk_splitter.split_documents(header_docs)

            for idx, chunk in enumerate(chunks):
                chunk.metadata["chunk_index"] = idx

            all_chunks.extend(chunks)

        except Exception as e:
            print(f"[ERROR] Failed to process {md_file}: {e}")
            continue

    return all_chunks


# def embed_and_store(documents: List[Document], table_name: str):
#     conn = get_db_connection()

#     for i, chunk in enumerate(documents):
#         try:
#             embedding = embed_text(chunk.page_content)

#             insert_chunk(
#                 conn=conn,
#                 table=table_name,
#                 content=chunk.page_content,
#                 embedding=embedding,
#                 metadata=chunk.metadata
#             )

#             if i % 10 == 0:
#                 print(f"[INFO] Inserted {i + 1} chunks into {table_name}")

#         except Exception as e:
#             print(f"[ERROR] Failed to insert chunk {i}: {e}")

#     conn.close()
