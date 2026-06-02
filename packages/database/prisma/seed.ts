import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SOREPCO Database...');

  // 1. Roles
  const roles = [
    { name: 'ADMIN', description: 'Administrateur SOREPCO - Contrôle total du système', isSystem: true },
    { name: 'MANAGER', description: 'Manager Commercial - Supervision et validation terrain', isSystem: true },
    { name: 'COLLECTOR', description: 'Agent de Collecte - Recensement revendeurs et chantiers', isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  // 2. Default User (Password: Sorepco2024!)
  const hashedPassword = await bcrypt.hash('Sorepco2024!', 10);
  if (adminRole) {
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        phoneNumber: '237000000000',
        email: 'admin@sorepco.cm',
        passwordHash: hashedPassword,
        roleId: adminRole.id,
      },
    });
  }

  // 3. Reseller Statuses
  const statuses = [
    { name: 'PROSPECT', description: 'Prospect potentiel' },
    { name: 'ACTIVE', description: 'Revendeur actif' },
    { name: 'INACTIVE', description: 'Revendeur inactif' },
    { name: 'SUSPENDED', description: 'Revendeur suspendu' },
    { name: 'CLOSED', description: 'Point de vente fermé' },
  ];

  for (const status of statuses) {
    await prisma.resellerStatus.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    });
  }

  // 4. Reseller Levels
  const levels = [
    { name: 'BRONZE', description: 'Petit revendeur', priorityOrder: 1 },
    { name: 'SILVER', description: 'Revendeur intermédiaire', priorityOrder: 2 },
    { name: 'GOLD', description: 'Grand revendeur', priorityOrder: 3 },
    { name: 'PREMIUM', description: 'Revendeur premium', priorityOrder: 4 },
    { name: 'WHOLESALER', description: 'Grossiste', priorityOrder: 5 },
  ];

  for (const level of levels) {
    await prisma.resellerLevel.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
  }

  // 5. Potential Levels
  const potentialLevels = [
    { name: 'LOW', scoreMin: 0, scoreMax: 30 },
    { name: 'MEDIUM', scoreMin: 31, scoreMax: 60 },
    { name: 'HIGH', scoreMin: 61, scoreMax: 85 },
    { name: 'VERY_HIGH', scoreMin: 86, scoreMax: 100 },
  ];

  for (const p of potentialLevels) {
    await prisma.potentialLevel.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  // 6. Geographic Regions (Cameroon example)
  const regions = [
    { name: 'Centre', code: 'CE' },
    { name: 'Littoral', code: 'LT' },
    { name: 'Ouest', code: 'OU' },
    { name: 'Extrême-Nord', code: 'EN' },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: region,
    });
  }

  // 7. Construction Site Types
  const siteTypes = [
    { name: 'RÉSIDENTIEL', description: 'Maisons individuelles, villas' },
    { name: 'IMMEUBLE', description: 'Immeubles d\'habitation ou bureaux' },
    { name: 'COMMERCIAL', description: 'Boutiques, centres commerciaux' },
    { name: 'INDUSTRIEL', description: 'Entrepôts, usines' },
    { name: 'INFRASTRUCTURE', description: 'Ponts, routes, ouvrages publics' },
  ];

  for (const type of siteTypes) {
    await prisma.constructionSiteType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  // 8. Construction Site Statuses
  const siteStatuses = [
    { name: 'PROSPECT', description: 'Chantier identifié, non contacté' },
    { name: 'SUIVI', description: 'En cours de négociation / suivi' },
    { name: 'CLIENT', description: 'S\'approvisionne chez SOREPCO' },
    { name: 'PERDU', description: 'S\'approvisionne ailleurs' },
    { name: 'TERMINE', description: 'Chantier achevé' },
  ];

  for (const status of siteStatuses) {
    await prisma.constructionSiteStatus.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    });
  }

  // 9. Construction Site Stages
  const siteStages = [
    { name: 'FONDATION', description: 'Terrassement et fondations' },
    { name: 'ÉLÉVATION', description: 'Murs et gros oeuvre' },
    { name: 'COUVERTURE', description: 'Toiture et charpente' },
    { name: 'FINITION', description: 'Second oeuvre, carrelage, peinture' },
    { name: 'LIVRÉ', description: 'Prêt à l\'usage' },
  ];

  for (const stage of siteStages) {
    await prisma.constructionSiteStage.upsert({
      where: { name: stage.name },
      update: {},
      create: stage,
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
