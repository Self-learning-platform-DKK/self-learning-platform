import { PrismaClient } from '@prisma/client';
import {
  CHALLENGE_SEEDS,
  CORP_HR_SCHEMA,
  CORP_HR_SEED_SQL,
  ECOMMERCE_SCHEMA,
  ECOMMERCE_SEED_SQL,
  LIBRARY_SCHEMA,
  LIBRARY_SEED_SQL,
  LEARNING_PATHS,
} from '@sql-tutor/shared';

const prisma = new PrismaClient();

async function main() {
  // 1. Create/Upsert Datasets
  const corpDataset = await prisma.dataset.upsert({
    where: { slug: 'corp-hr-v1' },
    update: {
      seedSql: CORP_HR_SEED_SQL,
      schemaJson: JSON.stringify(CORP_HR_SCHEMA),
    },
    create: {
      slug: 'corp-hr-v1',
      name: 'Corporate HR',
      description: 'Employees, departments, and salaries',
      seedSql: CORP_HR_SEED_SQL,
      schemaJson: JSON.stringify(CORP_HR_SCHEMA),
      isPublic: true,
    },
  });

  const ecommerceDataset = await prisma.dataset.upsert({
    where: { slug: 'ecommerce-v1' },
    update: {
      seedSql: ECOMMERCE_SEED_SQL,
      schemaJson: JSON.stringify(ECOMMERCE_SCHEMA),
    },
    create: {
      slug: 'ecommerce-v1',
      name: 'E-Commerce Store',
      description: 'Customers, categories, products, orders, and order items',
      seedSql: ECOMMERCE_SEED_SQL,
      schemaJson: JSON.stringify(ECOMMERCE_SCHEMA),
      isPublic: true,
    },
  });

  const libraryDataset = await prisma.dataset.upsert({
    where: { slug: 'library-v1' },
    update: {
      seedSql: LIBRARY_SEED_SQL,
      schemaJson: JSON.stringify(LIBRARY_SCHEMA),
    },
    create: {
      slug: 'library-v1',
      name: 'Public Library',
      description: 'Authors, genres, books, members, and book loans',
      seedSql: LIBRARY_SEED_SQL,
      schemaJson: JSON.stringify(LIBRARY_SCHEMA),
      isPublic: true,
    },
  });

  // 2. Create/Upsert Learning Paths & Challenges
  for (const path of LEARNING_PATHS) {
    const learningPath = await prisma.learningPath.upsert({
      where: { slug: path.slug },
      update: {
        title: path.title,
        color: path.color,
        difficulty: path.difficulty,
      },
      create: {
        slug: path.slug,
        title: path.title,
        description: `${path.title} learning path`,
        difficulty: path.difficulty,
        color: path.color,
        isPublished: true,
      },
    });

    const module = await prisma.module.upsert({
      where: { id: `${path.slug}-module-1` },
      update: {},
      create: {
        id: `${path.slug}-module-1`,
        pathId: learningPath.id,
        title: 'Core Challenges',
        sortOrder: 0,
      },
    });

    const pathChallenges = CHALLENGE_SEEDS.filter((c) => c.pathSlug === path.slug);
    for (const c of pathChallenges) {
      // Map challenges to their respective dataset IDs
      let activeDatasetId = corpDataset.id;
      if (path.slug === 'sql-joins' || path.slug === 'sql-subqueries') {
        activeDatasetId = ecommerceDataset.id;
      } else if (path.slug === 'sql-advanced') {
        activeDatasetId = libraryDataset.id;
      }

      await prisma.challenge.upsert({
        where: { slug: c.slug },
        update: {
          title: c.title,
          concept: c.concept,
          instructions: c.instructions,
          difficulty: c.difficulty,
          xpReward: c.xpReward,
          datasetId: activeDatasetId,
          moduleId: module.id,
          solution: c.solution,
          successMsg: c.successMsg,
          errorMsg: c.errorMsg,
          isPremium: false, // all are free
          hintsJson: JSON.stringify(c.hints),
          rulesJson: JSON.stringify(c.validationRules),
        },
        create: {
          slug: c.slug,
          legacyId: c.legacyId,
          title: c.title,
          concept: c.concept,
          instructions: c.instructions,
          difficulty: c.difficulty,
          dialect: c.dialect,
          xpReward: c.xpReward,
          datasetId: activeDatasetId,
          moduleId: module.id,
          solution: c.solution,
          successMsg: c.successMsg,
          errorMsg: c.errorMsg,
          isPremium: false, // all are free
          isPublished: true,
          aiPrompt: c.aiPrompt,
          hintsJson: JSON.stringify(c.hints),
          rulesJson: JSON.stringify(c.validationRules),
        },
      });
    }
  }

  // 3. Create Achievements
  const achievements = [
    { slug: 'first-query', title: 'Hello, SQL!', description: 'Complete your first challenge', icon: '🎯', ruleJson: '{"type":"count","event":"challenge.completed","threshold":1}', xpBonus: 10 },
    { slug: 'streak-7', title: 'Week Warrior', description: '7-day learning streak', icon: '🔥', ruleJson: '{"type":"streak","threshold":7}', xpBonus: 50 },
    { slug: 'no-hints', title: 'Pure Skill', description: 'Complete 5 challenges without hints', icon: '💎', ruleJson: '{"type":"no_hints","threshold":5}', xpBonus: 30 },
    { slug: 'all-beginner', title: 'Foundation Built', description: 'Complete all beginner path challenges', icon: '🏗️', ruleJson: '{"type":"path_complete","pathSlug":"sql-foundations"}', xpBonus: 100 },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        description: a.description,
        icon: a.icon,
        ruleJson: a.ruleJson,
        xpBonus: a.xpBonus,
      },
      create: a,
    });
  }

  // 4. Create Exam
  await prisma.exam.upsert({
    where: { slug: 'sql-foundations-cert' },
    update: {
      title: 'SQL Foundations Certificate',
      pathSlug: 'sql-foundations',
      questionsJson: JSON.stringify(['select-everything', 'filter-with-where', 'distinct-departments', 'sort-results']),
    },
    create: {
      slug: 'sql-foundations-cert',
      title: 'SQL Foundations Certificate',
      pathSlug: 'sql-foundations',
      durationMin: 45,
      passingScore: 70,
      isPremium: false,
      questionsJson: JSON.stringify(['select-everything', 'filter-with-where', 'distinct-departments', 'sort-results']),
    },
  });

  console.log('Seed complete: 3 datasets, 5 paths, 50 challenges, achievements, exam');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
