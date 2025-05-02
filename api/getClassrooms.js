const sql = require('mssql');

module.exports = async function (context, req) {
  try {
    await sql.connect(process.env.DB_CONNECTION_STRING);

    const dbRequest = new sql.Request();
    dbRequest.input('status', sql.VarChar(50), 'Current');

    const result = await dbRequest.query(`
      SELECT Id, Name
      FROM Classrooms
      WHERE Status = @status
    `);

    context.res = {
      status: 200,
      body: result.recordset
    };
  } 
  catch (err) {
    context.log.error('DB failure:', err);
    context.res = {
      status: 500,
      body: { error: 'Internal server error.' }
    };
  }
};
