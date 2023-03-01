// Ram size management in add server feature

const dropDownsItems = document.querySelectorAll('.dropdown-size');
const ramInput = document.querySelector('input#ram');
const inputSize = document.querySelector('.ram-size');

dropDownsItems.forEach(item => {
    item.addEventListener('click', () => {
        inputSize.value = item.innerText
    })
})

document.querySelector('#add-server').addEventListener('submit', () => {
    ramInput.value += inputSize.value;
})



// HDD size management in add machine feature
const dropDownsItemsss = document.querySelectorAll('.dropdown-sizeee');
const ramInputtt = document.querySelector('input#hard-disk');
const inputSizeee = document.querySelector('.hard-disk-size');

dropDownsItemsss.forEach(item => {
    item.addEventListener('click', () => {
        inputSizeee.value = item.innerText
    })
})

document.querySelector('#add-server').addEventListener('submit', () => {

    ramInputtt.value += inputSizeee.value;
});
