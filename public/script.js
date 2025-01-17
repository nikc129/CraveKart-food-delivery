window.onscroll = () =>{
    if (window.scrollY > 60) {
        document.querySelector('#scroll-top').classList.add('active');
        
    } else {
        document.querySelector('#scroll-top').classList.remove('active');
    }
}

function loader(){
    document.querySelector('.loader-container').classList.add('fade-out');
}

function fadeOut(){
    setInterval(loader, 3000);
}

window.onload = fadeOut();

const cart = [];

function addToCart(foodName, restaurant) {
  // Check if the item already exists in the cart
  const existingItem = cart.find(item => item.foodName === foodName && item.restaurant === restaurant);

  if (existingItem) {
    // If it exists, increment the quantity
    existingItem.quantity += 1;
  } else {
    // If not, add the item with quantity = 1
    cart.push({ foodName, restaurant, quantity: 1 });
  }

  // Sort the cart by restaurant name
  cart.sort((a, b) => a.restaurant.localeCompare(b.restaurant));

  // Update the cart display
  renderCart();
}


function renderCart() {
    const cartItemsElement = document.getElementById("cart-items");
    cartItemsElement.innerHTML = ""; // Clear the existing cart items
  
    cart.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.style.marginBottom = "0.5rem";
      listItem.textContent = ` ${item.foodName} from ${item.restaurant} (x${item.quantity})`;
  
      // Add a remove button for each item
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.style.marginLeft = "1rem";
      removeButton.style.padding = "0.5rem 1rem";
      removeButton.style.fontSize = "1.2rem";
      removeButton.style.color = "#fff";
      removeButton.style.backgroundColor = "var(--red)";
      removeButton.style.border = "none";
      removeButton.style.borderRadius = "0.5rem";
      removeButton.style.cursor = "pointer";
      removeButton.onclick = () => removeFromCart(index);
  
      listItem.appendChild(removeButton);
      cartItemsElement.appendChild(listItem);
    });
  }
  function removeFromCart(index) {
    // Decrement the quantity of the item
    cart[index].quantity -= 1;
  
    // Remove the item from the cart if the quantity reaches 0
    if (cart[index].quantity === 0) {
      cart.splice(index, 1);
    }
  
    // Re-render the cart to reflect the changes
    renderCart();
  }
  
function placeOrder() {
    if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
    }
    alert('Order placed successfully!');
    cart.length = 0; // Clear the cart
    renderCart();
}
      

