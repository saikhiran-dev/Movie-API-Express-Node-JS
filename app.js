const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//1
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT movie_name FROM movie
    `;
  const getMovies = await db.all(getMovieNamesQuery);
  response.send(getMovies);
});
//2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
  INSERT INTO movie(director_id, movie_name, lead_actor)
  VALUES ( ${directorId}, "${movieName}", "${leadActor}")
  `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});
//3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * 
    FROM movie
    WHERE movie_id = ${movieId};
    `;
  const getMovie = await db.get(getMovieQuery);
  response.send(getMovie);
});
//4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
         movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
         movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//6
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT *
        FROM director;
    `;
  const getDirectorDetails = await db.all(getDirectorQuery);
  response.send(getDirectorDetails);
});
//7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `
        SELECT movie_name
        FROM movie
        WHERE director_id = '${directorId}';
    `;
  const getDirectorMovies = await db.run(getMoviesByDirectorQuery);
  response.send(getDirectorMovies);
});

module.exports = app;
