const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'covid19India.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//get 1   district    state
app.get('/states/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      state
    ORDER BY
      state_id;`
  const booksArray = await db.all(getBooksQuery)
  let movie = booksArray.map(num => {
    return {
      stateId: num.state_id,
      stateName: num.state_name,
      population: num.population,
    }
  })

  response.send(movie)
})

// get 2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getAuthorBooksQuery = `
    SELECT
     *
    FROM
     state
    WHERE
      state_id = ${stateId};`
  const book = await db.get(getAuthorBooksQuery)
  let a = {
    stateId: book.state_id,
    stateName: book.state_name,
    population: book.population,
  }
  response.send(a)
})

//post player   3
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const addBookQuery = `
    INSERT INTO
      district (district_name,state_id,cases,cured,active,deaths)
    VALUES
      ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`

  await db.run(addBookQuery)
  response.send('District Successfully Added')
})

// get 4

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getAuthorBooksQuery = `
    SELECT
     *
    FROM
     district
    WHERE
      district_id = ${districtId};`
  const book = await db.get(getAuthorBooksQuery)
  let a = {
    districtId: book.district_id,
    districtName: book.district_name,
    stateId: book.state_id,
    cases: book.cases,
    cured: book.cured,
    active: book.active,
    deaths: book.deaths,
  }
  response.send(a)
})

//delete 5
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteBookQuery = `
    DELETE FROM
      district
    WHERE 
      district_id = ${districtId};`
  await db.run(deleteBookQuery)
  response.send('District Removed')
})

//put 6
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const playerDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = playerDetails
  const updateBookQuery = `
    UPDATE
      district
    SET
      district_name='${districtName}',
      state_id=${stateId},
      cases=${cases},
      cured=${cured},
      active=${active},
      deaths=${deaths}
    WHERE
      district_id = ${districtId};`

  await db.run(updateBookQuery)
  response.send('District Details Updated')
})

//get players   7  ##########
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getBooksQuery = `
    SELECT
      SUM(cases) AS totalCases,
      SUM(cured) AS totalCured,
      SUM(active) AS totalActive,
      SUM(deaths) AS totalDeaths
    FROM
      district
      WHERE state_id=${stateId};`
  const booksArray = await db.get(getBooksQuery)
  response.send(booksArray)
})

//get players   8  ##########
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getBooksQuery = `
    SELECT
      *
    FROM
      district
      WHERE district_id=${districtId};`
  const booksArray = await db.get(getBooksQuery)
  let stateidd = booksArray['state_id']
  const getBooksQuery1 = `
    SELECT
      state_name as stateName
    FROM
      state
      WHERE state_id=${stateidd};`
  const booksArray1 = await db.get(getBooksQuery1)
  response.send(booksArray1)
})
module.exports = app
