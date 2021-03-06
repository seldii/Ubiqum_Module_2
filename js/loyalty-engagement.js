const urlSenate = 'https://api.propublica.org/congress/v1/113/senate/members.json';
const urlHouse = 'https://api.propublica.org/congress/v1/113/house/members.json';

const opts = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": "OIg3ZQb6kfxzrPqdtMPvwGGFqW2UIRP8SP6ILTjR"
    }
}

let url = "";
//let headerArr = "";

if (document.title.includes("Senate")) {
    url = urlSenate;
 
} else if (document.title.includes("House")) {
    url = urlHouse;
    
};


if (document.title.includes("Attendance") || document.title.includes("Loyalty") ) {
    showLoader()
    fetch(url, opts)
        .then(res => res.json())
        .then(function (data) {
            data = data.results[0].members;
            hideLoader()
            getPartyArr(data)
            generateTable()
            loyaltyAndEngagement(data)
            createTableEngandLoy()

        })
        .catch(console.error);

};


function showLoader() {
    let spinners = document.getElementsByTagName("table")
    Array.from(spinners).forEach(spinner => {
        spinner.innerHTML = `<div class="spinner-border" role="status" id="spinn">
                    <span class="sr-only">Loading...</span>
                </div>`
    })
};

function hideLoader() {
    let loaders = document.getElementsByTagName("table");
    Array.from(loaders).forEach(loader => {
        loader.innerHTML = "";
    })

};



var statistic = {
    "Democrats": {
        "NoOfReps": 0,
        "AveVotedWParty": 0,

    },
    "Republicans": {
        "NoOfReps": 0,
        "AveVotedWParty": 0,

    },
    "Independents": {
        "NoOfReps": 0,
        "AveVotedWParty": 0,

    },

    "Total": {
        "NoOfReps": 0,
        "AveVotedWParty": 0,
        "LeastEngagedGuys": [],
        "MostEngagedGuys": [],
        "LeastLoyalGuys": [],
        "MostLoyalGuys": [],

    }


};


function getPartyArr(data) {

    var democratsArr = [];
    var republicanArr = [];
    var independentArr = [];

    data.forEach(function (member) {
        if (member.party.includes("D"))
            democratsArr.push(member)
    })

    data.forEach(function (member) {
        if (member.party.includes("R"))
            republicanArr.push(member)
    })


    data.forEach(function (member) {
        if (member.party.includes("I"))
            independentArr.push(member)
    })

    function averageVoteWithParty(partyArr) {
        var votesWpartyArr = partyArr.map(x => x.votes_with_party_pct);
        var arrSum = arr => arr.reduce((a, b) => a + b, 0);

        if (partyArr.length === 0) return "-";

        return (arrSum(votesWpartyArr) / partyArr.length).toFixed(2);


    }

    //Democrats

    statistic.Democrats.NoOfReps = JSON.stringify(democratsArr.length);

    statistic.Democrats.AveVotedWParty = averageVoteWithParty(democratsArr);



    //Republicans

    statistic.Republicans.NoOfReps = JSON.stringify(republicanArr.length);

    statistic.Republicans.AveVotedWParty = averageVoteWithParty(republicanArr);



    //Independents

    statistic.Independents.NoOfReps = JSON.stringify(independentArr.length);

    statistic.Independents.AveVotedWParty = averageVoteWithParty(independentArr);

    //Total

    statistic.Total.NoOfReps = JSON.stringify(data.length)
    statistic.Total.AveVotedWParty = averageVoteWithParty(data);


}



//Average vote w/ party for Parties




function loyaltyAndEngagement(data) {

    var mostLoyalGuys = [];
    var leastLoyalGuys = [];
    var votesWpartyArr = data.map(x => x.votes_with_party_pct);
    var reverseVotesWpartyArr = [];
    var firstTenPercentNum = Math.round(data.length * 0.1);

    votesWpartyArr.sort(function (a, b) {
        return a - b;
    });

    reverseVotesWpartyArr = votesWpartyArr.slice().reverse()


    var firstTenPerMostLoyal = reverseVotesWpartyArr.slice(0, firstTenPercentNum);

    for (var j = 0; j < data.length; j++) {

        if (firstTenPerMostLoyal.includes(data[j].votes_with_party_pct)) {

            mostLoyalGuys.push(data[j]);

        }

    }


    var firstTenPerLeastLoyal = votesWpartyArr.slice(0, firstTenPercentNum);


    for (var j = 0; j < data.length; j++) {

        if (firstTenPerLeastLoyal.includes(data[j].votes_with_party_pct)) {

            leastLoyalGuys.push(data[j]);

        }

    }

    statistic.Total.MostLoyalGuys = JSON.stringify(mostLoyalGuys);
    statistic.Total.LeastLoyalGuys = JSON.stringify(leastLoyalGuys);


    var leastEngagedGuys = [];
    var mostEngagedGuys = [];
    var missedVotesPerc = data.map(x => x.missed_votes_pct);
    var reverseMissedVotesPerc = [];

    missedVotesPerc.sort(function (a, b) {
        return a - b;
    });

    reverseMissedVotesPerc = missedVotesPerc.slice().reverse();



    var firstTenPerLeastEngaged = reverseMissedVotesPerc.slice(0, firstTenPercentNum);

    for (var j = 0; j < data.length; j++) {

        if (firstTenPerLeastEngaged.includes(data[j].missed_votes_pct)) {

            leastEngagedGuys.push(data[j]);

        }

    }

    var firstTenPerMostEngaged = missedVotesPerc.slice(0, firstTenPercentNum);

    for (var j = 0; j < data.length; j++) {

        if (firstTenPerMostEngaged.includes(data[j].missed_votes_pct)) {

            mostEngagedGuys.push(data[j]);

        }

    }

    statistic.Total.LeastEngagedGuys = JSON.stringify(leastEngagedGuys);

    statistic.Total.MostEngagedGuys = JSON.stringify(mostEngagedGuys);



}






