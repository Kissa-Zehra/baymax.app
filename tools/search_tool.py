"""
tools/search_tool.py — Serper API web search tool

Wraps the Serper.dev API for real-time web search.
Used by the Job Search Agent to find live job postings.
"""
import json
import requests
from langchain_core.tools import Tool
from config import SERPER_API_KEY


# ── Raw HTTP search function ──────────────────────────────────────────────────

def web_search(query: str, num_results: int = 10) -> list[dict]:
    """
    Search the web using Serper API.

    Args:
        query:       Search query string
        num_results: Number of results to return (default 10)

    Returns:
        List of result dicts with keys: title, link, snippet
    """
    if not SERPER_API_KEY:
        return [{"error": "SERPER_API_KEY not set. Add it to your .env file."}]

    headers = {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
    }
    payload = json.dumps({"q": query, "num": num_results, "gl": "pk"})  # gl=pk → Pakistan results

    try:
        resp = requests.post(
            "https://google.serper.dev/search",
            headers=headers,
            data=payload,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        results = []
        for item in data.get("organic", []):
            results.append({
                "title":   item.get("title", ""),
                "link":    item.get("link", ""),
                "snippet": item.get("snippet", ""),
            })
        return results

    except requests.RequestException as e:
        return [{"error": f"Search failed: {str(e)}"}]


# ── LangChain-compatible tool wrapper ─────────────────────────────────────────

def _search_fn(query: str) -> str:
    """
    Search the internet for the given query.
    Returns top results as formatted text for the agent to read.
    Use this to find job listings, company info, or tech resources.
    """
    results = web_search(query, num_results=8)

    if not results or "error" in results[0]:
        return results[0].get("error", "No results found.")

    output_lines = []
    for i, r in enumerate(results, 1):
        output_lines.append(
            f"{i}. **{r['title']}**\n   {r['snippet']}\n   URL: {r['link']}"
        )
    return "\n\n".join(output_lines)


# LangChain Tool — compatible with crewai==0.11.2
get_search_tool = Tool(
    name="Web Search Tool",
    func=_search_fn,
    description=(
        "Search the internet for the given query. "
        "Use this to find job listings, company info, or current tech resources."
    ),
)
