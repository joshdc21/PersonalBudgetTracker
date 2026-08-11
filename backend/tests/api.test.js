const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';
const app = require('../src/app');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Budget = require('../src/models/Budget');

const TEST_MONGO_URI = 'mongodb://localhost:27017/personal_budget_tracker_test';

let token;
let userId;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
  // Clean up and close connection
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear tables before each test block if needed
});

describe('Auth Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    
    token = res.body.data.token;
    userId = res.body.data._id;
  });

  it('should login an existing user successfully', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject signup with NoSQL injection object in email', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        name: 'Attacker',
        email: { $gt: '' },
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email must be a string');
  });

  it('should reject login with NoSQL injection object in email', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: { $gt: '' },
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email must be a string');
  });
});

describe('Expenses Endpoints', () => {
  let expenseId;

  it('should create an expense successfully', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 50.5,
        description: 'Test Dinner',
        category: 'Food',
        date: '2026-08-10',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toEqual(50.5);
    expenseId = res.body.data._id;
  });

  it('should fail to create expense with negative amount', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: -10,
        description: 'Negative',
        category: 'Food',
        date: '2026-08-10',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should fail to create expense with invalid category', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 20,
        description: 'Shopping',
        category: 'Books', // Invalid category (not Food, Transport, Entertainment, Other)
        date: '2026-08-10',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should get expenses for the user with month/year filters', async () => {
    const res = await request(app)
      .get('/api/expenses?year=2026&month=8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expenses.length).toBeGreaterThan(0);
    expect(res.body.data.expenses[0]._id).toEqual(expenseId);
  });

  it('should update an expense successfully', async () => {
    const res = await request(app)
      .put(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Updated Dinner Description',
        amount: 60.0,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.description).toEqual('Updated Dinner Description');
    expect(res.body.data.amount).toEqual(60.0);
  });

  it('should delete an expense successfully', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${expenseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject get expenses with NoSQL injection object in category query', async () => {
    const res = await request(app)
      .get('/api/expenses?category[$ne]=Food')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Category must be a string');
  });

  it('should reject create expense with NoSQL injection object in category body', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 20,
        description: 'Attack',
        category: { $ne: 'Food' },
        date: '2026-08-10',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Category must be a string');
  });
});

