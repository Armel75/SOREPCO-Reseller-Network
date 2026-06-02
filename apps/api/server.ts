import express from "express";
import cors from "cors";
import { prisma } from "@sorepco/database";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "sorepco_access_secret_12345";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "sorepco_refresh_secret_67890";

const logActivity = async (userId: string | null, action: string, tableName?: string, recordId?: string) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Accès non autorisé" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Permissions insuffisantes" });
  }
  next();
};

const api = express.Router();

api.use(cors());
api.use(express.json());

// --- API ROUTES ---

// Health check
api.get("/health", (req, res) => {
  res.json({ status: "ok", service: "SOREPCO API" });
});

// Auth: Login
api.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Votre compte est désactivé" });
    }

    if (user.isLocked) {
      return res.status(403).json({ message: "Votre compte est verrouillé" });
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip as string,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logActivity(user.id, "LOGIN_SUCCESS");

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Auth: Register
api.post("/auth/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, phoneNumber } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Get default role (AGENT or USER)
    let role = await prisma.role.findFirst({
      where: { name: { in: ["AGENT", "USER"] } }
    });

    if (!role) {
      role = await prisma.role.findFirst();
    }

    if (!role) {
      return res.status(500).json({ message: "Configuration du serveur invalide: aucun rôle trouvé" });
    }

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        firstName,
        lastName,
        email,
        phoneNumber,
        roleId: role.id,
        isActive: true
      },
      include: { role: true }
    });

    await logActivity(user.id, "REGISTER_SUCCESS");

    res.status(201).json({
      message: "Compte créé avec succès",
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Erreur lors de la création du compte" });
  }
});

// Resellers
api.get("/resellers", authenticate, async (req, res) => {
  try {
    const { status, level, city, search, page = "1", limit = "20" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { deletedAt: null };
    if (status) where.statusId = status;
    if (level) where.resellerLevelId = level;
    if (city) where.cityId = city;
    if (search) {
      where.OR = [
        { businessName: { contains: search as string } },
        { resellerCode: { contains: search as string } },
        { ownerName: { contains: search as string } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.reseller.findMany({
        where,
        include: {
          status: true,
          resellerLevel: true,
          potentialLevel: true,
          city: true,
          creator: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.reseller.count({ where }),
    ]);

    res.json({ items, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
});

api.post("/resellers", authenticate, async (req, res) => {
  try {
    const { id, businessName, ownerName, phoneNumber, alternativePhone, email, address, regionId, cityId, districtId, latitude, longitude, resellerLevelId, potentialLevelId, notes } = req.body;
    const agentId = (req as any).user.userId;

    let resellerCode = req.body.resellerCode;
    if (!resellerCode) {
      const count = await prisma.reseller.count();
      resellerCode = `REV-${(count + 1).toString().padStart(6, '0')}`;
    }

    const reseller = await prisma.reseller.create({
      data: {
        id: id || undefined,
        resellerCode,
        businessName,
        ownerName,
        phoneNumber,
        alternativePhone,
        email,
        address,
        regionId,
        cityId,
        districtId,
        latitude,
        longitude,
        resellerLevelId,
        potentialLevelId,
        notes,
        createdBy: agentId,
        statusId: (await prisma.resellerStatus.findFirst({ where: { name: "PROSPECT" } }))?.id
      }
    });

    await logActivity(agentId, id ? "RESELLER_SYNCED" : "RESELLER_CREATED", "sales_resellers", reseller.id);
    res.status(201).json(reseller);
  } catch (error) {
     if ((error as any).code === 'P2002') return res.status(201).json({ message: "Already synced" });
     res.status(400).json({ message: "Données invalides" });
  }
});

// Construction Sites
api.get("/sites", authenticate, async (req, res) => {
  try {
    const sites = await prisma.constructionSite.findMany({
      where: { deletedAt: null },
      include: {
        type: true,
        status: true,
        stage: true,
        city: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: "Erreur sites" });
  }
});

api.post("/sites", authenticate, async (req, res) => {
  try {
    const { id, name, contractor, phoneNumber, regionId, cityId, districtId, fullAddress, latitude, longitude, typeId, statusId, stageId, estimatedBudget, notes } = req.body;
    const agentId = (req as any).user.userId;

    let siteCode = req.body.siteCode;
    if (!siteCode) {
      const count = await prisma.constructionSite.count();
      siteCode = `BTP-${(count + 1).toString().padStart(6, '0')}`;
    }

    const site = await prisma.constructionSite.create({
      data: {
        id: id || undefined,
        siteCode,
        name,
        contractor,
        phoneNumber,
        regionId,
        cityId,
        districtId,
        fullAddress,
        latitude,
        longitude,
        typeId,
        statusId: statusId || (await prisma.constructionSiteStatus.findFirst({ where: { name: "PROSPECT" } }))?.id,
        stageId,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : null,
        notes,
        createdBy: agentId
      }
    });

    await logActivity(agentId, id ? "SITE_SYNCED" : "SITE_CREATED", "btp_construction_sites", site.id);
    res.status(201).json(site);
  } catch (error) {
    res.status(400).json({ message: "Données invalides" });
  }
});

// Geo Data
api.get("/geo/regions", authenticate, async (req, res) => {
  const regions = await prisma.region.findMany({ include: { cities: { include: { districts: true } } } });
  res.json(regions);
});

api.get("/metadata/sales", authenticate, async (req, res) => {
  const [levels, statuses, potentials, categories] = await Promise.all([
    prisma.resellerLevel.findMany({ orderBy: { priorityOrder: "asc" } }),
    prisma.resellerStatus.findMany(),
    prisma.potentialLevel.findMany({ orderBy: { scoreMin: "asc" } }),
    prisma.productCategory.findMany(),
  ]);
  res.json({ levels, statuses, potentials, categories });
});

api.get("/metadata/btp", authenticate, async (req, res) => {
  const [types, statuses, stages] = await Promise.all([
    prisma.constructionSiteType.findMany(),
    prisma.constructionSiteStatus.findMany(),
    prisma.constructionSiteStage.findMany(),
  ]);
  res.json({ types, statuses, stages });
});

// Admin Users
api.get("/admin/users", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

export { api as resellerApi };
