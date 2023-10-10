let fullData;
//let postitionArray;


d3.json("/data").then((data) => {
    //console.log(data);
    fullData = data;
    initPlayer1ID = fullData[0].espn_player_id;
    initPlayer1Image = `https://a.espncdn.com/i/headshots/nfl/players/full/${initPlayer1ID}.png`;
    document.getElementById("player1Image").src = initPlayer1Image;

    initTeamAbbr = fullData[0].team_abbr;
    initTeamLogo = `https://a.espncdn.com/i/teamlogos/nfl/500/${initTeamAbbr}.png`;    
    document.getElementById("teamLogo").src = initTeamLogo;

    //jm////////////////////////////////////////////////////////////
    document.getElementById("player2Image").src = initPlayer1Image;
    //jm/////////////////////////////////////////////////////////////

    //jm///////////////////////////////////////////////////////////////
    const playersByTeam = fullData.filter(player => player.team === fullData[0].team);
    //jm/////////////////////////////////////////////////////////////////////

    const playerNames = data.map(player => player.fullNameForSearch);
    const teamNames = [...new Set(data.map(player => player.team))];
    const columnNames = Object.keys(fullData[0]);
    const skills = columnNames.slice(7, 59); skills.push("throwAccuracyDeep");skills.push("throwAccuracyMid");skills.push("throwAccuracyShort");skills.push("throwOnTheRun");
    skills.push("throwUnderPressure");skills.push("throwOnTheRun"); skills.push("throwPower"); skills.push("breakSack"); skills.push("agility"); skills.push("bCVision"); skills.push("trucking"); skills.push("zoneCoverage"); 
    skills.sort();
 
    populateTeamDropdown(teamNames);
    populateSkillDropdown(skills);
    const topByTeam = getTopTenByTeam(fullData, teamNames[0]);

    //jm///////////////////////////////////////
    populatePlayer1Dropdown(playerNames);   //
    populatePlayer2Dropdown(playerNames);   //
    populatePlayerList(playersByTeam);      //
    //jm////////////////////////////////////////
    
    //box plot
    
    $("#selPlayer1").selectize();
    
    //jm///////////////////////////////
    $("#selPlayer2").selectize();       //
    //jm///////////////////////////////
    
    $("#selTeam").selectize();
    $("#selSkill").selectize();
    
    //jm/////////////////////////////////////////////////////////
    $("#selStatComp").selectize();                            //
    var selectizeControl = $('#selStatComp')[0].selectize;    //
    selectizeControl.addItem("overall");                       //
    selectizeControl.addItem("speed");                         //
    selectizeControl.addItem("strength");                     //
    selectizeControl.addItem("agility"); 
    skills.sort();                     //
    //jm////////////////////////////////////////////////////////
    
    // Get the selectize control
    var selectizeControl = $('#selStatComp')[0].selectize;
    
    // Modify the width and height
    selectizeControl.$control.css({
        'width': '300px',  // Adjust the width as needed
        'height': '200px'   // Adjust the height as needed
    });
    
    //initialize player detail section
    
    teamBarChart(topByTeam);
    boxPlotStats(fullData, "agility");
    
    //jm/////////////////////////////////////////////////////
    barCompare(fullData, playerNames[0], playerNames[0], selectizeControl.items); 
    //jm/////////////////////////////////////////////////////
    
    $(document).ready(function(){
        $('#selPlayer1').next('.selectize-control').hide();
        showPlayerDetails(fullData[0]);
        $("#headerBG").css("background-color", fullData[0].team_alt_color);
        //$("#headerBG").css("background-color", "#000000");
        //console.log(fullData[0].team_alt_color);

    });
    
    
});

