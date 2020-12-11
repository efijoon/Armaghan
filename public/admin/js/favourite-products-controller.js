function removeFromFavourite(id) {
    $.ajax({
      url: `/removeFromFavourite/${id}`,
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
            <h4 style="text-align: center;padding: 10px;border: 2px solid green;border-radius: 20px;margin-top: 50px;">در حال حاضر شما محصول مورد علاقه ای ندارید ...</h4>
            <br>
            <h3 style="text-align: center;">
              برای انتخاب محصول بر روی <a href="/products">اینجا</a>  کلیک کنید.
            </h3>
          `
        }
      }
    });
  }