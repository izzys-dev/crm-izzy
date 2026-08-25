const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: '/tmp/' });
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-cambiar-en-produccion';

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'agent',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        company VARCHAR(255),
        agent_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS interactions (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL,
        notes TEXT,
        quality_score INT,
        experience_rating INT,
        duration INT,
        result VARCHAR(50),
        next_call_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        assigned_to VARCHAR(36),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'normal',
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    const adminExists = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminId = uuidv4();
      await pool.query(
        'INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4)',
        [adminId, 'admin', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created: admin / admin123');
    }

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  }
}

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login error' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/agents', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.name, u.username, a.created_at FROM agents a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: 'Error fetching agents' });
  }
});

app.post('/api/agents', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, name, password } = req.body;
  try {
    const userId = uuidv4();
    const agentId = uuidv4();
    const hashedPassword = await bcrypt.hash(password || 'agent123', 10);

    await pool.query(
      'INSERT INTO users (id, username, password, role) VALUES ($1, $2, $3, $4)',
      [userId, username, hashedPassword, 'agent']
    );

    const result = await pool.query(
      'INSERT INTO agents (id, user_id, name) VALUES ($1, $2, $3) RETURNING *',
      [agentId, userId, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating agent:', err);
    res.status(500).json({ error: 'Error creating agent' });
  }
});

app.delete('/api/agents/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const agent = await pool.query('SELECT user_id FROM agents WHERE id = $1', [id]);
    if (agent.rows.length > 0) {
      const userId = agent.rows[0].user_id;
      await pool.query('UPDATE customers SET agent_id = NULL WHERE agent_id = $1', [id]);
      await pool.query('DELETE FROM agents WHERE id = $1', [id]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting agent:', err);
    res.status(500).json({ error: 'Error deleting agent' });
  }
});

app.get('/api/customers', authMiddleware, async (req, res) => {
  try {
    let query = 'SELECT * FROM customers ORDER BY created_at DESC';
    let params = [];

    if (req.user.role === 'agent') {
      const agentResult = await pool.query('SELECT id FROM agents WHERE user_id = $1', [req.user.id]);
      if (agentResult.rows.length === 0) {
        return res.json([]);
      }
      query = 'SELECT * FROM customers WHERE agent_id = $1 ORDER BY created_at DESC';
      params = [agentResult.rows[0].id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching customers' });
  }
});

app.post('/api/customers', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, email, phone, company, agent_id } = req.body;
  const id = uuidv4();
  try {
    const result = await pool.query(
      'INSERT INTO customers (id, name, email, phone, company, agent_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, email, phone, company, agent_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating customer' });
  }
});

app.put('/api/customers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, agent_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE customers SET name=$1, email=$2, phone=$3, company=$4, agent_id=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
      [name, email, phone, company, agent_id || null, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating customer' });
  }
});

app.delete('/api/customers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM customers WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting customer' });
  }
});

app.post('/api/import-excel', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    let importados = 0;
    let errores = 0;

    for (const row of data) {
      try {
        const nombre = row.Nombre || row.nombre || 'Sin nombre';
        const email = row.Email || row.email || null;
        const telefono = row.Celular || row.celular || row.Teléfono || row.teléfono || null;
        const empresa = row.Empresa || row.empresa || null;

        if (!nombre.trim()) continue;

        const id = uuidv4();
        await pool.query(
          'INSERT INTO customers (id, name, email, phone, company) VALUES ($1, $2, $3, $4, $5)',
          [id, nombre, email, telefono, empresa]
        );
        importados++;
      } catch (err) {
        errores++;
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      importados: importados,
      errores: errores,
      total: data.length,
      mensaje: `Se importaron ${importados} clientes exitosamente`
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error importing file' });
  }
});

app.get('/api/customers/:customerId/interactions', authMiddleware, async (req, res) => {
  const { customerId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM interactions WHERE customer_id=$1 ORDER BY created_at DESC',
      [customerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching interactions' });
  }
});

app.post('/api/customers/:customerId/interactions', authMiddleware, async (req, res) => {
  const { customerId } = req.params;
  const { type, notes, quality_score, experience_rating, duration, result, next_call_date } = req.body;
  const id = uuidv4();

  try {
    const result_db = await pool.query(
      `INSERT INTO interactions (id, customer_id, user_id, type, notes, quality_score, experience_rating, duration, result, next_call_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, customerId, req.user.id, type, notes, quality_score, experience_rating, duration || null, result, next_call_date || null]
    );
    res.status(201).json(result_db.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creating interaction' });
  }
});

app.get('/api/analytics', authMiddleware, async (req, res) => {
  try {
    let customerQuery = 'SELECT COUNT(*) as total FROM customers';
    let params = [];

    if (req.user.role === 'agent') {
      const agentResult = await pool.query('SELECT id FROM agents WHERE user_id = $1', [req.user.id]);
      if (agentResult.rows.length > 0) {
        customerQuery = 'SELECT COUNT(*) as total FROM customers WHERE agent_id = $1';
        params = [agentResult.rows[0].id];
      }
    }

    const customers = await pool.query(customerQuery, params);
    const interactions = await pool.query('SELECT COUNT(*) as total FROM interactions');
    const avgQuality = await pool.query('SELECT AVG(quality_score) as avg FROM interactions WHERE quality_score IS NOT NULL');
    const avgExperience = await pool.query('SELECT AVG(experience_rating) as avg FROM interactions WHERE experience_rating IS NOT NULL');

    res.json({
      totalCustomers: customers.rows[0].total,
      totalInteractions: interactions.rows[0].total,
      avgQualityScore: parseFloat(avgQuality.rows[0].avg || 0).toFixed(1),
      avgExperienceRating: parseFloat(avgExperience.rows[0].avg || 0).toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// SPA - Servir index.html para rutas no encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), err => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

const PORT = process.env.PORT || 3001;
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});