//jm////////////////////////////////////////////////////////////
function barCompare(data, player1, player2, selectedStats) {

    const p1Data = data.filter(player => player.fullNameForSearch === player1)[0];
    const p2Data = data.filter(player => player.fullNameForSearch === player2)[0];

    const p1TeamColorArray = p1Data.team_color;
    const p1TeamColorString = `rgb(${p1TeamColorArray.join(',')})`;
    const p1ColorsArray = Array(data.length).fill(p1TeamColorString); 
    
    const p2TeamColorArray = p2Data.team_color;
    const p2TeamColorString = `rgb(${p2TeamColorArray.join(',')})`;
    const p2ColorsArray = Array(data.length).fill(p2TeamColorString); 

    const plotData = []
    // const statsToCompare = selectedStats;
    selectedStats.forEach(stat => {
       const p1Trace = {
            type: "bar",
            x: [stat],
            y: [p1Data[stat]],
            name: `${p1Data.fullNameForSearch} - ${stat}`,
            marker: {color: p1ColorsArray},
            width: 0.2,
        };
        
        const p2Trace = {
            type: "bar",
            x: [stat],
            y: [p2Data[stat]],
            name: `${p2Data.fullNameForSearch} - ${stat}`,
            marker: {color: p2ColorsArray},
            width: 0.2,
        };
        plotData.push(p1Trace, p2Trace);
    })

    
    const layout = {
        barmode: "group",
        title: "Stat Comparison",
        // xaxis: {
        //     title: "Stats"
        // }, 
        // yaxis: {
        //     title: "Value"
        // },
        bargap: 0.00005,
        bargroupgap: 0.000005,
        showlegend: false,
        height: 600,
        width: 1500,
        font: {
            size: 30,
          },
    }

    // const transition = {
    //     duration: 500,
    //     easing: 'cubic-in-out'
    // };

    const animation = {
        transition: { 
            duration: 1000 
        }, 
        frame: { 
            duration: 1000, 
            redraw: true 
        } 
    };

    Plotly.react("compBar", plotData, layout).then(() => {
        return Plotly.animate("compBar", {
            data: plotData,
            layout: layout,
            //transition: transition,
            animation: animation,
        });
    });
    
    //Plotly.newPlot("compBar", plotData, layout);
}
//jm///////////////////////////////////////////////////////////////////

function boxPlotStats(data, stat) {

    var groupedData = {};
    data.forEach(function(d) {
        //console.log(d.position);
        if (!groupedData[d.position]) groupedData[d.position] = [];
        groupedData[d.position].push(d[stat]);
    });

    var plotData = Object.keys(groupedData).map(function(position, i) {
        return {
          y: groupedData[position],
          type: 'box',
          name: position
        };
      });

    var layout = {
        title: stat.charAt(0).toUpperCase() + stat.slice(1) + ' by Position',
        yaxis: {
            // title: stat.charAt(0).toUpperCase() + stat.slice(1)
            },
            height: 600,
            width: 1300,
            font: {
                size: 30,
            },
        showlegend: false,
    };

    Plotly.newPlot('posBoxChart', plotData, layout); 
   
}

function animateBoxPlotStats(data, stat) {

    var groupedData = {};
    data.forEach(function(d) {
        //console.log(d.position);
        if (!groupedData[d.position]) groupedData[d.position] = [];
        groupedData[d.position].push(d[stat]);
    });

    var plotData = Object.keys(groupedData).map(function(position, i) {
        return {
          y: groupedData[position],
          type: 'box',
          name: position
        };
      });

      var layout = {
        title: stat.charAt(0).toUpperCase() + stat.slice(1) + ' by Position',
        yaxis: {
            // title: stat.charAt(0).toUpperCase() + stat.slice(1)
            },
            height: 600,
            width: 1300,
            font: {
                size: 30,
            },
        showlegend: false,
    };

    const config = {reactive: true}

    Plotly.react('posBoxChart', plotData, layout, config);

    // const animation = {
    //     transition: { 
    //         duration: 1000 
    //     }, 
    //     frame: { 
    //         duration: 1000, 
    //         redraw: true 
    //     } 
    // };

    // Plotly.update('posBoxChart', {
    //     data: plotData,
    //     layout: layout,
    // })
    // .then(() => {
    //     Plotly.animate('posBoxChart', {
    //         data: plotData,
    //         layout: layout,
    //     }, animation);
    // });    
}

function populatePlayer1Dropdown(playerNames) {

    const dropdown = d3.select("#selPlayer1").node();
    // const firstElmnt = document.createElement("option");

    // firstElmnt.val = "";
    // firstElmnt.textContent = "";
    // dropdown.appendChild(firstElmnt);

    for (let i = 0; i < playerNames.length; i++) {
        const opt = playerNames[i];
        const elmnt = document.createElement("option");
        elmnt.textContent = opt;
        elmnt.value = opt;
        dropdown.appendChild(elmnt);
    }
}

