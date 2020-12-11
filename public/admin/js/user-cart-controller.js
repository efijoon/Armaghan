let totalPrice = 0;
let tPrice = document.getElementById('total-price');;
let prices;

function calculateTotalPrice() {
  totalPrice = 0;
  prices = Array.from(document.getElementsByClassName('product-price'));

  prices.forEach(price => {
    totalPrice += parseInt(numberWithoutCommas(price.innerHTML));
  })

  tPrice.innerHTML = `${numberWithCommas(totalPrice)} تومان`
}

function numberWithCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function numberWithoutCommas(number) {
  return number.replace(/\,/g,'');
}

function removeFromCart(id) {
  $.ajax({
    url: `/removeFromCart/${id}`,
    success: function(result){

      $(`#${id}`).remove();

      // If no product is in the cart so show the 'no product in cart' alert
      let p = Array.from(document.getElementsByClassName('product-price'));
      if(p.length == 0) {
        // Remove the table
        let cartTable = document.getElementById('cart-table');
        cartTable.remove();

        // Add 'no product in cart' alert
        let alert = document.getElementById('no-product-in-cart-alert');
        alert.innerHTML = `
          <h4 style="text-align: center;padding: 10px;border: 2px solid green;border-radius: 20px;margin-top: 50px;">در حال حاضر محصولی در سبد خرید شما نمیباشد...</h4>
          <br>
          <h3 style="text-align: center;">
            برای انتخاب محصول بر روی <a href="/products">اینجا</a>  کلیک کنید.
          </h3>
        `
      }
      // Show the updated total price
      calculateTotalPrice();
    }
  });
}

function increaseProductCount(productID, productIndexInTable) {
  $.ajax({
    url: `/increaseCountInCart/${productID}`,
    success: function(res) {
      let orderCount = document.getElementById(`ordered-product-count-${productIndexInTable}`).innerText;

      if(res !== orderCount) {
        updateProductPrice(productIndexInTable, res, true);
        calculateTotalPrice();
      }
      document.getElementById(`ordered-product-count-${productIndexInTable}`).innerText = res;
      
    }
  })
}

function decreaseProductCount(productID, productIndexInTable) {
  $.ajax({
    url: `/decreaseCountInCart/${productID}`,
    success: function(res) {
      let orderCount = parseInt(document.getElementById(`ordered-product-count-${productIndexInTable}`).innerText);
      document.getElementById(`ordered-product-count-${productIndexInTable}`).innerText = res;

      if(orderCount !== 1) updateProductPrice(productIndexInTable, res, false);
      
      calculateTotalPrice();
    }
  })
}

function updateProductPrice(productIndexInTable, newCountOfProduct, inc) {
  let priceToUpdate = parseInt(numberWithoutCommas(document.getElementById(`product-price-${productIndexInTable}`).innerText));
  let count = parseInt(document.getElementById(`original-product-price-${productIndexInTable}`).innerText);

  if(inc) {
    priceToUpdate += count;
  } else priceToUpdate -= count;
  
  document.getElementById(`product-price-${productIndexInTable}`).innerText = numberWithCommas(priceToUpdate);
}

// Calculate the total price on the load of the page
calculateTotalPrice();