describe('Budgets Endpoints', () => {
  it('should create or update a budget (upsert)', async () => {
    const res = await request(app)
      .put('/api/budgets/2026/8')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 1500,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toEqual(1500);
  });

  it('should get the budget successfully', async () => {
    const res = await request(app)
      .get('/api/budgets/2026/8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toEqual(1500);
  });

  it('should update the same budget on subsequent PUT (upsert duplicate handling)', async () => {
    const res = await request(app)
      .put('/api/budgets/2026/8')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 2000,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toEqual(2000);

    const check = await Budget.find({ userId, year: 2026, month: 8 });
    expect(check.length).toBe(1); // No duplicates created
  });

  it('should delete the budget successfully', async () => {
    const res = await request(app)
      .delete('/api/budgets/2026/8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Analytics Endpoints', () => {
  beforeEach(async () => {
    // Clear models to have clean stats
    await Expense.deleteMany({});
    await Budget.deleteMany({});

    // Seed test data
    await Expense.create([
      { userId, amount: 200, description: 'Groceries', category: 'Food', date: new Date('2026-08-05T12:00:00Z') },
      { userId, amount: 100, description: 'Train ticket', category: 'Transport', date: new Date('2026-08-10T12:00:00Z') },
      { userId, amount: 300, description: 'Cinema', category: 'Entertainment', date: new Date('2026-08-15T12:00:00Z') },
      { userId, amount: 50, description: 'Extra', category: 'Other', date: new Date('2026-08-20T12:00:00Z') },
      { userId, amount: 150, description: 'Next month food', category: 'Food', date: new Date('2026-09-01T12:00:00Z') }, // outside range
    ]);

    await Budget.create({ userId, year: 2026, month: 8, amount: 1000 });
  });

  it('should calculate correct total expenses, category percentages, and budget comparisons', async () => {
    const res = await request(app)
      .get('/api/analytics/expenses?year=2026&month=8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    const stats = res.body.data;
    // total of August: 200 + 100 + 300 + 50 = 650
    expect(stats.totalExpenses).toEqual(650);
    expect(stats.spent).toEqual(650);
    expect(stats.budget).toEqual(1000);
    expect(stats.remaining).toEqual(350);
    expect(stats.percentageUsed).toEqual(65.0);

    // Food should be 200 out of 650 -> ~30.77%
    const foodCat = stats.byCategory.find(item => item.category === 'Food');
    expect(foodCat).toBeDefined();
    expect(foodCat.amount).toEqual(200);
    expect(foodCat.percentage).toEqual(30.77);

    // Transport should be 100 out of 650 -> ~15.38%
    const transCat = stats.byCategory.find(item => item.category === 'Transport');
    expect(transCat).toBeDefined();
    expect(transCat.amount).toEqual(100);
    expect(transCat.percentage).toEqual(15.38);
  });
});

describe('Timezone Date Handling', () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTz;
  });

  const testDate = '2026-08-11';

  it('should preserve the correct calendar date when parsed in UTC+2 (Europe/Paris)', async () => {
    process.env.TZ = 'Europe/Paris'; // UTC+2 (Central European Summer Time)

    // Create an expense
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 30,
        description: 'Dinner in Paris',
        category: 'Food',
        date: testDate,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);

    // Verify the date stored in the DB is UTC midnight (2026-08-11T00:00:00.000Z)
    const savedDateStr = res.body.data.date;
    expect(savedDateStr).toEqual('2026-08-11T00:00:00.000Z');

    // Verify formatting behaves correctly under Europe/Paris timezone (using UTC option)
    const formatted = new Date(savedDateStr).toLocaleDateString('en-US', { timeZone: 'UTC' });
    expect(formatted).toEqual('8/11/2026');
  });

  it('should preserve the correct calendar date when parsed in UTC-5 (America/New_York)', async () => {
    process.env.TZ = 'America/New_York'; // UTC-4 (Eastern Daylight Time) or UTC-5

    // Create an expense
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 40,
        description: 'Coffee in New York',
        category: 'Food',
        date: testDate,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);

    // Verify the date stored in the DB is UTC midnight
    const savedDateStr = res.body.data.date;
    expect(savedDateStr).toEqual('2026-08-11T00:00:00.000Z');

    // Verify formatting behaves correctly under America/New_York timezone (using UTC option)
    const formatted = new Date(savedDateStr).toLocaleDateString('en-US', { timeZone: 'UTC' });
    expect(formatted).toEqual('8/11/2026');
  });
});

describe('Password Reset Flow', () => {
  let resetToken;

  it('should generate a password reset link and return token in test mode', async () => {
    const res = await request(app)
      .post('/api/users/forgot-password')
      .send({
        email: 'test@example.com',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    resetToken = res.body.token;
  });

  it('should fail to reset password with an invalid token', async () => {
    const res = await request(app)
      .post('/api/users/reset-password')
      .send({
        token: 'fake_invalid_token_123',
        password: 'newpassword123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid or expired password reset token');
  });

  it('should fail to reset password if the token has expired', async () => {
    // Manually expire the token in the DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await User.updateOne(
      { email: 'test@example.com' },
      { resetPasswordExpires: new Date(Date.now() - 3600000) } // 1 hour ago
    );

    const res = await request(app)
      .post('/api/users/reset-password')
      .send({
        token: resetToken,
        password: 'newpassword123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid or expired password reset token');
  });

  it('should successfully reset password with a valid token', async () => {
    // Re-generate a fresh token for this test
    const forgotRes = await request(app)
      .post('/api/users/forgot-password')
      .send({
        email: 'test@example.com',
      });
    const freshToken = forgotRes.body.token;

    const res = await request(app)
      .post('/api/users/reset-password')
      .send({
        token: freshToken,
        password: 'newpassword123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);

    // Verify login works with the new password
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'newpassword123',
      });
    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body.success).toBe(true);
    token = loginRes.body.data.token; // Update token for subsequent tests
  });

  it('should fail to reuse a reset token that was already used', async () => {
    // Generate a token
    const forgotRes = await request(app)
      .post('/api/users/forgot-password')
      .send({
        email: 'test@example.com',
      });
    const reuseToken = forgotRes.body.token;

    // Use it once
    const firstReset = await request(app)
      .post('/api/users/reset-password')
      .send({
        token: reuseToken,
        password: 'finalpassword123',
      });
    expect(firstReset.statusCode).toEqual(200);

    // Try to reuse it
    const secondReset = await request(app)
      .post('/api/users/reset-password')
      .send({
        token: reuseToken,
        password: 'anotherpassword123',
      });

    expect(secondReset.statusCode).toEqual(400);
    expect(secondReset.body.success).toBe(false);
    expect(secondReset.body.message).toContain('Invalid or expired password reset token');
  });
});


