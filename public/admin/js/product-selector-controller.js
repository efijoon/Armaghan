
let selectedProductName;
let selectedProductID;
let deselectedProductName;
let deselectedProductID;
let selectedProductsName = [];
let selectedProductsID = $('#products').val();
let updatedSelectedProductsName = [];
let updatedSelectedProductsID = [];
findSelectedProductsNames();
let prevSelectedProductsLength = $('#products option:selected').length;

$("#products").change(function () {
    if ($('#products option:selected').length > prevSelectedProductsLength) {
        updatedSelectedProductsID = $('#products').val();
        updatedSelectedProductsName = [];
        findUpdatedSelectedProductsNames();

        updatedSelectedProductsID.forEach((productID, i) => {
            // The condition of product id doesn't exists in previouse selected products array so thats the selected one
            if(selectedProductsID.indexOf(productID) == -1) {;
                selectedProductID = productID;
                selectedProductName = updatedSelectedProductsName[i];

                addProduct(selectedProductName, selectedProductID);
                prevSelectedProductsLength = $('#products option:selected').length;
                selectedProductsID = $('#products').val();

                console.log(selectedProductID, selectedProductName);
            }
        })

    } else if($('#products option:selected').length < prevSelectedProductsLength) {
        selectedProductsID.forEach(productID => {
            updatedSelectedProductsID = $('#products').val();
            // The condition of product id doesn't exists in selected products array so thats the deleted one
            if(updatedSelectedProductsID.indexOf(productID) == -1) {
                deleteProduct(productID);
                selectedProductsID = updatedSelectedProductsID;

                // Update selected product names
                selectedProductsName = [];
                $("#products option:selected").each(function () {
                    if ($(this).length) selectedProductsName.push($(this).text());
                });
                selectedProductsID = $('#products').val();
                prevSelectedProductsLength = $('#products option:selected').length;

                console.log(selectedProductsName, selectedProductsID);

            }
        })
    }
});

let productsCol = $('.product-names');
let countsCol = $('.product-counts');

function addProduct(selectedProductName, selectedProductID) {
    productsCol.append(`<input type="text" class="form-control mt-3  ${selectedProductID}" name="${selectedProductID}" value="${selectedProductName}" disabled>`);
    countsCol.append(`<input type="text" class="form-control mt-3 product-counts-for-server ${selectedProductID}" name="${selectedProductID}" value="1">`);
}

function deleteProduct(deselectedProductID) {
    let p = Array.from(document.getElementsByClassName(`${deselectedProductID}`))
    p.forEach(field => {
        field.remove();
    })
}

function findSelectedProductsNames() {
    $("#products option:selected").each(function () {
        if ($(this).length) selectedProductsName.push($(this).text());
    });
}

function findUpdatedSelectedProductsNames() {
    $("#products option:selected").each(function () {
        if ($(this).length) updatedSelectedProductsName.push($(this).text());
    });
}

// Send Selected product counts information to the server
let productCountsArray = [];
let submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', function(e) {
    productCountsArray = Array.from(document.getElementsByClassName('product-counts-for-server'));

    let result = true;
    productCountsArray.forEach(count => {
        if(count.value <= 0 || count.value == '' || ! just_number(count.value)) result = false
            else $('#productsCount').append(`<option value="${count.value}" selected>${count.value}</option>`)
    })

    if(! result) {
        e.preventDefault();
        Swal.fire({
            title: 'لطفا تعداد محصولات سفارش شده را یک عدد مثبت وارد کنید.',
            type: 'error',
            timer : 5000 ,
            toast : true,
            showConfirmButton: false,
            position : 'center',
        })
    }
})

function just_number(str) {
    let n = /^\d+$/;
    console.log(n.test(str));

    if (! n.test(str)) return false;
    return true;
}