//jm/////////////////////////////////////////////////////////////////
function populatePlayer2Dropdown(playerNames) {

    const dropdown = d3.select("#selPlayer2").node();
    // const firstElmnt = document.createElement("option");

    // firstElmnt.val = "";
    // firstElmnt.textContent = "";
    // dropdown.appendChild(firstElmnt);

    for (let i = 0; i < playerNames.length; i++) {
        const opt = playerNames[i];
        const elmnt = document.createElement("option");
        elmnt.textContent = opt;
        elmnt.value = opt;
        dropdown.appendChild(elmnt);
    }
}
//jm///////////////////////////////////////////////////////////////////

function populateTeamDropdown(teamNames) {
    
    const dropdown = d3.select("#selTeam").node();
    for (let i = 0; i < teamNames.length; i++) {
        const opt = teamNames[i];
        const elmnt = document.createElement("option");
        elmnt.textContent = opt;
        elmnt.value = opt;
        dropdown.appendChild(elmnt);
    }

}



function populateSkillDropdown(skills) {
    
    const dropdown = d3.select("#selSkill").node();
    for (let i = 0; i < skills.length; i++) {
        const opt = skills[i];
        //convert the string from camelCase to Title Case
        const result = opt.replace(/([A-Z])/g, " $1");
        const finalResult = result.charAt(0).toUpperCase() + result.slice(1);

        const elmnt = document.createElement("option");
        elmnt.textContent = finalResult;
        elmnt.value = opt;
        dropdown.appendChild(elmnt);
    }

    
    //jm/////////////////////////////////////////////////////////////////////////////////////
    const selStatComp = d3.select("#selStatComp").node();
    for (let i = 0; i < skills.length; i++) {
        const opt = skills[i];
        //convert the string from camelCase to Title Case
        const result = opt.replace(/([A-Z])/g, " $1");
        const finalResult = result.charAt(0).toUpperCase() + result.slice(1);

        const elmnt = document.createElement("option");
        elmnt.textContent = finalResult;
        elmnt.value = opt;
        selStatComp.appendChild(elmnt);
    }
    //jm/////////////////////////////////////////////////////////////////////////////////
}

function getTopTenByTeam(data, team) {

    const playersByTeam = data.filter(player => player.team === team);
    const sortedByOverall = playersByTeam.sort((playerA, playerB) => {
        playerB.overall - playerA.overall;
    })

    //console.log(sortedByOverall.slice(0, 10));
    return sortedByOverall.slice(0, 10);

}

function teamBarChart(data) {

    //console.log(data);

    const names = data.map(player => player.fullNameForSearch);
    const overallRatings = data.map(player => player.overall);
    /*team_color is stored as array of 3 values
    plotly takes a array of strings in the format
    "rgb(r,g,b)". the array must be the same length as x and y*/
    const teamColorArray = data[0].team_color;
    const teamColorString = `rgb(${teamColorArray.join(',')})`;
    const colorsArray = Array(data.length).fill(teamColorString);    

    const trace = {
        type: "bar",
        x: names,
        y: overallRatings,
        marker: {
            color: colorsArray,
        }
    }

    const plotData = [trace];
    const layout = {
        height: 600,
        width: 1850,
        title: `<b>${data[0].team} Top 10 Overall Players</b>`,
        displayModeBar: false,
        displaylogo: false,
        yaxis: {
            range: [0, 100],
        },
        xaxis: {
            tickfont: {
                size: 18,
            }
        },
        font: {
            size: 30,
        },
    };
    const config = {
            displayModeBar: false,
        };

    Plotly.newPlot("teamBarChart", plotData, layout, config);

    

}

