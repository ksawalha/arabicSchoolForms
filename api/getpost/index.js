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
    SELECT 
      p.*,
      pr.Id AS PrivacyId, pr.Type AS PrivacyType, pr.Value AS PrivacyValue,
      a.Id AS AttachmentId, a.Filename AS AttachmentFilename, a.Path AS AttachmentPath
    FROM Post p
    LEFT JOIN postprivacy pr ON p.Id = pr.PostId
    LEFT JOIN attachment a ON p.Id = a.post
    WHERE p.Id = @postId
    `);

    const rows = result.recordset;

    if (!rows || rows.length === 0) {
      context.res = {
        status: 404,
        body: { error: `Post with ID ${postId} not found.` }
      };
      return;
    }

    const post = {
      id: rows[0].PostId,
      title: rows[0].Title,
      content: rows[0].Content,
      createdAt: rows[0].CreatedAt,
      privacy: [],
      attachments: []
    };

    const seenPrivacy = new Set();
    const seenAttachments = new Set();

    rows.forEach(row => {
      if (row.PrivacyId && !seenPrivacy.has(row.PrivacyId)) {
        post.privacy.push({
          id: row.PrivacyId,
          type: row.Type,
          value: row.Value
        });
        seenPrivacy.add(row.PrivacyId);
      }

      if (row.AttachmentId && !seenAttachments.has(row.AttachmentId)) {
        post.attachments.push({
          id: row.AttachmentId,
          filename: row.Filename,
          path: row.Path
        });
        seenAttachments.add(row.AttachmentId);
      }
    });

    context.res = {
      status: 200,
      body: post
    };
  } catch (err) {
    context.log.error("Database error:", err);
    context.res = {
      status: 500,
      body: { error: "Internal server error" }
    };
  }
};
