from langchain_ollama import OllamaEmbeddings

embeddings = OllamaEmbeddings(model="nomic-embed-text")


def embed_text(text: str):
    return embeddings.embed_query(text)