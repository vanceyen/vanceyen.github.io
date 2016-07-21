if (typeof DEBUG === 'undefined') DEBUG = false;

var BUGZILLA_URL = 'https://bugzilla.mozilla.org/rest/';
var querystr = "bug?assigned_to=vchen@mozilla.com";
google.load("visualization", "1", { packages: ["corechart", "table"] });


function transposeDataTable(dataTable) {
    //step 1: Create a new Table for stroing the data
    var newTB = new google.visualization.DataTable();
    newTB.addColumn('string', "Number of Iteration");
    newTB.addColumn('number', "Target Fix Numners");
    newTB.addColumn('number', "Actual Fix Numbers");
    //step 2: The 1 row in the old table will become the value of the first columns
    //get the row data first

    //Now put to new Table as the colmun

    var rows = [];
    for (var rowIdx = 0; rowIdx < dataTable.getNumberOfRows(); rowIdx++) {
        var rowData = [];
        for (var colIdx = 0; colIdx < dataTable.getNumberOfColumns(); colIdx++) {
            rowData.push(dataTable.getValue(rowIdx, colIdx));
        }
        rows.push(rowData);
    }

    newTB.addRows(dataTable.getNumberOfColumns() - 1);

    //Put data in rows into each column
    for (var i = 0; i < rows.length; i++) {
        //Get data of each row 
        var rowData = rows[i];
        console.log(rowData[0]);

        var localRowIdx = 0;

        for (var j = 1; j < rowData.length; j++) {
            newTB.setValue(localRowIdx, (i), rowData[j]);
            localRowIdx++;
        }
    }
    return newTB;
}

function fetchBug(param) {
    var xmlhttp;
    if (param == "") {
        //shouldn't happen actually
    }
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            /*
            document.getElementById("backlog").innerHTML =
                xhr.responseText;
             */

            var json = JSON.parse(xhr.responseText); //make to JSON, this one is needed no matter how    
            /* Another try to get the correct tabledata */

            var header = ['Bug ID', 'Bug Summary', 'Owner', 'Last Update'];
            var row = "";
            var rows = new Array();

            for (var i = 0, len = json.bugs.length; i < len; i++) {
                row = [json.bugs[i].id.toString(), json.bugs[i].summary, json.bugs[i].assigned_to, json.bugs[i].last_change_time];
                rows.push(row);

            }

            var jsonData = [header].concat(rows);
            var data = google.visualization.arrayToDataTable(jsonData);

            var view = new google.visualization.DataView(data);
            var table = new google.visualization.Table(document.getElementById('bugreport'));
            table.draw(view);

        }
    };
    xhr.open("GET", BUGZILLA_URL + querystr, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}

function fetchSpreadSheet() {
    var URL = 'https://docs.google.com/spreadsheets/d/12vjQ7F_UU5cNyKJIP9RLfZQn-FtBd1pDZHH9MB-T8mQ/edit#gid=1507342727';
    var query = new google.visualization.Query(URL);
    var cssClassNames = {
        'headerRow': 'italic-darkblue-font large-font bold-font',
        'tableRow': '',
        'oddTableRow': 'beige-background',
        'selectedTableRow': 'orange-background large-font',
        'hoverTableRow': '',
        'headerCell': 'gold-border',
        'tableCell': '',
        'rowNumberCell': 'underline-blue-font'
    };

    query.setQuery('SELECT A, C where C is not null limit 8');
    query.send(function(resp) {
        if (!resp.isError()) {
            var dataTable = resp.getDataTable();
            var view = new google.visualization.DataView(dataTable);
            var table = new google.visualization.Table(document.getElementById('mvptable'));
            var options = { 'cssClassNames': cssClassNames, 'width': '80%', 'height': '80%' };
            table.draw(view, options);
        }
    });

}

function drawburndownchart() {

    /* Draw the sprint burndown chart */

    var bdURL = 'https://docs.google.com/spreadsheets/d/12vjQ7F_UU5cNyKJIP9RLfZQn-FtBd1pDZHH9MB-T8mQ/gviz/tq?gid=1507342727&range=A52:V60&tq=';
    var bdquery = new google.visualization.Query(bdURL);
    bdquery.setQuery('SELECT D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V where (A contains "Averaged") or (A contains "#") or (A contains "Actual")');
    bdquery.send(function(resp) {
        if (!resp.isError()) {
            var dataTable = resp.getDataTable();

            //Tranpose the table
            var transposedData = transposeDataTable(dataTable);

            var engwrap = new google.visualization.ChartWrapper();
            engwrap.setChartType('LineChart');
            engwrap.setDataTable(transposedData);
            engwrap.setContainerId('burndownchart');
            engwrap.setOptions({ 'title': 'Sprint Burndown Chart', 'legend': 'bottom' });
            engwrap.draw();

        }
    });
}


