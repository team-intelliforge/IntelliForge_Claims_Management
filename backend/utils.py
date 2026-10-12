from langchain_text_splitters import RecursiveCharacterTextSplitter
from agents import run_process_agents
from fastapi import HTTPException


# --- UTILITY FUNCTIONS ---

CHUNK_SIZE_CHARS = 8000
CHUNK_OVERLAP_CHARS = 500
MAX_CHUNKS_FOR_CONTEXT = 8


def _prepare_agent_input(combined_content: str) -> str:
    """Apply intelligent chunking using LangChain's RecursiveCharacterTextSplitter."""
    content_size = len(combined_content)
    
    # Use LangChain's recursive splitter for intelligent chunking
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE_CHARS,
        chunk_overlap=CHUNK_OVERLAP_CHARS,
        separators=["\n\n", "\n", ".", " ", ""]  # Try to keep meaningful sections together
    )
    
    chunks = splitter.split_text(combined_content)
    
    if len(chunks) <= 1:
        return combined_content

    selected_chunks = chunks[:MAX_CHUNKS_FOR_CONTEXT]
    formatted = []
    for idx, chunk in enumerate(selected_chunks, start=1):
        # Normalize whitespace
        normalized = "\n".join(line.rstrip() for line in chunk.splitlines() if line.strip())
        formatted.append(
            f"\n--- CONTEXT CHUNK {idx}/{len(chunks)} ---\n{normalized}"
        )

    if len(chunks) > MAX_CHUNKS_FOR_CONTEXT:
        formatted.append(
            f"\n--- NOTICE ---\n"
            f"Input had {len(chunks)} chunks; only first {MAX_CHUNKS_FOR_CONTEXT} were included to stay within model context limits."
        )

    prepared = (
        "INPUT WAS CHUNKED DUE TO SIZE. "
        "Use all provided chunks as source truth and preserve original technical intent.\n"
        + "".join(formatted)
    )
    return prepared


async def _process_uploaded_files(combined_content: str, req_id: str) -> dict:
    try:
        prepared_content = _prepare_agent_input(combined_content)
        response_payload = await run_process_agents(prepared_content, req_id)
        return response_payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))