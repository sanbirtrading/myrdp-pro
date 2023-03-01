// Ram size management in add machine feature
const dropDownsItems = document.querySelectorAll('.dropdown-size');
const ramInput = document.querySelector('input#ram');
const inputSize = document.querySelector('.ram-size');

dropDownsItems.forEach(item => {
    item.addEventListener('click', () => {
        inputSize.value = item.innerText
    })
})

document.querySelector('#add-machine').addEventListener('submit', () => {
    ramInput.value += inputSize.value;
})


// HDD size management in add machine feature
const dropDownsItemss = document.querySelectorAll('.dropdown-sizee');
const ramInputt = document.querySelector('input#hard-disk');
const inputSizee = document.querySelector('.hard-disk-size');

dropDownsItemss.forEach(item => {
    item.addEventListener('click', () => {
        inputSizee.value = item.innerText
    })
})

document.querySelector('#add-machine').addEventListener('submit', () => {

    ramInputt.value += inputSizee.value;
});

