const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_Mkjl7CDXWV2J@ep-royal-lab-a12b4eam-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function test() {
    try {
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'links';
        `;
        console.log("Columns in 'links' table:", columns.map(c => c.column_name));
        
        const links = await sql`SELECT * FROM links LIMIT 5;`;
        console.log("Links:", links);
    } catch (e) {
        console.error("DB Error:", e);
        process.exit(1);
    }
    process.exit(0);
}
test();
