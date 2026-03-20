import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { user } from "../db/schema/index.js";
import { db } from "../db/index.js";

const router = express.Router();

// Get all users with optional search, filtering, and pagination
router.get("/", async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
    const limitPerPage = Math.max(
      Math.max(1, parseInt(String(limit), 10) || 10),
      100,
    );
    const offset = (currentPage - 1) * limitPerPage;

    const filterCondition = [];

    // If search query exists, filter by users name OR users email
    if (search) {
      filterCondition.push(
        or(
          ilike(user.name, `%${search}%`),
          ilike(user.email, `%${search}%`),
        ),
      );
    }

    // If role exists, filter by exact user role
    if (role) {
      filterCondition.push(eq(user.role, String(role) as "student"));
    }

    // Combine all filters using AND if any exist
    const whereClause =
      filterCondition.length > 0 ? and(...filterCondition) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);

    const totalCount = countResult[0]?.count || 0;

    const usersList = await db
      .select({
        ...getTableColumns(user),
      })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: usersList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