//Create the table


var tbl = document.querySelector("#table");

var senateAtAGlance = ["Party", "Nº of Reps", "% Voted with Party"];



function createTHead(table, headerArr) {

    var tHead = document.createElement("thead");
    table.appendChild(tHead);
    var row = tHead.insertRow(-1)


    for (var i = 0; i < headerArr.length; i++) {
        var th = document.createElement("th");
        var text = document.createTextNode(headerArr[i]);
        row.appendChild(th);
        th.appendChild(text);

    }
}




//
//Create the tables
//


//first table

function generateTable() {
    var PartyName;
    var NoOfReps;
    var AvgPerc;
    var i;
    var tblBody = document.createElement("tbody");
    tbl.appendChild(tblBody);

    for (i in statistic) {
        if (statistic.hasOwnProperty(i)) {
            var newTr = tblBody.insertRow(-1);

            PartyName = "<td>" + i + "</td>";
            newTr.insertAdjacentHTML("beforeend", PartyName);

            NoOfReps = "<td>" + statistic[i].NoOfReps + "</td>";
            newTr.insertAdjacentHTML("beforeend", NoOfReps);

            AvgPerc = "<td>" + statistic[i].AveVotedWParty + "</td>";
            newTr.insertAdjacentHTML("beforeend", AvgPerc);
        }

    }

    createTHead(tbl, senateAtAGlance)

}




var tblSecond = document.getElementById("leastEngaged");

var engagementLevel = ["Name", "Nº of Missed Votes", "% Missed"];

var tblThird = document.getElementById("mostEngaged");


function generateTableEngagement(membersArr, table) {

    var senatorName;
    var senatorUrl
    var senatorNameWLink;
    var noOfMissedVotes;
    var percentMissed;
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    membersArr.forEach(member => {
        var newTr = tbody.insertRow(-1);

        if (member.middle_name === null) {
            member.middle_name = "";
        };
        senatorName = member.last_name + ", " + member.middle_name + " " + member.first_name;

        senatorUrl = "<a class='iframe_colorbox' target='_blank' href=" + member.url + ">" + senatorName + "</a>";
        senatorNameWLink = "<td>" + senatorUrl + "</td>";
        newTr.insertAdjacentHTML("beforeend", senatorNameWLink);
        noOfMissedVotes = "<td>" + member.missed_votes + "</td>";
        newTr.insertAdjacentHTML("beforeend", noOfMissedVotes);
        percentMissed = "<td>" + member.missed_votes_pct + "</td>";
        newTr.insertAdjacentHTML("beforeend", percentMissed);

    });


    createTHead(table, engagementLevel)
}







//
//Loyalty Page Tables
//


var tblSecondLoyalty = document.getElementById("leastLoyal");

var tblThirdLoyalty = document.getElementById("mostLoyal");

var loyaltyLevel = ["Name", "Nº of Party Votes", "% Party Votes"];



function generateTableLoyalty(membersArr, table) {


    var senatorName;
    var senatorUrl
    var senatorNameWLink;
    var noOfPartyVotes;
    var percentParty;
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    membersArr.forEach(member => {
        var newTr = tbody.insertRow(-1);
        if (member.middle_name === null) {
            member.middle_name = "";
        };
        senatorName = member.last_name + ", " + member.middle_name + " " + member.first_name;

        senatorUrl = "<a class='iframe_colorbox' target='_blank' href=" + member.url + ">" + senatorName + "</a>";
        senatorNameWLink = "<td>" + senatorUrl + "</td>";
        newTr.insertAdjacentHTML("beforeend", senatorNameWLink);
        noOfPartyVotes = "<td>" + member.total_votes + "</td>";
        newTr.insertAdjacentHTML("beforeend", noOfPartyVotes);
        percentParty = "<td>" + member.votes_with_party_pct + "</td>";
        newTr.insertAdjacentHTML("beforeend", percentParty);

    });
    createTHead(table, loyaltyLevel)

}



function createTableEngandLoy() {

    if (document.title.includes("Party Loyalty")) {
        var leastLoyalMembers = JSON.parse(statistic.Total.LeastLoyalGuys);
        var mostLoyalMembers = JSON.parse(statistic.Total.MostLoyalGuys);

        generateTableLoyalty(leastLoyalMembers, tblSecondLoyalty)
        generateTableLoyalty(mostLoyalMembers, tblThirdLoyalty)
    }



    if (document.title.includes("Attendance")) {

        var leastEngagedMembers = JSON.parse(statistic.Total.LeastEngagedGuys);
        var mostEngagedMembers = JSON.parse(statistic.Total.MostEngagedGuys);
        generateTableEngagement(leastEngagedMembers, tblSecond)
        generateTableEngagement(mostEngagedMembers, tblThird)

    }

}






