const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyDb() {
  console.log("--- STARTING PHYSICAL DATABASE VERIFICATION ---");
  
  try {
    // 1. Check if table ProjectWebsite exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'ProjectWebsite';
    `;
    console.log("1. Table 'ProjectWebsite':", JSON.stringify(tables));

    // 2. Check all columns of ProjectWebsite
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'ProjectWebsite'
      ORDER BY ordinal_position;
    `;
    console.log("2. Columns count:", columns.length);
    console.table(columns);

    // 3. Check enum WebsiteStatus
    const enums = await prisma.$queryRaw`
      SELECT e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'WebsiteStatus';
    `;
    console.log("3. Enum 'WebsiteStatus' values:", JSON.stringify(enums));

    // 4. Check Unique constraint on projectId
    const constraints = await prisma.$queryRaw`
      SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'ProjectWebsite';
    `;
    console.log("4. Constraints:", JSON.stringify(constraints, null, 2));

    // 5. Check Foreign Keys
    const foreignKeys = await prisma.$queryRaw`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='ProjectWebsite';
    `;
    console.log("5. Foreign Key relations:", JSON.stringify(foreignKeys, null, 2));

  } catch (err) {
    console.error("ERROR QUERYING DATABASE:", err);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDb();
