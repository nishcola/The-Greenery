// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // --- Mock Order Page Logic ---
  const orderForm = document.getElementById("mockOrderForm"); // Get the form element

  // Check if we are actually on the order page by seeing if the form exists
  if (orderForm) {
    // --- Selectors for elements we need to interact with ---
    const quantityInputs = orderForm.querySelectorAll(
      'input[type="number"][data-price]'
    ); // Inputs for item quantity
    const cartItemsList = document.getElementById("cart-items"); // The <ul> where cart items are displayed
    const cartSubtotalEl = document.getElementById("cart-subtotal"); // Span for subtotal price
    const cartTaxEl = document.getElementById("cart-tax"); // Span for tax price
    const cartTotalEl = document.getElementById("cart-total"); // Span for total price
    const customizationInputs = orderForm.querySelectorAll(
      ".form-check-input[data-parent-id]"
    ); // Checkboxes/radios for item options
    const orderTypeRadios = orderForm.querySelectorAll(
      'input[name="orderType"]'
    ); // Radio buttons for Pickup/Delivery
    const deliveryAddressGroup = document.getElementById(
      "deliveryAddressGroup"
    ); // Div containing delivery address field
    const deliveryNotice = document.getElementById("deliveryNotice"); // Small text notice about delivery fee
    const deliveryAddressTextarea = deliveryAddressGroup
      ? deliveryAddressGroup.querySelector("textarea")
      : null; // The address textarea itself

    const TAX_RATE = 0.06; // Example tax rate (8%) - Adjust as needed

    // --- Function to Update the Cart Display ---
    function updateCart() {
      cartItemsList.innerHTML = ""; // Clear current items display
      let subtotal = 0;
      let itemsAdded = false;

      // Loop through each menu item's quantity input
      quantityInputs.forEach((input) => {
        const quantity = parseInt(input.value); // Get the quantity entered

        // Only process if quantity is greater than 0
        if (quantity > 0) {
          itemsAdded = true; // Mark that we have items in the cart
          const name = input.getAttribute("data-name"); // Get item name (e.g., "Buddha Bowl")
          const basePrice = parseFloat(input.getAttribute("data-price")); // Get item base price
          let itemTotal = quantity * basePrice; // Calculate total for this item quantity (before options)
          let customizationsDesc = []; // Array to hold descriptions of selected options

          // --- Handle Customizations ---
          const parentId = input.id; // ID of the quantity input (e.g., "qty-buddha")
          // Find options linked to this item via 'data-parent-id'
          customizationInputs.forEach((customInput) => {
            // Check if the option belongs to the current item AND is checked
            if (
              customInput.getAttribute("data-parent-id") === parentId &&
              customInput.checked
            ) {
              const customPrice = parseFloat(customInput.value || 0); // Get option price (0 if no value)
              const customLabel = customInput.labels[0]
                ? customInput.labels[0].textContent.split("(")[0].trim()
                : "Option"; // Get option label text

              // Add cost of option (times quantity) to the item's total
              if (customPrice > 0) {
                itemTotal += quantity * customPrice;
                customizationsDesc.push(
                  `${customLabel} (+$${customPrice.toFixed(2)})`
                ); // Add description with price
              } else {
                customizationsDesc.push(customLabel); // Add description without price for 0-cost options
              }
            } else if (
              customInput.getAttribute("data-parent-id") === parentId &&
              customInput.type === "radio" &&
              customInput.checked &&
              customInput.value === "0"
            ) {
              // Special case: Capture selected radio buttons even if they have 0 cost (like default 'Fries')
              const customLabel = customInput.labels[0]
                ? customInput.labels[0].textContent.split("(")[0].trim()
                : "Option";
              customizationsDesc.push(customLabel);
            }
          });
          // --- End Handle Customizations ---

          subtotal += itemTotal; // Add this item's total (including options) to the overall subtotal

          // Create the HTML list item (<li>) to display in the cart summary
          const li = document.createElement("li");
          li.className =
            "d-flex justify-content-between align-items-start mb-1";
          li.innerHTML = `
                        <div>
                            <span>${quantity}x ${name}</span>
                            ${
                              customizationsDesc.length > 0
                                ? `<br><small class="text-muted ps-2">↳ ${customizationsDesc.join(
                                    ", "
                                  )}</small>`
                                : ""
                            }
                        </div>
                        <span class="text-nowrap ps-2">$${itemTotal.toFixed(
                          2
                        )}</span>
                    `;
          cartItemsList.appendChild(li); // Add the list item to the cart display
        }
      });

      // If no items were added, display the "empty" message
      if (!itemsAdded) {
        cartItemsList.innerHTML =
          '<li class="text-muted">Select items to add them here.</li>';
      }

      // Calculate tax and total
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax; // Mock delivery fee is not included here

      // Update the displayed prices
      cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      cartTaxEl.textContent = `$${tax.toFixed(2)}`;
      cartTotalEl.textContent = `$${total.toFixed(2)}`;
    }

    // --- Function to Handle Pickup/Delivery Choice ---
    function handleOrderTypeChange() {
      const selectedType = orderForm.querySelector(
        'input[name="orderType"]:checked'
      ).value;

      // Show/hide address field and notice based on selection
      if (deliveryAddressGroup && deliveryNotice && deliveryAddressTextarea) {
        if (selectedType === "delivery") {
          deliveryAddressGroup.style.display = "block"; // Show address field
          deliveryNotice.style.display = "inline"; // Show delivery notice
          deliveryAddressTextarea.required = true; // Make address mandatory for delivery
        } else {
          deliveryAddressGroup.style.display = "none"; // Hide address field
          deliveryNotice.style.display = "none"; // Hide delivery notice
          deliveryAddressTextarea.required = false; // Address not mandatory for pickup
          deliveryAddressTextarea.value = ""; // Clear address if switching back to pickup
        }
      }
    }

    // --- Event Listeners ---

    // Update cart whenever a quantity input changes or key is pressed in it
    quantityInputs.forEach((input) => {
      input.addEventListener("change", updateCart);
      input.addEventListener("keyup", updateCart); // Handles typing directly into the box
    });

    // Update cart whenever a customization option changes
    customizationInputs.forEach((input) => {
      input.addEventListener("change", updateCart);
    });

    // Handle visibility of address field when pickup/delivery choice changes
    orderTypeRadios.forEach((radio) => {
      radio.addEventListener("change", handleOrderTypeChange);
    });

    // Handle the "Place Mock Order" button click (form submission)
    orderForm.addEventListener("submit", function (event) {
      event.preventDefault(); // IMPORTANT: Stop the form from actually submitting

      const selectedType = orderForm.querySelector(
        'input[name="orderType"]:checked'
      ).value;
      const customerName = document.getElementById("customerName").value; // Get name for personalization

      // Simple validation check example (ensure required fields aren't empty)
      let isValid = true;
      if (!customerName || !document.getElementById("customerPhone").value) {
        isValid = false;
      }
      if (
        selectedType === "delivery" &&
        (!deliveryAddressTextarea || !deliveryAddressTextarea.value)
      ) {
        isValid = false;
      }

      if (isValid) {
        // Show the confirmation alert - NO data is sent
        alert(
          `Order Placed for ${customerName}!\n\nOrder Type: ${
            selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
          }\nFinal Total: ${
            cartTotalEl.textContent
          }\n\n(This is a simulation. No payment processed, no order sent.)`
        );

        // Reset the form after mock submission
        orderForm.reset();
        updateCart(); // Update cart display to empty
        handleOrderTypeChange(); // Reset address field visibility
      } else {
        alert("Please fill in all required fields (*).");
      }
    });

    // --- Initial Setup on Page Load ---
    updateCart(); // Calculate totals based on initial values (usually 0)
    handleOrderTypeChange(); // Set initial visibility for the address field
  } // End of 'if (orderForm)' check

  // --- Mock Contact Page Logic (Keep As Is or Remove if only order page JS is needed) ---
  const contactForm = document.getElementById("mockContactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Stop form from submitting
      alert("Message Sent!");
      // Clear the form
      contactForm.reset();
    });
  }

  // --- Add Bootstrap Tooltips (Optional Example) ---
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // --- Configuration ---
  // !! SECURITY WARNING !! DO NOT COMMIT YOUR REAL KEY HERE IN A PUBLIC REPO
  // !! Consider using environment variables or a backend in a real application.
  // !! For competition demo ONLY, and DELETE key afterwards.
  const GEMINI_API_KEY = "AIzaSyA9QcO2rvKgppxFHgmjAKu0ixdCVPbAqhE"; // <--- PASTE YOUR KEY HERE
  // Find the correct endpoint for the model you want to use (e.g., gemini-pro)
  // Check Google AI documentation for the latest generative models endpoint.
  const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  // --- End Configuration ---

  const chatToggle = document.getElementById("chatToggle");
  const chatWindow = document.getElementById("chatWindow");
  const closeChat = document.getElementById("closeChat");
  const messagesArea = chatWindow
    ? chatWindow.querySelector(".chat-messages")
    : null;
  const chatTextInput = document.getElementById("chatTextInput");
  const sendChatMsg = document.getElementById("sendChatMsg");
  const quickReplyAiButtons = chatWindow
    ? chatWindow.querySelectorAll(".quick-reply-ai")
    : null;

  // Simple message history (Kept short for frontend demo)
  // In a real app, manage this carefully to avoid exceeding token limits
  let conversationHistory = [
    // Initial prompt to guide the AI
    {
      role: "user",
      parts: [
        {
          text: "You are a friendly and helpful customer service chatbot for 'The Greenery', a vegan restaurant. Be concise. Answer questions about the menu (menu.html), Restaurant hours (M-F 11a-9p, Sa 10a-10p, Su 10a-8p), location (123 Plantain Place, Vegville), reservations (call for 4+), allergies (vegan kitchen, but handles nuts/soy/gluten, check menu/ask staff), catering (contact via contact.html), sustainability efforts (local sourcing, composting, eco-packaging - process.html), and the rewards program (earn points, sign up via contact page). If asked something unrelated, politely state you can only help with restaurant information. When someone asks what YOU think, answer about the restaurant: for example, when someone says 'what are your hours', you respond with M-F 11a-9p, Sa 10a-10p, Su 10a-8p. Respond to everything within the context of the restaurant: ex if someone asks 'best menu items', use the items in OUR menu to answer and give a suggestion. The menu items are crispy spring rolls, avocado toast bites, hummus platter, buddha bowl, beyond burger deluxe, lentil shepherd's pie, spicy peanut noodles, burger and fries combo, buddha bowl and spring rolls combo, chocolate avocado mousse, cashew berry cheesecake, warm apple crumble, orange juice, green vitality smoothie, local kombucha, organic fair-trade coffee, and herbal tea. we have a rewards program. we can deliver via doordash, ubereats, or grubhub.",
        },
      ],
    },
    {
      role: "model", // Start with a response from the "model" to set the context
      parts: [
        { text: "Understood. I am the The Greenery chatbot, ready to help!" },
      ],
    },
    // Note: We will *not* actually send this ^ initial model response in the API call below,
    // it's just to help structure the *next* user message correctly if we were tracking history.
    // For simplicity here, we'll often just send the latest user query.
  ];

  // Function to add a message to the chat UI
  function addChatMessage(message, sender = "bot") {
    if (!messagesArea) return;
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender} mb-2`;
    const messageSpan = document.createElement("span");
    messageSpan.className = "p-2 rounded d-inline-block shadow-sm";
    messageSpan.innerHTML = message; // Use innerHTML to allow potential links if formatted by AI
    messageDiv.appendChild(messageSpan);
    messagesArea.appendChild(messageDiv);
    // Scroll to the bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  // Function to show a "typing" indicator
  function showTypingIndicator() {
    addChatMessage(
      '<div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading...</span></div> Thinking...',
      "bot"
    );
  }

  // Function to remove the "typing" indicator (removes the last bot message)
  function removeTypingIndicator() {
    const lastBotMessage = messagesArea.querySelector(
      ".chat-message.bot:last-child"
    );
    if (lastBotMessage && lastBotMessage.querySelector(".spinner-grow")) {
      lastBotMessage.remove();
    }
  }

  // --- Function to call Gemini API ---
  async function getGeminiResponse(prompt) {
    // !!! IMPORTANT FIX: Include the system prompt + current user prompt in the contents !!!
    const requestBody = {
      // Construct the 'contents' array for the API call
      contents: [
        // Part 1: The System Instruction/Context (Always include this!)
        conversationHistory[0], // Contains the "You are a chatbot..." instructions

        // Part 2: The CURRENT user's actual question/prompt
        {
          role: "user",
          parts: [{ text: prompt }], // The 'prompt' variable (current user message)
        },
        // Note: We are NOT sending the full conversationHistory dynamically here
        // to keep it simple and avoid complexity with token limits for this demo.
        // We just prepend the static system instructions to the current user query.
      ],
      // Optional: Configure safety settings, temperature etc. (Keep as is)
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 256,
      },
      safetySettings: [
        // Keep safety settings
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    // ---- Logging for Debugging (Optional) ----
    // console.log("Sending to Gemini:", JSON.stringify(requestBody, null, 2));
    // ---- End Logging ----

    try {
      const response = await fetch(GEMINI_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Gemini API Error:",
          response.status,
          response.statusText,
          errorData
        );
        // Try to get specific error message from Gemini if available
        const errorMessage =
          errorData?.error?.message ||
          `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // ---- Logging for Debugging (Optional) ----
      // console.log("Received from Gemini:", JSON.stringify(data, null, 2));
      // ---- End Logging ----

      // Extract the text response - **VERIFY this path is correct for your model**
      if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0]
      ) {
        const botText = data.candidates[0].content.parts[0].text;
        // Basic sanitization
        const sanitizedText = botText.replace(/</g, "<").replace(/>/g, ">");
        // Improve link formatting potentially (very basic example)
        const finalText = sanitizedText
          .replace(
            /menu\.html/g,
            '<a href="menu.html" target="_blank">menu</a>'
          )
          .replace(
            /contact\.html/g,
            '<a href="contact.html" target="_blank">contact page</a>'
          )
          .replace(
            /sustainability\.html/g,
            '<a href="sustainability.html" target="_blank">sustainability page</a>'
          );

        // We are NOT dynamically adding to conversationHistory in this simplified demo
        return finalText;
      } else if (
        data.candidates &&
        data.candidates[0]?.finishReason &&
        data.candidates[0].finishReason !== "STOP"
      ) {
        // Handle cases where generation stopped due to safety or other reasons
        console.warn(
          "Gemini generation stopped. Reason:",
          data.candidates[0].finishReason
        );
        return `Sorry, I couldn't generate a full response. Reason: ${data.candidates[0].finishReason}. Please try rephrasing.`;
      } else {
        console.error("Unexpected API response structure:", data);
        return "Sorry, I received an unexpected response structure. Please check the console.";
      }
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      // Display the specific error message caught
      return `Sorry, I encountered an error: ${error.message}. Please try again later.`;
    }
  }

  // --- Function to handle sending a message ---
  async function handleSendMessage(messageText) {
    if (!messageText || !messagesArea) return;

    addChatMessage(messageText, "user"); // Display user message immediately
    if (chatTextInput) chatTextInput.value = ""; // Clear input field
    showTypingIndicator();

    const botResponse = await getGeminiResponse(messageText);

    removeTypingIndicator();
    addChatMessage(botResponse, "bot");
  }

  // --- Event Listeners ---
  if (chatToggle && chatWindow && closeChat) {
    // Toggle chat window visibility WHEN BUBBLE IS CLICKED
    chatToggle.addEventListener("click", () => {
      // console.log("Chat toggle clicked!"); // Optional: for debugging
      chatWindow.classList.add("active"); // Show window using the 'active' class

      // === HIDE THE BUBBLE ===
      // =======================

      // console.log("Chat window opened. Bubble hidden."); // Optional: for debugging
    });

    // Close chat window WHEN 'X' IS CLICKED
    closeChat.addEventListener("click", () => {
      // console.log("Close chat clicked!"); // Optional: for debugging
      chatWindow.classList.remove("active"); // Hide window by removing 'active' class

      // === SHOW THE BUBBLE AGAIN ===
      // Use 'flex' because the original CSS uses display:flex to center the icon
      // =============================

      // console.log("Chat window closed. Bubble shown."); // Optional: for debugging
    });

    // Handle Send button click (Keep as is)
    if (sendChatMsg) {
      sendChatMsg.addEventListener("click", () => {
        handleSendMessage(chatTextInput.value.trim());
      });
    }

    // Handle Enter key press in input field (Keep as is)
    if (chatTextInput) {
      chatTextInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent form submission if it's inside one
          handleSendMessage(chatTextInput.value.trim());
        }
      });
    }

    // Handle NEW quick reply buttons (Keep as is)
    if (quickReplyAiButtons) {
      quickReplyAiButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const question = button.getAttribute("data-question");
          handleSendMessage(question); // Send the predefined question
        });
      });
    }
  }
  // --- END: Gemini Chatbot Logic ---
}); // End DOMContentLoaded
