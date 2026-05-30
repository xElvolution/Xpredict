export async function tavilySearch(query: string): Promise<string> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: true
    })
  });
  const data = await res.json();
  const results = (data.results ?? [])
    .map((r: { title: string; content: string; url: string }) => `${r.title}: ${r.content}`)
    .join('\n\n');
  return data.answer ? `${data.answer}\n\n${results}` : results;
}
