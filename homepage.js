//mastest2
let customer1 = {
    "connectARN": "ce2575a1-6ad8-4694-abd6-53acf392c698",
    "contactFlowARN": "1165bcb6-ac61-4faf-b143-c77b25d1f792"
}

//mastest2instance2
let customer2 = {
    "connectARN": "d8445c54-35f2-4e65-ab0f-9c98889bdb0c",
    "contactFlowARN": "29ac3328-5529-4fd3-b51e-3aab08ec3432"
}

customer1Button = document.querySelector("#customer1")
customer2Button = document.querySelector("#customer2")
customer1Button.value = JSON.stringify(customer1)
customer2Button.value = JSON.stringify(customer2)
function redirect(arnObject) {
    let connectARN = arnObject.connectARN;
    let contactFlowARN = arnObject.contactFlowARN;
    location.href = `metrics.html?connectARN=${connectARN}&contactFlowARN=${contactFlowARN}`;
}

function parseARNObject(event) {
    let stringObject = event.target.value;
    let parsedObject = JSON.parse(stringObject)
    redirect(parsedObject)
}
customer1Button.addEventListener("click", parseARNObject)
customer2Button.addEventListener("click", parseARNObject)

window.onload = () => {
    let hash = window.location.hash;
    let token = hash.split("access_token=")[1].split("&")[0];
    sessionStorage.setItem("MetricVisionAccessToken", token)
}


