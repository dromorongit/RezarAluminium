const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const ADMINS_FILE = path.join(__dirname, '../db/admins.json');

const readAdmins = () => {
  try {
    const data = fs.readFileSync(ADMINS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading admins file:', err);
    return [];
  }
};

const writeAdmins = (admins) => {
  try {
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2));
  } catch (err) {
    console.error('Error writing admins file:', err);
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const admins = readAdmins();
  const admin = admins.find(a => a.username === username);

  if (admin && await bcrypt.compare(password, admin.password)) {
    req.session.admin = true;
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

const register = async (req, res) => {
  const { username, password } = req.body;
  const admins = readAdmins();

  if (admins.find(a => a.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  admins.push({ username, password: hashedPassword });
  writeAdmins(admins);

  res.json({ message: 'Registration successful' });
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
};

const checkAuth = (req, res) => {
  if (req.session.admin) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
};

module.exports = {
  login,
  register,
  logout,
  checkAuth
};