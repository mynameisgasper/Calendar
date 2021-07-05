const fs = require('fs');
var win = nw.Window.get();
win.resizeTo(1024,400);

today = new Date();
thisMonth = today.getMonth();
thisYear = today.getFullYear();
thisDay = today.getDate();

let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let holidays = [];

$(document).ready(function() {
    readFile();
    makeCalendar(thisYear, thisMonth);
    document.getElementById("datePicker").valueAsDate = today;
})

//read file and save holidays to array
function readFile() {
    var text;
    var dir = process.cwd();
    //check if prod or dev dir
    if (dir.substring(dir.length-3) == 'src') {
        text = fs.readFileSync('assets/holidays.txt','utf8');
    } else {
        text = fs.readFileSync('src/assets/holidays.txt','utf8');
    }

    //split by ,
    let holidaysSplit = text.split(",");


    let string = "";
    let repeating = "";
    let date = "";

    //seperate character for repeating holidays from holiday dates and save it to array
    for(let i = 0; i < holidaysSplit.length; i++) {
        
        if (i === 0) {
            string = holidaysSplit[i];
            repeating = string.charAt(0);
            date = string.substring(1).split(".");      //remove first char and split into day, month, year
        }
        else {
            string = holidaysSplit[i];
            repeating = string.charAt(1);
            date = string.substring(2).split(".");      //remove enter plus first char and split into day, month, year
        }
        holidays.push([repeating, date[2], date[1], date[0]]);  //character for repeating, year, month, day
    }
    console.log(holidays)
}

//change to next month
function nextMonth() {

    thisYear = (thisMonth == 11) ? thisYear+1 : thisYear;   //check if month is December and change year accordingly
    thisMonth = (thisMonth + 1) % 12;                       
    makeCalendar(thisYear, thisMonth);
}

//change to previous month
function previousMonth() {

    if(thisMonth == 0) {
        thisYear--;
        thisMonth = 11;
    }
    else {
        thisMonth--;
    }
    makeCalendar(thisYear, thisMonth);
}

//change to date picked from date picker
function datePick(date) {
    //split and change to integer
    let dateNumbers = date.split("-");
    let year = parseInt(dateNumbers[0],10);
    let month = parseInt(dateNumbers[1],10)-1;              //makeCalendar months are from 0-11
    thisDay = parseInt(dateNumbers[2],10);

    makeCalendar(year, month)
}

//read data from header on change and change calendar
function headerInput() {
    let month = document.getElementById("month_select").value;
    let year = document.getElementById("year_input").value;

    makeCalendar(year, month);
}

function makeCalendar(year, month) {

    //get first day of the month and number of days in month
    let firstDay = getFirstDayOfMonth(year, month);
    let totalDays = getNumberOfDays(year, month);

    //get table body and clear it
    let tableBody = document.getElementById("calendar_body");
    tableBody.innerHTML = "";

    //set day, year and month in table card
    let newDate = new Date(year, month, thisDay)
    document.getElementById("day").innerHTML = days[newDate.getDay()];
    document.getElementById("date").innerHTML = thisDay;
    document.getElementById("month_select").value = month;
    document.getElementById("year_input").value = year;

    date = 1;
    for (let i = 0 ; i < 6; i++) {                      //6 is max no. of weeks possible in one month
        
        //create new row
        let row = document.createElement("tr");
        tableBody.appendChild(row);

        //create cells and populate them
        for (let j = 0; j < 7; j++) {                   //7 days in a week
            
            if (i == 0 && j < firstDay) {               //if we're in first week and our position is lower than week day of starting day create empty cell       
                let cell = document.createElement("td");
                cell.innerHTML = "";
                row.appendChild(cell);
            }

            else if (date > totalDays) {                //if current position is greater than the number of days in specified month
                break;
            }

            else {                                      //insert cell and add date
                let cell = document.createElement("td");
                cell.innerHTML = date;
                
                //color all sundays
                if (j === 6) {
                    cell.style.backgroundColor = "#7400AE";
                }

                //check if it's holiday and color it
                let check = checkIfHoliday(year, parseInt(month)+1, date); //months in code are from 0-11 while in txt they're from 1-12
                if (check) {
                    cell.style.backgroundColor = "#E75480";
                    //cell.style.border = "1px solid #f7f3eb"; 
                    //cell.style.boxSizing = "border-box!important"; 
                    //cell.style.borderRadius = "200px!important";
                }


                row.appendChild(cell);
                date++;
            }
        }
    }
}

function getFirstDayOfMonth(year, month) {
    
    return (new Date(year, month, 0)).getDay();
}

function getNumberOfDays(year, month) {

    return (new Date(year, month + 1, 0)).getDate();
}

function checkIfHoliday(year, month, day) {

    let answer = false;
    for (let i = 0; i < holidays.length; i++) {
            
        if (year == holidays[i][1] && month == holidays[i][2] && day == holidays[i][3]) {
            answer = true; 
        }
        else if (month == holidays[i][2] && day == holidays[i][3] && 'P' == holidays[i][0]) {
            answer = true;
        }
    }

    return answer;
}