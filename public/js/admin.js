const deleteProduct = (btn) => {
    const prodInput = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    const productElmt = btn.closest("article");
    fetch(
        "/admin/product/" + prodInput, {
            method: "DELETE",
            headers: {'csrf-token': csrf}
        }
    ).then(res => {
        return res.json().then(data => {
            productElmt.parentNode.removeChild(productElmt);
        });
    }).catch(err => {
        console.log(err);
    })
};