function animateTeamBarChart(data) {
    //animate transition to new data
    const names = data.map(player => player.fullNameForSearch);
    const overallRatings = data.map(player => player.overall);
    /*team_color is stored as array of 3 values
    plotly takes a array of strings in the format
    "rgb(r,g,b)". the array must be the same length as x and y*/
    const teamColorArray = data[0].team_color;
    const teamColorString = `rgb(${teamColorArray.join(',')})`;
    const colorsArray = Array(data.length).fill(teamColorString);    

    const updatedTrace = {
        type: "bar",
        x: names,
        y: overallRatings,
        marker: {
            color: colorsArray,
        }
    }

    const updatedLayout = {
        title: `<b>${data[0].team} Top 10 Overall Players</b>`,
        xaxis: {
            tickvals: names,
            ticktext: names,
        },
        yaxis: {
            range: [0, 100],
        }
    }

    const animation = {
        transition: { 
            duration: 1000 
        }, 
        frame: { 
            duration: 1000, 
            redraw: true 
        } 
    };

    Plotly.update('teamBarChart', {
        data: updatedTrace,
        layout: updatedLayout,
    })
    .then(() => {
        Plotly.animate('teamBarChart', {
            data: [updatedTrace],
            layout: updatedLayout
        }, animation);
    });
}

function populatePlayerList(players) {
    // Clear existing player list
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";

    // Create list items for each player
    players.forEach(player => {
        const listItem = document.createElement("li");
        // Create a span for the jersey number
        const jerseySpan = document.createElement("span");
        jerseySpan.textContent = `#${player.jerseyNum}`;
        jerseySpan.classList.add("jersey-number"); // You can add a CSS class for styling
        // Append the jersey number span and player name to the list item
        listItem.classList.add("list-group-item");
        listItem.appendChild(jerseySpan);
        listItem.appendChild(document.createTextNode(" ")); // Add a space here
        listItem.appendChild(document.createTextNode(player.fullNameForSearch));

        listItem.addEventListener("click", () => showPlayerDetails(player));
        listItem.addEventListener("click", () => playerListItemClicked(player));
        
        playerList.appendChild(listItem);
    });
}


function showPlayerDetails(player) {
    // Display player details in the playerDetails div
    const playerDetails = document.getElementById("playerDetails");
    const playerImage = document.getElementById("player1Image");
    
    
    playerDetails.innerHTML = `
        <h4>${player.fullNameForSearch}</h4>
        <p>Position: ${player.position}</p>
        <p>Overall Rating: ${player.overall}</p>
        <p>Team: ${player.team}</p>
        <p>Years Pro: ${player.yearsPro}</p>
        <p>Total Salary: ${player.totalSalary}</p>
        <p>Bonus: ${player.signingBonus}</p>
        <p>College: ${player.college}</p>
        <p>Handedness: ${player.plyrHandedness}</p>
    `;


    const espn_id = player.espn_player_id;
    const newImage = `https://a.espncdn.com/i/headshots/nfl/players/full/${espn_id}.png`;
    playerImage.src = newImage;
}



function teamChanged(val) {
    const topByTeam = getTopTenByTeam(fullData, val);
    animateTeamBarChart(topByTeam);

    const playersByTeam = fullData.filter(player => player.team === val);
    populatePlayerList(playersByTeam);
    //console.log(playersByTeam);

    player1Changed(playersByTeam[0].fullNameForSearch); //need to get player name - i will have to get the first value of playersByTeam
    //console.log(playersByTeam[0].fullNameForSearch);

    showPlayerDetails(playersByTeam[0]);    

    var selectizeApi = $('#selPlayer1')[0].selectize;
    selectizeApi.setValue(playersByTeam[0].fullNameForSearch);

    team_abbr = newPlayer[0].team_abbr;  
    
    newImage = `https://a.espncdn.com/i/teamlogos/nfl/500/${team_abbr}.png`;    
    document.getElementById("teamLogo").src = newImage;

    $("#headerBG").css("background-color", newPlayer[0].team_alt_color);

}

function skillChanged(val) {
    //boxPlotStats(fullData, val);
    animateBoxPlotStats(fullData, val);
}

function player1Changed(val) {
    //jm///////////////////////////////////////////////////////////////
    const selPlayer2 = document.getElementById("selPlayer2").value;
    player2Data = fullData.filter(player => player.fullNameForSearch === selPlayer2);
    //jm////////////////////////////////////////////////////////////////

    
    newPlayer = fullData.filter(player => player.fullNameForSearch === val);
    //console.log(newPlayer);
    espn_id = newPlayer[0].espn_player_id;
    // console.log(espn_id);
    
    newImage = `https://a.espncdn.com/i/headshots/nfl/players/full/${espn_id}.png`;
    
    document.getElementById("player1Image").src = newImage;
    
    //jm////////////////////////////////////////////////////////////////////////
    const statCompSel = document.getElementById("selStatComp");
    const selectedStats = Array.from(statCompSel.selectedOptions).map(option => option.value);
    
    document.getElementById("selPlayer1").value = newPlayer[0].fullNameForSearch;
    const element = document.getElementById("selPlayer1");
    element.value = newPlayer[0].fullNameForSearch;

    

    
    // console.log(newPlayer[0].fullNameForSearch);

    barCompare(fullData, newPlayer[0].fullNameForSearch, player2Data[0].fullNameForSearch, selectedStats);
    //jm/////////////////////////////////////////////////////////////////////////    
}

