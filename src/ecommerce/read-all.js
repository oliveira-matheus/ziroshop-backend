require('dotenv').config()

const faunadb = require('faunadb')
const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = async (event, context) => {
  console.log('Function `read-all` invoked')
  return client
    .query(q.Paginate(q.Match(q.Ref('indexes/all_products'))))
    .then(response => {
      const itemRefs = response.data
      const getAllItemsDataQuery = itemRefs.map(ref => {
        return q.Get(ref)
      })
      return client.query(getAllItemsDataQuery).then(ret => {
        const wellformedData = ret.map(malformedResponse => {
          return {
            id: malformedResponse.ts,
            ...malformedResponse.data
          }
        })
        return {
          statusCode: 200,
          body: JSON.stringify(wellformedData)
        }
      })
    })
    .catch(error => {
      console.log('error', error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    })
}