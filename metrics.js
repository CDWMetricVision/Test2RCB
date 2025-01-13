async function getARNQueryParams() {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let connectARN = urlParams.get("connectARN");
    let contactFlowARN = urlParams.get("contactFlowARN");
    return {
        "connectARN": connectARN,
        "contactFlowARN": contactFlowARN
    };
}

async function customTimeFetchCloudWatchData(customStartTimeandDate, customEndTimeandDate) {
    let baseURL = "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/Any";
    let customStartTimeParam = '';
    let customEndTimeParam = '';
    if (customStartTimeandDate && customEndTimeandDate) {
        customStartTimeParam = `&customStartTimeandDate=${customStartTimeandDate}`;
        customEndTimeParam = `&customEndTimeandDate=${customEndTimeandDate}`;
    }

    let arn = await getARNQueryParams();
    let paramURL = `${baseURL}/?connectARN=${arn["connectARN"]}&contactFlowARN=${arn["contactFlowARN"]}${customStartTimeParam}${customEndTimeParam}`;
    try {
        let token = sessionStorage.getItem("MetricVisionAccessToken");
        let response = await fetch(paramURL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            console.log(response);
            return {
                "errorMessage": response,
                "result": false
            };
        } else {
            let cloudWatchData = await response.json();
            sessionStorage.setItem("MetricVisionData", cloudWatchData);
            return {
                "data": cloudWatchData,
                "result": true
            };
        }
    } catch (err) {
        console.log(err);
        return {
            "errorMessage": err,
            "result": false
        };
    }
}

function cleanMetricName(metricName) {
    let cleanMetricName = metricName.replace(/_/g, ' ').split(' ');
    cleanMetricName = cleanMetricName.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return cleanMetricName.join(' ');
}

async function displayMetricTableData() {
    let loadingModal = document.createElement("p");
    loadingModal.innerHTML = "loading . . .";
    let sectionHeader = document.querySelector(".loading");
    sectionHeader.append(loadingModal);
    let data = await customTimeFetchCloudWatchData("", "");

    if (!data.result) {
        sectionHeader.removeChild(loadingModal);
        let error = document.createElement("p");
        error.innerHTML = `Error: ${data.errorMessage.status}`;
        sectionHeader.appendChild(error);
        return;
    } else {
        sessionStorage.setItem("MetricVisionData", JSON.stringify(data.data.MetricDataResults));
        sectionHeader.removeChild(loadingModal);
        let results = document.querySelector("#results");
        results.remove(); // Remove the existing content
        let newResults = document.querySelector("#dataTables");
        let section = document.createElement("div");
        section.setAttribute("id", "results");
        newResults.appendChild(section);

        let metricDataResults = data.data.MetricDataResults.length;

        // Loop through all metric data and create charts with LineGauge view by default
        for (let i = 0; i < metricDataResults; i++) {
            createTableLineGauge(data.data.MetricDataResults[i]);
        }
    }
}

function createTableLineGauge(data) {
    // Create a container row for each chart (table, line chart, and gauge)
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    let section = document.createElement("section");
    section.classList.add("col", "d-flex");
    section.setAttribute("id", data.Id);
    let results = document.querySelector("#results");
    rowDiv.appendChild(section);
    results.appendChild(rowDiv);

    // Create a table, line graph, and gauge for each metric
    createTable(data, section);
    createLineGraphNew(data, section);
    createGauge(data, section);

    // Add icons to switch between different views (table, line chart, gauge)
    createIcons(section);
}

function createIcons(container) {
    let tableIcon = document.createElement("i");
    tableIcon.classList.add("tableChart", "fa-solid", "fa-table", "fa-xl", "icon");
    let chartIcon = document.createElement("i");
    chartIcon.classList.add("lineChart", "fa-solid", "fa-chart-line", "fa-xl", "icon");
    let gaugeIcon = document.createElement("i");
    gaugeIcon.classList.add("gaugeChart","fa-solid", "fa-gauge", "fa-xl", "icon");
    chartIcon.addEventListener("click", hideOtherCharts);
    tableIcon.addEventListener("click", hideOtherCharts);
    gaugeIcon.addEventListener("click", hideOtherCharts);
    container.append(tableIcon, chartIcon, gaugeIcon);
}

function hideOtherCharts(e) {
    let target = e.target.classList[0].replace("Chart", '');
    let parentNodeList = e.target.parentElement.childNodes;
    let section = [];
    for (i = 0; i < parentNodeList.length; i++) {
        if (parentNodeList[i].nodeName === "SECTION") {
            section.push(parentNodeList[i]);
        }
    }
    for (i = 0; i < section.length; i++) {
        if (section[i].id.includes(target)) {
            section[i].setAttribute("style", "display: block");
        } else {
            section[i].setAttribute("style", "display: none !important;");
        }
    }
}

