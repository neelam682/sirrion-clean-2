// Accepts full chat history as `messages`
export const getRoadmapFromGPT = async (profile, messages) => {
  try {
    // Add the system prompt only once at the beginning
    const systemMessage = {
      role: "system",
      content: `You are Richard Feynman mentoring ${profile.name}, who wants to learn ${profile.goal}. Respond in a helpful and clear way, using Feynman-style explanations.`,
    };

    const chatMessages = [systemMessage, ...messages];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: chatMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "GPT API Error");
    }

    return data.choices?.[0]?.message?.content || "No response.";
  } catch (error) {
    console.error("❌ Error fetching from GPT:", error.message);
    return "Something went wrong while generating a response.";
  }
};
