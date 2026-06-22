from mem0 import MemoryClient

from app.config import settings


def get_mem0() -> MemoryClient:
    return MemoryClient(api_key=settings.mem0_api_key)


def add_memory(user_id: str, text: str) -> None:
    client = get_mem0()
    client.add(text, user_id=user_id)


def search_memory(user_id: str, query: str) -> list[str]:
    client = get_mem0()
    results = client.search(query, filters={"user_id": user_id})
    if isinstance(results, dict):
        results = results.get("results", [])
    return [r["memory"] for r in results if "memory" in r]
