
let fullData;
//let postitionArray;


d3.json("/data").then((data) => {
    //console.log(data);
    fullData = data;
    initPlayer1ID = fullData[0].espn_player_id;
    initPlayer1Image = `https://a.espncdn.com/i/headshots/nfl/players/full/${initPlayer1ID}.png`;
    document.getElementById("player1Image").src = initPlayer1Image;


    const playerNames = data.map(player => player.fullNameForSearch);
    const teamNames = [...new Set(data.map(player => player.team))];
    const columnNames = Object.keys(fullData[0]);
    const skills = columnNames.slice(4, 57); 
 
    populateTeamDropdown(teamNames);
    populateSkillDropdown(skills);
    const topByTeam = getTopTenByTeam(fullData, teamNames[0]);
    teamBarChart(topByTeam);
    populatePlayer1Dropdown(playerNames);
    //box plot
    boxPlotStats(fullData, "agility");
    
    $("#selPlayer1").selectize();
    $("#selTeam").selectize();
    $("#selSkill").selectize();
});

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
        title: stat.charAt(0).toUpperCase() + stat.slice(1)
        }
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
        title: stat.charAt(0).toUpperCase() + stat.slice(1)
        }
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
        title: `<b>${data[0].team} Top 10 Overall Players</b>`,
        displayModeBar: false,
        displaylogo: false,
        yaxis: {
            range: [0, 100],
        }
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


function teamChanged(val) {
    const topByTeam = getTopTenByTeam(fullData, val);
    animateTeamBarChart(topByTeam);

}

function skillChanged(val) {
    //boxPlotStats(fullData, val);
    animateBoxPlotStats(fullData, val);
}

function player1Changed(val) {
    newPlayer = fullData.filter(player => player.fullNameForSearch === val);
    //console.log(newPlayer);
    espn_id = newPlayer[0].espn_player_id;
   // console.log(espn_id);

    newImage = `https://a.espncdn.com/i/headshots/nfl/players/full/${espn_id}.png`;

    document.getElementById("player1Image").src = newImage;
}

