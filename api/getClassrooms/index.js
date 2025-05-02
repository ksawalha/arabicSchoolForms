const sql = require('mssql');
module.exports = async function (context, req) {
  try {
    const connectionString = process.env.DB_CONNECTION_STRING;
    await sql.connect(connectionString);
    const dbRequest = new sql.Request();
    dbRequest.input('status', sql.VarChar(50), 'Current');
    const result = await dbRequest.query(`
      SELECT Id, Name
      FROM Classroom
      WHERE Status = @status
    `);
    context.res = {
      status: 200,
      body: result.recordset
    };
  } 
  catch (err) {
    context.res = {
      status: 500,
      body: { error: 'Internal Server Error' }
    };
  }
};
