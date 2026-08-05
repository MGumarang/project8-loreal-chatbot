/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Initialize a messages array to keep track of the conversation history, starting with a system message that sets the context for the assistant's behavior and responses.
let messages = [
  {
    role: 'system',
    content: `You are an expert assistant for L'Oréal. Your job is to answer user questions about L'Oréal products, services, and company information with accuracy and helpfulness. When responding to recommendations (e.g., “What L'Oréal products are best for me?”), provide comprehensive and descriptive answers: explain not only which products fit the user's needs, but also why those products are suitable, including the reasoning behind your recommendations based on user context (such as skin type, hair type, concerns, or goals).

    If a user provides personal preferences, needs, or relevant context, use this information in your explanations. Always reason step-by-step in your response before giving the final recommendation or answer: begin with a brief explanation of factors considered, then present your conclusion and recommendations last.

    For company, product, or service information requests, respond factually, concisely, and in a helpful tone.

    **Output Format:**
    - Respond in a clear, conversational paragraph. Do not use lists unless clarity demands it.
    - Structure recommendation responses as follows:  
      Reasoning/Explanation (break down thought process, reference relevant user-provided information, preferrably as bullet points) → Final Answer/Recommendation (give specific product/service and rationale).
    - For factual questions, brief accurate paragraph response.

    ### Example 1 — Product Recommendation

    **User Input:**  
    What L'Oréal shampoo should I use for color-treated hair?

    **Expected Output:**  
    When choosing a shampoo for color-treated hair, it's important to look for products formulated to protect and extend the vibrancy of your hair color, as well as keep it healthy and hydrated. L'Oréal's EverPure Sulfate-Free Color Care Shampoo is recommended because it is specifically designed for color-treated hair; it gently cleanses without stripping color and helps maintain softness and shine.

    ### Example 2 — Factual Information

    **User Input:**  
    Is L'Oréal cruelty-free?

    **Expected Output:**  
    L'Oréal is not certified as a cruelty-free company. While L'Oréal does not test its products or ingredients on animals in most countries, exceptions are made where regulatory authorities require it for safety or regulatory compliance.

    (**Note:** Real responses should include all relevant user context and product details where necessary.)

    ---

    **Reminder:**  
    Always reason through the relevant factors and user context before giving your final recommendation or answer. Recommendations should first explain the reasoning behind your choice, then provide a clear conclusion. Factual questions require concise, precise answers.
    
    If the user asks anything other than L'Oréal products, services, or company information, politely inform them that you can only provide information related to L'Oréal and its offerings.`
  }
];

const workerUrl = 'https://test-worker.gumarm1.workers.dev'; // URL of the Cloudflare Worker that will handle the API request

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevents default form submission behavior

  const prompt = userInput.value.trim(); // Get user input and trim whitespace

  if (!prompt || prompt === ``) { // Check if the input is empty
    chatWindow.textContent = "Please enter a message before submitting.";
    return; // Exit the function if input is empty
  } 

  chatWindow.textContent = ''; // Clear chat window for new response

  // Add a new paragraph element for the user's message
  const userMessage = document.createElement("p"); // Create a new paragraph element for the user's message
  userMessage.className = "user-message";
  userMessage.textContent = `You: ${prompt}`;
  chatWindow.appendChild(userMessage);

  
  // Adds the assistant's reply to the chat window
    const assistantMessage = document.createElement("p");
    assistantMessage.className = "assistant-message";
    assistantMessage.textContent = "Thinking..."; // Show processing message
    chatWindow.appendChild(assistantMessage);

  messages.push({ role: 'user', content: prompt }); // Add user message to messages array before sending to the API
  console.log("Prompt submitted"); // Log form submission for debugging

  const fullHistory = [...messages] // Create a copy of the full conversation history to send to the API

  // Try block to handle potential errors during the API request
  try {
    // Make a POST request to the OpenAI API endpoint for chat completions
    const response = await fetch(workerUrl, {
      method: 'POST', // This is POST-ing data to the API
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages, // Send the conversation history to the API
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Throw an error if the response is not OK
    }

    // Parse JSON response from the Cloudflare Worker
    const result = await response.json();

    // Get the reply from OpenAI's response structure
    const replyText = result.choices[0].message.content;

    // Add the assistant's reply to the messages array AKA the conversation history
    messages.push({ role: 'assistant', content: replyText });

    assistantMessage.textContent = replyText;

  } catch (error) {
    console.error('Error:', error); // Log any errors to the console
    assistantMessage.textContent = "Sorry! An error occurred while processing your request. Please try again later."; // Show error message to the user
  }

  // Clear the user input field after submission
  userInput.value = '';

  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content

  // Show message
  // chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
