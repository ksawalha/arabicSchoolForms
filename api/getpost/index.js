const sql = require('mssql');

module.exports = async function (context, req) {
  const postId = req.params.postId;

  if (!postId) {
    context.res = {
      status: 400,
      body: { error: "Missing postId parameter" }
    };
    return;
  }

  try {
    const dbRequest = new sql.Request();
    dbRequest.input('postId', sql.Int, postId);

    const result = await dbRequest.query(`
      SELECT *
      FROM Post p
      LEFT JOIN postprivacy pr ON p.Id = pr.PostId
      LEFT JOIN attachment a ON p.Id = a.post
      WHERE p.Id = @postId
    `);

    if (!result.recordset || result.recordset.length === 0) {
      context.res = {
        status: 404,
        body: { error: `Post with ID ${postId} not found.` }
      };
      return;
    }

    context.res = {
      status: 200,
      body: result.recordset
    };
  } catch (err) {
    context.log.error("Database error:", err);
    context.res = {
      status: 500,
      body: { error: "Internal server error" }
    };
  }
};
