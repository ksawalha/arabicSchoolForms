const sql = require('mssql');

module.exports = async function (context, req) {
  try {
    const connectionString = process.env.DB_CONNECTION_STRING;
    await sql.connect(connectionString);
    
    const dbRequest = new sql.Request();
    const result = await dbRequest.query(`
      SELECT mainstream
      FROM options
    `);

    const mainstreamValues = result.recordset.map(row => row.mainstream);

    context.res = {
      status: 200,
      body: mainstreamValues,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  } 
  catch (err) {
    context.log.error("Database error:", err);
    context.res = {
      status: 500,
      body: { error: 'Failed to fetch mainstream values' },
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
