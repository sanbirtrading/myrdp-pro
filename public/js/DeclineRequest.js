const declineBtn = document.getElementById("decline_button");
const acceptBtn = document.getElementById("accept_button");
const rowToBeDisable = document.getElementById("row_to_be_disable");

declineBtn.addEventListener("click", ()=>{
    declineBtn.remove();
    acceptBtn.style.display = "none"
})