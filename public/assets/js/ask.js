function askForDelete(formId) {
    Swal.fire({
        title: 'هشدار',
        text: "آیا از انجام این عمل اطمینان دارید ؟",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'بله',
        cancelButtonText: 'خیر'
    }).then((result) => {
        if (result.value) {
            $(`#del-form-${formId}`).submit();
        }
    })
}