// Default to LineChart view on page load
document.addEventListener("DOMContentLoaded", function () {
    displayMetricTableData(); // Call to load data and show charts
    let defaultChartIcon = document.querySelector('.lineChart'); // Default to LineChart
    defaultChartIcon.click();
});

function createGauge(data, container) {
    let values = data["Values"];
    let min, max, avg, sum;
    if (values.length === 0) {
        min = 0;
        max = 1;
        avg = 0;
        sum = 0;
    } else {
        min = Math.min(...values);
        max = Math.max(...values);
        sum = values.reduce((acc, num) => acc + num, 0);
        avg = parseFloat((sum / values.length).toFixed(2));
    }

    let dataSet = anychart.data.set([avg]);
    let gauge = anychart.gauges.circular();
    gauge.data(dataSet);
    gauge.startAngle(270);
    gauge.sweepAngle(180);
    let axis = gauge.axis().radius(95).width(1);

    axis.scale().minimum(min).maximum(max);
    axis.ticks().enabled(true).type('line').length('8');

    gauge.range({
        from: min,
        to: max,
        fill: {keys: ["green", "yellow", "orange" , "red"]},
        position: "inside",
        radius: 100,
        endSize: "3%",
        startSize:"3%",
        zIndex: 10
    });
    gauge.fill("lightblue", .3);

    gauge.needle(0).enabled(true).startRadius('-5%').endRadius('65%').middleRadius(0)
    .startWidth('0.1%').endWidth('0.1%').middleWidth('5%');

    let section = document.createElement("section");
    section.classList.add("flex-grow-1", "d-flex", "justify-content-around", "flex-wrap", "align-items-center");
    section.setAttribute("Id", `gauge_${data.Id}`);

    let metricNameDiv = document.createElement("div");
    metricNameDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    let metricNameTextDiv = document.createElement("b");
    metricNameTextDiv.innerHTML = cleanMetricName(data.Id);
    metricNameDiv.appendChild(metricNameTextDiv);

    let minMaxDiv = document.createElement("div");
    minMaxDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    let minDiv = document.createElement("div");
    let minLabelDiv = document.createElement("div");
    let maxDiv = document.createElement("div");
    let maxLabelDiv = document.createElement("div");
    minDiv.innerHTML = min;
    minLabelDiv.innerHTML = "Minimum";
    maxDiv.innerHTML = max;
    maxLabelDiv.innerHTML = "Maximum";
    minMaxDiv.append(minDiv, minLabelDiv, maxDiv, maxLabelDiv);

    let avgSumDiv = document.createElement("div");
    avgSumDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    let avgDiv = document.createElement("div");
    let avgLabelDiv = document.createElement("div");
    let sumDiv = document.createElement("div");
    let sumLabelDiv = document.createElement("div");
    avgDiv.innerHTML = avg;
    avgLabelDiv.innerHTML = "Average";
    sumDiv.innerHTML = sum;
    sumLabelDiv.innerHTML = "Sum";
    avgSumDiv.append(avgDiv, avgLabelDiv, sumDiv, sumLabelDiv);

    section.append(metricNameDiv, minMaxDiv, avgSumDiv);

    let gaugeDiv = document.createElement("div");
    let containerId = `guage_${data.Id}_container`;
    gaugeDiv.setAttribute("id", containerId);
    gauge.container(gaugeDiv).draw();
    section.append(gaugeDiv);
    section.setAttribute("style", "display: none !important");
    container.append(section);
}

function createLineGraphNew(data, container) {
    let metric = data.Id;
    let chartMetricData = [];
    for (let i = 0; i < data["Timestamps"].length; i++) {
        let chartData = [];
        chartData.push(data["Timestamps"][i], data["Values"][i]);
        chartMetricData.push(chartData);
    }
    let graphData = {
        "title": metric,
        "xAxis": "Interval",
        "yAxis": metric,
        "data": chartMetricData
    };
    chartLineGraph(graphData, container);
}

function chartLineGraph(graphData, container) {
    let {title, xAxis, yAxis, data} = graphData;
    let chart = anychart.line();
    chart.data(data);
    chart.title(cleanMetricName(title));
    chart.xAxis().title(xAxis);

    let flexDiv = document.createElement("section");
    flexDiv.classList.add("flex-grow-1");
    let flexDivId = `lineChart_${title}`;
    flexDiv.setAttribute("id", flexDivId);
    flexDiv.setAttribute("style", "display: none !important");

    chart.container(flexDiv);
    chart.draw();
    container.appendChild(flexDiv);
}

function createTable(data, container) {
    let metricLabel = cleanMetricName(data.Id);
    let tableWrapper = document.createElement("section");
    tableWrapper.setAttribute("class", "table-responsive");
    tableWrapper.setAttribute("id", `table_${data.Id}`);
    let table = document.createElement("table");
    table.setAttribute("class", "table");
    let tableHead = document.createElement("thead");
    let headerRow = document.createElement("tr");
