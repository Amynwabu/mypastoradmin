const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields, pick } = require('../utils/sanitize');
const audit = require('../services/auditService');

const router = express.Router();
router.use(authenticate, allow('pastor', 'super_admin', 'finance'));

const editable = ['date', 'type', 'category', 'amount', 'currency', 'description', 'method', 'reference', 'recordedBy'];

router.get('/', (req, res) => {
  const rows = repos.finance.all().sort((a, b) => b.date.localeCompare(a.date));
  const totalIncome = rows.filter((r) => r.type === 'income').reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalExpense = rows.filter((r) => r.type === 'expense').reduce((s, r) => s + Number(r.amount || 0), 0);
  res.json({ transactions: rows, summary: { totalIncome, totalExpense, balance: totalIncome - totalExpense } });
});

router.post('/', (req, res) => {
  requireFields(req.body, ['date', 'type', 'amount']);
  const transaction = repos.finance.create({ ...pick(req.body, editable), recordedBy: req.user.name });
  audit.log(req, 'created', 'transaction', transaction.id, { amount: transaction.amount, type: transaction.type });
  res.status(201).json(transaction);
});

module.exports = router;
