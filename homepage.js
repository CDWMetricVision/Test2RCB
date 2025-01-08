//sandboxdev AWS Connect instance
let customer1 = {
    "connectARN": "08aaaa8c-2bbf-4571-8570-f853f6b7dba0",
    "contactFlowARN": "669aa1e2-2530-4475-8ec8-693ee6b84c1d"
}

//mastest1 AWS Connect instance
let customer2 = {
    "connectARN": "08aaaa8c-2bbf-4571-8570-f853f6b7dba0",
    "contactFlowARN": "669aa1e2-2530-4475-8ec8-693ee6b84c1d"
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


