const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { validationResult } = require('express-validator');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    // Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName } = req.body;

    // Verificar si el usuario ya existe
    db.get(
      'SELECT id FROM users WHERE email = ?',
      [email],
      async (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (row) {
          return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Insertar usuario
        db.run(
          'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
          [email, passwordHash, fullName],
          function (err) {
            if (err) {
              return res
                .status(500)
                .json({ error: 'Error al crear el usuario' });
            }

            // Generar token
            const token = jwt.sign(
              { userId: this.lastID },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.status(201).json({
              message: 'Usuario registrado exitosamente',
              token,
              user: {
                id: this.lastID,
                email,
                fullName,
              },
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario
    db.get(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!isValidPassword) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: '24h',
        });

        res.json({
          message: 'Login exitoso',
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener perfil del usuario autenticado
exports.getProfile = (req, res) => {
  db.get(
    'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
    [req.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
      });
    }
  );
};
