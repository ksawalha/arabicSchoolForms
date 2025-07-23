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
        const connectionString = process.env.DB_CONNECTION_STRING;
        await sql.connect(connectionString);
        const dbRequest = new sql.Request();
        dbRequest.input('postId', sql.Int, postId);

        const query = `
            SELECT * FROM post WHERE id = @postId;
            
            SELECT * FROM postprivacy WHERE post = @postId;
            
            SELECT * FROM attachment WHERE post = @postId;
        `;

        const result = await dbRequest.query(query);

        const post = result.recordset[0] || null;
        
        if (!post) {
            context.res = {
                status: 404,
                body: { error: `Post with ID ${postId} not found.` }
            };
            return;
        }

        const privacySettings = result.recordsets[1] || [];
        
        const attachments = result.recordsets[2] || [];

        context.res = {
            status: 200,
            body: {
                post,
                privacySettings,
                attachments
            }
        };

    } catch (err) {
        context.log.error("Database error:", err);
        context.res = {
            status: 500,
            body: { 
                error: "Internal server error",
                details: err.message
            }, headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'enrol.arabicschool.org.au',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
        };
    }
};
