/**
 * Helper to call the NVIDIA NIM API with automatic key rotation and failover.
 * If a key hits rate limits (429) or worker exhaustion (503), it rotates to the next key.
 */

// Keep track of the active key index in memory
let currentKeyIndex = 0;

function getConfiguredNimKeys() {
  const importMetaKeys = [
    import.meta.env.VITE_NIM_API1,
    import.meta.env.VITE_NIM1,
    import.meta.env.VITE_NIM2,
    import.meta.env.VITE_NIM3,
    import.meta.env.VITE_NIM4,
    import.meta.env.VITE_NIM5
  ].filter(Boolean);

  const injectedKeys = typeof __NIM_API_KEYS__ !== 'undefined'
    ? [
        __NIM_API_KEYS__.VITE_NIM_API1,
        __NIM_API_KEYS__.VITE_NIM1,
        __NIM_API_KEYS__.VITE_NIM2,
        __NIM_API_KEYS__.VITE_NIM3,
        __NIM_API_KEYS__.VITE_NIM4,
        __NIM_API_KEYS__.VITE_NIM5
      ].filter(Boolean)
    : [];

  return [...new Set([...importMetaKeys, ...injectedKeys])];
}

export async function callNimApi({
  messages,
  temperature = 0.2,
  max_tokens = 4096,
  model = "nvidia/nemotron-3-ultra-550b-a55b"
}) {
  const keys = getConfiguredNimKeys();

  if (keys.length === 0) {
    console.error("No NIM API Keys configured in environment variables.");
    throw new Error("NIM API keys are missing. Please configure your .env file.");
  }

  let attempts = 0;
  const maxAttempts = keys.length;

  while (attempts < maxAttempts) {
    const apiKey = keys[currentKeyIndex];
    attempts++;

    try {
      console.log(`[NIM API] Sending request using key index ${currentKeyIndex}/${keys.length - 1}...`);
      
      const response = await fetch("/api/nim/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens
        })
      });

      // Rotate on rate limits (429), worker exhaustion (503), or authorization failures (401/403)
      if (response.status === 401 || response.status === 403 || response.status === 429 || response.status === 503) {
        const errorText = await response.text();
        console.warn(`[NIM API] Key index ${currentKeyIndex} failed with HTTP ${response.status}. Rotating key...`, errorText);
        
        // Rotate to the next key index and try again
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        continue;
      }

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errBody || response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      throw new Error("Empty response from NIM API");

    } catch (error) {
      console.error(`[NIM API] Error with key index ${currentKeyIndex}:`, error);
      
      // Rotate index and try next key if we have attempts left
      if (attempts < maxAttempts) {
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        continue;
      }
      throw error;
    }
  }

  throw new Error("All configured NVIDIA NIM API keys are exhausted or rate-limited.");
}