function fetchTDCFirefoxMembers() {
    var mpURL = 'https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&tq=';
    var mpquery = new google.visualization.Query(mpURL);
    mpquery.setQuery('SELECT C, D where D matches "Firefox"');
    mpquery.send(function(resp) {
        if (!resp.isError()) {
            var dataTable = resp.getDataTable();
            var view = new google.visualization.DataView(dataTable);
            var table = new google.visualization.Table(document.getElementById('firefoxTeam'));
            table.draw(view);
        }
    });
}


function fetchMemberByManager() {
    var mpURL = 'https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&tq=';
    var mpquery = new google.visualization.Query(mpURL);
    mpquery.setQuery('SELECT A, C, E where B contains "Vance Chen"');
    mpquery.send(function(resp) {
        if (!resp.isError()) {
            var dataTable = resp.getDataTable();
            var view = new google.visualization.DataView(dataTable);
            var table = new google.visualization.Table(document.getElementById('ByManager'));
            table.draw(view);
        }
    });


}

//FIX ME : Refactoring when have time
function fetchTDCPlatformMembers() {
    var mpURL = 'https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&tq=';
    var mpquery = new google.visualization.Query(mpURL);
    mpquery.setQuery('SELECT C, D where D contains "Platform"');
    mpquery.send(function(resp) {
        if (!resp.isError()) {
            var dataTable = resp.getDataTable();
            var view = new google.visualization.DataView(dataTable);
            var table = new google.visualization.Table(document.getElementById('platformTeam'));
            table.draw(view);
        }
    });


}

function drawTDCGroupChart() {
    var mpURL = 'https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=645755704&tq=';
    var mpquery = new google.visualization.Query(mpURL);
    mpquery.setQuery('SELECT A, B limit 9');
    mpquery.send(function(resp) {
        if (!resp.isError()) {
            var dataTable = resp.getDataTable();
            var wrap = new google.visualization.ChartWrapper();
            wrap.setChartType('PieChart');
            wrap.setDataTable(dataTable);
            wrap.setContainerId('DrawGroup');
            wrap.setOptions({ 'title': 'Engineering Resource Distribution', 'legend': 'right', 'is3D': 'true' });
            wrap.draw();
        }
    });

    var qaquery = new google.visualization.Query('https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&range=A97:I107&tq=');
    qaquery.setQuery("select D, COUNT(C) group by D");
    qaquery.send(function(resp) {
        if (!resp.isError()) {


            var dataTable = resp.getDataTable();
            var qawrap = new google.visualization.ChartWrapper();
            qawrap.setChartType('PieChart');
            qawrap.setDataTable(dataTable);
            //qawrap.setDataSourceUrl('https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&tq=');
            qawrap.setContainerId('QAGroup');
            qawrap.setOptions({ 'title': 'QA Resource Distribution', 'legend': 'right', 'is3D': 'true' });
            qawrap.draw();
        }
    });

    var engquery = new google.visualization.Query('https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&range=A14:I96&tq=');
    engquery.setQuery("select D, COUNT(C) group by D");
    engquery.send(function(resp) {
        if (!resp.isError()) {


            var dataTable = resp.getDataTable();
            var engwrap = new google.visualization.ChartWrapper();
            engwrap.setChartType('PieChart');
            engwrap.setDataTable(dataTable);
            //qawrap.setDataSourceUrl('https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&tq=');
            engwrap.setContainerId('ENGGroup');
            engwrap.setOptions({ 'title': 'QA Resource Distribution', 'legend': 'right', 'is3D': 'true' });
            engwrap.draw();
        }
    });

    var engquery = new google.visualization.Query('https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&range=C4:E11&tq=');
    engquery.setQuery("select D, COUNT(C) group by D");
    engquery.send(function(resp) {
        if (!resp.isError()) {

            var dataTable = resp.getDataTable();
            var engwrap = new google.visualization.ChartWrapper();
            engwrap.setChartType('PieChart');
            engwrap.setDataTable(dataTable);
            //qawrap.setDataSourceUrl('https://docs.google.com/spreadsheets/d/10iFCHIBJT5RUoFDL1ct4QTU8NPL5wRyIjupXJgYYRVo/gviz/tq?gid=0&tq=');
            engwrap.setContainerId('EPMGroup');
            engwrap.setOptions({ 'title': 'EPM Resource Distribution', 'legend': 'right', 'is3D': 'true' });
            engwrap.draw();
        }
    });
}