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

        const query = `
            -- Get the post
            SELECT * FROM Post WHERE Id = @postId;
            
            -- Get all privacy settings for this post
            SELECT * FROM postprivacy WHERE PostId = @postId;
            
            -- Get all attachments for this post
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
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            }
        };
    }
};
