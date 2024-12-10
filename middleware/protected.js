import jwt from 'jsonwebtoken'

const protectRoute = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ message: 'Akses masuk ditolak' });

    const token = authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Akses masuk ditolak' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Sesi login belum dibuat' });
  }
}

export default protectRoute