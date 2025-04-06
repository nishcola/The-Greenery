// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // --- Mock Order Page Logic ---
    const orderForm = document.getElementById('mockOrderForm'); // Get the form element

    // Check if we are actually on the order page by seeing if the form exists
    if (orderForm) {
        // --- Selectors for elements we need to interact with ---
        const quantityInputs = orderForm.querySelectorAll('input[type="number"][data-price]'); // Inputs for item quantity
        const cartItemsList = document.getElementById('cart-items'); // The <ul> where cart items are displayed
        const cartSubtotalEl = document.getElementById('cart-subtotal'); // Span for subtotal price
        const cartTaxEl = document.getElementById('cart-tax');       // Span for tax price
        const cartTotalEl = document.getElementById('cart-total');     // Span for total price
        const customizationInputs = orderForm.querySelectorAll('.form-check-input[data-parent-id]'); // Checkboxes/radios for item options
        const orderTypeRadios = orderForm.querySelectorAll('input[name="orderType"]'); // Radio buttons for Pickup/Delivery
        const deliveryAddressGroup = document.getElementById('deliveryAddressGroup'); // Div containing delivery address field
        const deliveryNotice = document.getElementById('deliveryNotice');           // Small text notice about delivery fee
        const deliveryAddressTextarea = deliveryAddressGroup ? deliveryAddressGroup.querySelector('textarea') : null; // The address textarea itself

        const TAX_RATE = 0.06; // Example tax rate (8%) - Adjust as needed

        // --- Function to Update the Cart Display ---
        function updateCart() {
            cartItemsList.innerHTML = ''; // Clear current items display
            let subtotal = 0;
            let itemsAdded = false;

            // Loop through each menu item's quantity input
            quantityInputs.forEach(input => {
                const quantity = parseInt(input.value); // Get the quantity entered

                // Only process if quantity is greater than 0
                if (quantity > 0) {
                    itemsAdded = true; // Mark that we have items in the cart
                    const name = input.getAttribute('data-name');       // Get item name (e.g., "Buddha Bowl")
                    const basePrice = parseFloat(input.getAttribute('data-price')); // Get item base price
                    let itemTotal = quantity * basePrice;          // Calculate total for this item quantity (before options)
                    let customizationsDesc = []; // Array to hold descriptions of selected options

                    // --- Handle Customizations ---
                    const parentId = input.id; // ID of the quantity input (e.g., "qty-buddha")
                    // Find options linked to this item via 'data-parent-id'
                    customizationInputs.forEach(customInput => {
                        // Check if the option belongs to the current item AND is checked
                        if (customInput.getAttribute('data-parent-id') === parentId && customInput.checked) {
                             const customPrice = parseFloat(customInput.value || 0); // Get option price (0 if no value)
                             const customLabel = customInput.labels[0] ? customInput.labels[0].textContent.split('(')[0].trim() : 'Option'; // Get option label text

                             // Add cost of option (times quantity) to the item's total
                             if (customPrice > 0) {
                                 itemTotal += quantity * customPrice;
                                 customizationsDesc.push(`${customLabel} (+$${customPrice.toFixed(2)})`); // Add description with price
                             } else {
                                 customizationsDesc.push(customLabel); // Add description without price for 0-cost options
                             }
                        } else if (customInput.getAttribute('data-parent-id') === parentId && customInput.type === 'radio' && customInput.checked && customInput.value === "0") {
                            // Special case: Capture selected radio buttons even if they have 0 cost (like default 'Fries')
                             const customLabel = customInput.labels[0] ? customInput.labels[0].textContent.split('(')[0].trim() : 'Option';
                             customizationsDesc.push(customLabel);
                        }
                    });
                    // --- End Handle Customizations ---

                    subtotal += itemTotal; // Add this item's total (including options) to the overall subtotal

                    // Create the HTML list item (<li>) to display in the cart summary
                    const li = document.createElement('li');
                    li.className = 'd-flex justify-content-between align-items-start mb-1';
                    li.innerHTML = `
                        <div>
                            <span>${quantity}x ${name}</span>
                            ${customizationsDesc.length > 0 ? `<br><small class="text-muted ps-2">↳ ${customizationsDesc.join(', ')}</small>` : ''}
                        </div>
                        <span class="text-nowrap ps-2">$${itemTotal.toFixed(2)}</span>
                    `;
                    cartItemsList.appendChild(li); // Add the list item to the cart display
                }
            });

            // If no items were added, display the "empty" message
            if (!itemsAdded) {
                 cartItemsList.innerHTML = '<li class="text-muted">Select items to add them here.</li>';
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
            const selectedType = orderForm.querySelector('input[name="orderType"]:checked').value;

            // Show/hide address field and notice based on selection
            if (deliveryAddressGroup && deliveryNotice && deliveryAddressTextarea) {
                if (selectedType === 'delivery') {
                    deliveryAddressGroup.style.display = 'block'; // Show address field
                    deliveryNotice.style.display = 'inline';     // Show delivery notice
                    deliveryAddressTextarea.required = true;     // Make address mandatory for delivery
                } else {
                    deliveryAddressGroup.style.display = 'none'; // Hide address field
                    deliveryNotice.style.display = 'none';      // Hide delivery notice
                    deliveryAddressTextarea.required = false;    // Address not mandatory for pickup
                    deliveryAddressTextarea.value = '';          // Clear address if switching back to pickup
                }
            }
         }

        // --- Event Listeners ---

        // Update cart whenever a quantity input changes or key is pressed in it
        quantityInputs.forEach(input => {
            input.addEventListener('change', updateCart);
            input.addEventListener('keyup', updateCart); // Handles typing directly into the box
        });

        // Update cart whenever a customization option changes
        customizationInputs.forEach(input => {
            input.addEventListener('change', updateCart);
        });

        // Handle visibility of address field when pickup/delivery choice changes
         orderTypeRadios.forEach(radio => {
             radio.addEventListener('change', handleOrderTypeChange);
         });

        // Handle the "Place Mock Order" button click (form submission)
        orderForm.addEventListener('submit', function(event) {
            event.preventDefault(); // IMPORTANT: Stop the form from actually submitting

            const selectedType = orderForm.querySelector('input[name="orderType"]:checked').value;
            const customerName = document.getElementById('customerName').value; // Get name for personalization

            // Simple validation check example (ensure required fields aren't empty)
            let isValid = true;
            if (!customerName || !document.getElementById('customerPhone').value) {
                isValid = false;
            }
            if (selectedType === 'delivery' && (!deliveryAddressTextarea || !deliveryAddressTextarea.value)) {
                 isValid = false;
            }

            if(isValid) {
                // Show the confirmation alert - NO data is sent
                alert(`Order Placed for ${customerName}!\n\nOrder Type: ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}\nFinal Total: ${cartTotalEl.textContent}\n\n(This is a simulation. No payment processed, no order sent.)`);

                // Optional: Reset the form after mock submission
                orderForm.reset();
                updateCart(); // Update cart display to empty
                handleOrderTypeChange(); // Reset address field visibility
            } else {
                 alert('Please fill in all required fields (*).');
            }
        });

         // --- Initial Setup on Page Load ---
         updateCart(); // Calculate totals based on initial values (usually 0)
         handleOrderTypeChange(); // Set initial visibility for the address field

    } // End of 'if (orderForm)' check


    // --- Mock Contact Page Logic (Keep As Is or Remove if only order page JS is needed) ---
     const contactForm = document.getElementById('mockContactForm');
     if (contactForm) {
         contactForm.addEventListener('submit', function(event) {
             event.preventDefault(); // Stop form from submitting
             alert('Message Sent!');
             // Optionally clear the form
             contactForm.reset();
         });
     }


    // --- Add Bootstrap Tooltips (Optional Example) ---
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

}); // End DOMContentLoaded