//jm//////////////////////////////////////////////////////////////////////////////////
function player2Changed(val) {
    const selPlayer1 = document.getElementById("selPlayer1").value;
    player1Data = fullData.filter(player => player.fullNameForSearch === selPlayer1);
    newPlayer = fullData.filter(player => player.fullNameForSearch === val);
    espn_id = newPlayer[0].espn_player_id;
    

    newImage = `https://a.espncdn.com/i/headshots/nfl/players/full/${espn_id}.png`;
    document.getElementById("player2Image").src = newImage;

    const statCompSel = document.getElementById("selStatComp");
    const selectedStats = Array.from(statCompSel.selectedOptions).map(option => option.value);

    console.log(player1Data[0].fullNameForSearch);
    barCompare(fullData, player1Data[0].fullNameForSearch, newPlayer[0].fullNameForSearch, selectedStats);
    showPlayerDetails2(newPlayer[0]);
}

function statChanged(val) {
    const selPlayer1 = document.getElementById("selPlayer1").value;
    const selPlayer2 = document.getElementById("selPlayer2").value;

    const statCompSel = document.getElementById("selStatComp");
    const selectedStats = Array.from(statCompSel.selectedOptions).map(option => option.value);

    barCompare(fullData, selPlayer1, selPlayer2, selectedStats);
}
//jm/////////////////////////////////////////////////////////////////////////////////////////////

function playerListItemClicked(playerName) {
    console.log("playerListItemClicked");
    //get the value that is currently selected for PlayerNumber2. we need that when we update the 
    //comparison bar chart
    const selPlayer2 = document.getElementById("selPlayer2").value;
    player2Data = fullData.filter(player => player.fullNameForSearch === selPlayer2);

    //get the data for the player from playerName parameter. get espn_id and set new image 
    const newPlayer = fullData.find(player => player.fullNameForSearch === playerName.fullNameForSearch);
    //console.log(playerName);
    const espn_id = newPlayer.espn_player_id;
    const newImage = `https://a.espncdn.com/i/headshots/nfl/players/full/${espn_id}.png`;
    document.getElementById("player1Image").src = newImage;

    //get the stats entered on page to pass to the comparison bar chart update function
    const statCompSel = document.getElementById("selStatComp");
    const selectedStats = Array.from(statCompSel.selectedOptions).map(option => option.value);

    //get the get the element and set new value 
    const selectize = $('#selPlayer1')[0].selectize;
    selectize.setValue(newPlayer.fullNameForSearch, true);


    barCompare(fullData, newPlayer.fullNameForSearch, player2Data[0].fullNameForSearch, selectedStats);

    // Add code to show player details (you can reuse your existing showPlayerDetails function)
    showPlayerDetails(newPlayer);
}

function showPlayerDetails2(player) {
    // Display player details for selPlayer2 in the playerDetails2 div
    const playerDetails2 = document.getElementById("playerDetails2");
    const playerImage2 = document.getElementById("player2Image");

    playerDetails2.innerHTML = `
        <h4>${player.fullNameForSearch}</h4>
        <p>Position: ${player.position}</p>
        <p>Overall Rating: ${player.overall}</p>
        <p>Team: ${player.team}</p>
        <p>Years Pro: ${player.yearsPro}</p>
        <p>Total Salary: ${player.totalSalary}</p>
        <p>Bonus: ${player.signingBonus}</p>
        <p>College: ${player.college}</p>
        <p>Handedness: ${player.plyrHandedness}</p>
    `;

    const espn_id = player.espn_player_id;
    const newImage = `https://a.espncdn.com/i/headshots/nfl/players/full/${espn_id}.png`;
    playerImage2.src = newImage;
}
