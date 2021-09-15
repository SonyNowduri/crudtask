const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Sever Running at http://localhost:3005/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjToResponseObj = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};

// API 1
app.get("/players/", async (request, response) => {
  const getCricketPlayersQuery = `
  SELECT 
    * 
  FROM 
    cricket_team;`;
  const cricketPlayersList = await db.all(getCricketPlayersQuery);
  response.send(
    cricketPlayersList.map((eachPlayer) =>
      convertDbObjToResponseObj(eachPlayer)
    )
  );
});


//API 2

app.post("/players/", async (request, response) => {
  const cricketDetails = request.body;
  const { playerName, jerseyNumber, role } = cricketDetails;
  const addCricketerQuery = `
  INSERT 
    INTO 
    cricket_team(player_name,jersey_number,role)
    VALUES
  ('${playerName}',${jerseyNumber},'${role}');`;

  const dbResponse = await db.run(addCricketerQuery);
  //   const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

// API 3
app.put("/players/:playerId/", async (request, response) => {
  const cricketDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = cricketDetails;
  const updateCricketQuery = `
  UPDATE 
    cricket_team
    SET
      player_name = '${playerName}',
      jersey_number=${jerseyNumber},
      role = '${role}'
    WHERE 
      player_id =${playerId};`;
  await db.run(updateCricketQuery);
  response.send("Player Details Updated");
});

// API 4

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteCricketPlayersQuery = `
  DELETE FROM 
    cricket_team 
  WHERE 
    player_id =${playerId};`;
  await db.all(deleteCricketPlayersQuery);
  response.send("Player Removed");
});

module.exports = app;
