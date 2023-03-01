// HDD size management in add machine feature
const dropDownsItems = document.querySelectorAll('.dropdown-sizee');
const ramInput = document.querySelector('input#hard-disk');
const inputSize = document.querySelector('.hard-disk-size');

dropDownsItems.forEach(item => {
    item.addEventListener('click', () => {
        inputSize.value = item.innerText
    })
})

document.querySelector('#add-machine').addEventListener('submit', () => {

    ramInput.value += inputSize.value;
});




